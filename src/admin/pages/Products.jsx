import { useState, useEffect, useRef, useMemo } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import { lazy, Suspense } from "react"
const JoditEditor = lazy(() => import("jodit-react"))
import { getProducts, createProduct, updateProduct, deleteProduct, deleteProductImage, getCategories, getUnits, getBrands, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const defaultForm = {
  name: "", category_id: "", brand_id: "", sku: "", tags: "",
  description: "", is_best_seller: 0, is_new_arrival: 0,
  is_featured: 0, status: 1
}

const defaultVariant = { unit_id: "", quantity: "", regular_price: "", selling_price: "", is_default: 0 }

function Products() {
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [units, setUnits]             = useState([])
  const [brands, setBrands]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(null)
  const [error, setError]             = useState("")
  const [success, setSuccess]         = useState("")
  const [showModal, setShowModal]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [viewItem, setViewItem]       = useState(null)
  const [form, setForm]               = useState(defaultForm)
  const [variants, setVariants]       = useState([{ ...defaultVariant }])
  const [newImages, setNewImages]     = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const fileRef = useRef()
  const joditConfig = useMemo(() => ({ height: 300, zIndex: 10100 }), [])

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, cData, uData, bData] = await Promise.all([
          getProducts(), getCategories(), getUnits(), getBrands()
        ])
        setProducts(pData.data || [])
        setCategories(cData.data || [])
        setUnits((uData.data || []).filter(u => u.status == 1))
        setBrands((bData.data || []).filter(b => b.status == 1))
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const addVariant    = () => setVariants(prev => [...prev, { ...defaultVariant }])
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i))
  const updateVariant = (i, key, val) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v))
  const setDefaultVariant = (i) =>
    setVariants(prev => prev.map((v, idx) => ({ ...v, is_default: idx === i ? 1 : 0 })))

  const openAdd = () => {
    setEditItem(null); setForm(defaultForm)
    setVariants([{ ...defaultVariant }])
    setNewImages([]); setNewPreviews([]); setError("")
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditItem(p)
    setForm({
      name: p.name || "", category_id: p.category_id || "",
      brand_id: p.brand_id || "", sku: p.sku || "", tags: p.tags || "",
      description: p.description || "",
      is_best_seller: p.is_best_seller || 0,
      is_new_arrival: p.is_new_arrival || 0,
      is_featured: p.is_featured || 0, status: p.status ?? 1
    })
    setVariants(p.variants?.length > 0
      ? p.variants.map(v => ({
          id: v.id, unit_id: v.unit_id, quantity: v.quantity,
          regular_price: v.regular_price, selling_price: v.selling_price,
          is_default: v.is_default
        }))
      : [{ ...defaultVariant }]
    )
    setNewImages([]); setNewPreviews([]); setError("")
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError("") }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)
    setNewPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleDeleteImage = async (imgId) => {
    if (!window.confirm("Delete this image?")) return
    try {
      await deleteProductImage(imgId)
      setEditItem(prev => ({ ...prev, images: prev.images.filter(i => i.id !== imgId) }))
    } catch (err) { setError(err.message) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim())    { setError("Product name is required."); return }
    if (!form.category_id)    { setError("Category is required."); return }
    if (variants.some(v => !v.quantity || !v.unit_id || !v.regular_price || !v.selling_price)) {
      setError("All variants must have quantity, unit, regular price and selling price."); return
    }
    setSaving(true); setError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""))
      newImages.forEach(f => fd.append("images[]", f))
      fd.append("variants", JSON.stringify(variants))

      let data
      if (editItem) {
        data = await updateProduct(editItem.id, fd)
        setProducts(prev => prev.map(p => p.id === editItem.id ? data.data : p))
        setSuccess("Product updated successfully!")
      } else {
        data = await createProduct(fd)
        setProducts(prev => [data.data, ...prev])
        setSuccess("Product added successfully!")
      }
      closeModal()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    setDeleting(id)
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setSuccess("Product deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setDeleting(null) }
  }

  const f = (key) => ({ value: form[key] ?? "", onChange: e => setForm({ ...form, [key]: e.target.value }) })
  const primaryImg  = (p) => p.primary_image?.image_url || "/admin-assets/images/placeholder.png"
  const defaultPrice = (p) => {
    if (!p.variants?.length) return '—'
    const def = p.variants.find(v => v.is_default == 1) || p.variants[0]
    return def ? `$${def.selling_price}` : '—'
  }
  const variantLabel = (v) => `${v.quantity} ${v.unit_name || ''}`

  return (
    <>
      <AdminPageHeader
        icon="fa-box"
        title="Products"
        subtitle="Manage your product catalog"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={openAdd}>
            <i className="fa fa-plus me-2" />Add Product
          </button>
        }
      />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && !showModal && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-3">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : (
            <DataTable className="table table-hover mb-0 w-100"
              options={{ ...dtOptions, columnDefs: [{ targets: '_all', defaultContent: '' }, { orderable: false, targets: [1, 7] }] }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price (default)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No products found</td></tr>
                ) : products.map((p, i) => (
                  <tr key={p.id}>
                    <td className="align-middle">{i + 1}</td>
                    <td>
                      <img src={primaryImg(p)} alt={p.name}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                        style={{ width: 45, height: 45, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </td>
                    <td className="align-middle">
                      <div className="fw-semibold">{p.name}</div>
                      <small className="text-muted">{p.sku}</small>
                    </td>
                    <td className="align-middle">{p.category_name}</td>
                    <td className="align-middle">{p.brand_name || '—'}</td>
                    <td className="align-middle fw-semibold text-success">{defaultPrice(p)}</td>
                    <td className="align-middle">
                      <span className={`badge ${p.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {p.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-info me-1" onClick={() => setViewItem(p)}><i className="fa fa-eye" /></button>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><i className="fa fa-edit" /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                        {deleting === p.id ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-trash" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editItem ? "Edit Product" : "Add Product"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger py-2 d-flex gap-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}
                    <div className="row">

                      {/* Images */}
                      <div className="col-12 mb-3">
                        <label className="form-label small text-secondary">Product Images</label>
                        {editItem?.images?.length > 0 && (
                          <div className="d-flex gap-2 flex-wrap mb-2">
                            {editItem.images.map(img => (
                              <div key={img.id} style={{ position: 'relative' }}>
                                <img src={img.image_url || "/admin-assets/images/placeholder.png"}
                                  onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8,
                                    border: img.is_primary ? '2px solid #0e606c' : '1px solid #e2e8f0' }} />
                                {img.is_primary && <span style={{ position: 'absolute', top: 2, left: 2, background: '#0e606c', color: '#fff', fontSize: 8, padding: '1px 4px', borderRadius: 3 }}>Main</span>}
                                <button type="button" onClick={() => handleDeleteImage(img.id)}
                                  style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                                    background: '#dc3545', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fa fa-times" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {newPreviews.length > 0 && (
                          <div className="d-flex gap-2 flex-wrap mb-2">
                            {newPreviews.map((src, i) => (
                              <img key={i} src={src} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px dashed #0e606c' }} />
                            ))}
                          </div>
                        )}
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current.click()}>
                          <i className="fa fa-upload me-2" />Upload Images
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImagesChange} />
                        <small className="text-muted ms-2">First image will be primary</small>
                      </div>

                      {/* Name */}
                      <div className="col-md-8 mb-3">
                        <label className="form-label small text-secondary">Product Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" placeholder="Enter product name" {...f('name')} required />
                      </div>

                      {/* SKU */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label small text-secondary">SKU <small className="text-muted">(auto if empty)</small></label>
                        <input type="text" className="form-control" placeholder="e.g. VEG-CAR-001" {...f('sku')} />
                      </div>

                      {/* Category */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label small text-secondary">Category <span className="text-danger">*</span></label>
                        <select className="form-select" {...f('category_id')} required>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                        </select>
                      </div>

                      {/* Brand */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label small text-secondary">Brand</label>
                        <select className="form-select" {...f('brand_id')}>
                          <option value="">Select Brand</option>
                          {brands.map(b => <option key={b.id} value={b.id}>{b.brand_name}</option>)}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="col-md-8 mb-3">
                        <label className="form-label small text-secondary">Tags <small className="text-muted">(comma separated)</small></label>
                        <input type="text" className="form-control" placeholder="chicken, fresh, organic" {...f('tags')} />
                      </div>

                      {/* Status */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label small text-secondary">Status</label>
                        <select className="form-select" {...f('status')}>
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>

                      {/* Variants */}
                      <div className="col-12 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-semibold text-secondary mb-0">
                            Variants <span className="text-danger">*</span>
                            <small className="text-muted fw-normal ms-1">(Unit + Price)</small>
                          </label>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addVariant}>
                            <i className="fa fa-plus me-1" />Add Variant
                          </button>
                        </div>
                        <div className="border rounded p-3" style={{ background: '#f8fafc' }}>
                          <div className="row g-2 mb-1">
                            <div className="col-md-2"><small className="text-secondary">Qty <span className="text-danger">*</span></small></div>
                            <div className="col-md-2"><small className="text-secondary">Unit <span className="text-danger">*</span></small></div>
                            <div className="col-md-3"><small className="text-secondary">Regular Price ($) <span className="text-danger">*</span></small></div>
                            <div className="col-md-3"><small className="text-secondary">Selling Price ($) <span className="text-danger">*</span></small></div>
                            <div className="col-md-2"><small className="text-secondary">Default</small></div>
                          </div>
                          {variants.map((v, i) => (
                            <div key={i} className="row g-2 align-items-center mb-2">
                              <div className="col-md-2">
                                <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                                  placeholder="e.g. 5" value={v.quantity}
                                  onChange={e => updateVariant(i, 'quantity', e.target.value)} required />
                              </div>
                              <div className="col-md-2">
                                <select className="form-select form-select-sm" value={v.unit_id}
                                  onChange={e => updateVariant(i, 'unit_id', e.target.value)} required>
                                  <option value="">Unit</option>
                                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                              </div>
                              <div className="col-md-3">
                                <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                                  placeholder="Required" value={v.regular_price}
                                  onChange={e => updateVariant(i, 'regular_price', e.target.value)} required />
                              </div>
                              <div className="col-md-3">
                                <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                                  placeholder="Required" value={v.selling_price}
                                  onChange={e => updateVariant(i, 'selling_price', e.target.value)} required />
                              </div>
                              <div className="col-md-2 d-flex align-items-center gap-2">
                                <div className="form-check mb-0">
                                  <input className="form-check-input" type="radio" name="default_variant"
                                    checked={v.is_default == 1} onChange={() => setDefaultVariant(i)} />
                                  <label className="form-check-label small">Default</label>
                                </div>
                                {variants.length > 1 && (
                                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeVariant(i)}>
                                    <i className="fa fa-times" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <small className="text-muted">Example: 5 + kg = "5 kg" | 200 + ml = "200 ml"</small>
                      </div>

                      {/* Description */}
                      <div className="col-12 mb-3">
                        <label className="form-label small text-secondary">Description</label>
                        <Suspense fallback={
                          <div className="border rounded p-2 text-muted small" style={{ minHeight: 80 }}>
                            Loading editor...
                          </div>
                        }>
                          <JoditEditor
                            config={joditConfig}
                            value={form.description}
                            onBlur={content => setForm({ ...form, description: content })}
                          />
                        </Suspense>
                      </div>

                      {/* Flags */}
                      <div className="col-12">
                        <label className="form-label small text-secondary d-block">Product Flags</label>
                        <div className="d-flex gap-4">
                          {[['is_best_seller','best_seller','Best Seller'],['is_new_arrival','new_arrival','New Arrival'],['is_featured','featured','Featured']].map(([key, id, label]) => (
                            <div className="form-check" key={id}>
                              <input className="form-check-input" type="checkbox" id={id}
                                checked={form[key] == 1}
                                onChange={e => setForm({ ...form, [key]: e.target.checked ? 1 : 0 })} />
                              <label className="form-check-label small" htmlFor={id}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn text-white" style={{ background: '#0e606c' }} disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Product"}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeModal} />
        </>
      )}

      {/* ── View Modal ── */}
      {viewItem && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">View Product</h5>
                  <button type="button" className="btn-close" onClick={() => setViewItem(null)} />
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4">
                      <img src={primaryImg(viewItem)}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                        className="img-fluid rounded border w-100" style={{ objectFit: 'cover', maxHeight: 280 }} alt={viewItem.name} />
                      {viewItem.images?.length > 1 && (
                        <div className="d-flex gap-2 flex-wrap mt-2">
                          {viewItem.images.map(img => (
                            <img key={img.id} src={img.image_url || "/admin-assets/images/placeholder.png"}
                              onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h4 className="fw-bold mb-1">{viewItem.name}</h4>
                          <small className="text-muted">
                            SKU: {viewItem.sku || '—'}
                            {viewItem.brand_name && ` | Brand: ${viewItem.brand_name}`}
                          </small>
                        </div>
                        <span className={`badge ${viewItem.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                          {viewItem.status == 1 ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <div className="border rounded p-2">
                            <small className="text-muted">Category</small>
                            <div className="fw-semibold">{viewItem.category_name || '—'}</div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="border rounded p-2">
                            <small className="text-muted">Tags</small>
                            <div className="fw-semibold">{viewItem.tags || '—'}</div>
                          </div>
                        </div>
                      </div>
                      {viewItem.variants?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-semibold mb-2">Variants</h6>
                          <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                              <tr><th>Qty & Unit</th><th>Regular Price</th><th>Selling Price</th><th>Default</th></tr>
                            </thead>
                            <tbody>
                              {viewItem.variants.map((v, i) => (
                                <tr key={i}>
                                  <td className="fw-semibold">{variantLabel(v)}</td>
                                  <td>{v.regular_price > 0 ? <s className="text-muted">${v.regular_price}</s> : '—'}</td>
                                  <td className="text-success fw-semibold">${v.selling_price}</td>
                                  <td>{v.is_default == 1 ? <span className="badge bg-primary">Default</span> : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="d-flex gap-2 flex-wrap">
                        {viewItem.is_best_seller == 1 && <span className="badge bg-warning text-dark">Best Seller</span>}
                        {viewItem.is_new_arrival == 1 && <span className="badge bg-info text-dark">New Arrival</span>}
                        {viewItem.is_featured == 1 && <span className="badge bg-primary">Featured</span>}
                      </div>
                    </div>
                  </div>
                  {viewItem.description && (
                    <div className="border rounded p-3 mt-3">
                      <h6 className="fw-semibold mb-2">Description</h6>
                      <div dangerouslySetInnerHTML={{ __html: viewItem.description }} />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={() => setViewItem(null)}>Close</button>
                  <button className="btn text-white" style={{ background: '#0e606c' }}
                    onClick={() => { setViewItem(null); openEdit(viewItem) }}>
                    <i className="fa fa-edit me-2" />Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setViewItem(null)} />
        </>
      )}
    </>
  )
}

export default Products
