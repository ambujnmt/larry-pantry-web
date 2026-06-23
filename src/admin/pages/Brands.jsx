import { useState, useEffect } from "react"
import DataTable from "datatables.net-react"
import DT from 'datatables.net-bs5'
import { getBrands, createBrand, updateBrand, deleteBrand, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)
const defaultForm = { brand_name: "", status: 1 }

function Brands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [msg, setMsg] = useState({ success: "", error: "" })
  const [modal, setModal] = useState({ show: false, isEdit: false, id: null })
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { loadBrands() }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const res = await getBrands()
      setBrands(res.data || [])
    } catch (err) { showMsg(err.message, "error") }
    finally { setLoading(false) }
  }

  const showMsg = (text, type = "success") => {
    setMsg(prev => ({ ...prev, [type]: text }))
    if (type === "success") setTimeout(() => setMsg({ success: "", error: "" }), 3000)
  }

  const openModal = (brand = null) => {
    setForm(brand ? { brand_name: brand.brand_name || "", status: brand.status ?? 1 } : defaultForm)
    setMsg({ success: "", error: "" })
    setModal({ show: true, isEdit: !!brand, id: brand?.id || null })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.brand_name.trim()) return setMsg(p => ({ ...p, error: "Brand name is required." }))

    try {
      const res = modal.isEdit ? await updateBrand(modal.id, form) : await createBrand(form)
      setBrands(prev => modal.isEdit ? prev.map(b => b.id === modal.id ? res.data : b) : [res.data, ...prev])
      showMsg(`Brand ${modal.isEdit ? "updated" : "added"} successfully!`)
      setModal({ show: false, isEdit: false, id: null })
    } catch (err) { setMsg(p => ({ ...p, error: err.message || "Something went wrong." })) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return
    setDeletingId(id)
    try {
      await deleteBrand(id)
      setBrands(prev => prev.filter(b => b.id !== id))
      showMsg("Brand deleted successfully!")
    } catch (err) { showMsg(err.message || "Delete failed.", "error") }
    finally { setDeletingId(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-tag"
        title="Brands"
        subtitle="Manage product brands"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={() => openModal()}>
            <i className="fa fa-plus me-2" />Add Brand
          </button>
        }
      />

      {msg.success && <div className="alert alert-success py-2"><i className="fa fa-check-circle me-2" />{msg.success}</div>}
      {msg.error && !modal.show && <div className="alert alert-danger py-2"><i className="fa fa-exclamation-circle me-2" />{msg.error}</div>}

      <div className="app-card shadow-sm table-responsive p-3">
        {loading ? (
          <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
        ) : (
          <DataTable className="table table-hover mb-0 w-100" options={{ ...dtOptions, columnDefs: [{ targets: "_all", defaultContent: "" }, { orderable: false, targets: [3] }] }}>
            <thead><tr><th>#</th><th>Brand Name</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No brands found</td></tr>
              ) : (
                brands.map((brand, i) => (
                  <tr key={brand.id}>
                    <td className="align-middle">{i + 1}</td>
                    <td className="align-middle"><span className="badge border text-black fs-6 fw-normal">{brand.brand_name}</span></td>
                    <td className="align-middle"><span className={`badge ${brand.status == 1 ? "bg-success" : "bg-secondary"}`}>{brand.status == 1 ? "Active" : "Inactive"}</span></td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(brand)}><i className="fa fa-edit" /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(brand.id)} disabled={deletingId === brand.id}>
                        {deletingId === brand.id ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-trash" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        )}
      </div>

      {modal.show && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal.isEdit ? "Edit Brand" : "Add Brand"}</h5>
                <button type="button" className="btn-close" onClick={() => setModal({ show: false, isEdit: false, id: null })} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {msg.error && <div className="alert alert-danger py-2"><i className="fa fa-exclamation-circle me-2" />{msg.error}</div>}
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Brand Name<span className="text-danger"> *</span></label>
                    <input type="text" className="form-control" value={form.brand_name} onChange={e => setForm({ ...form, brand_name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: Number(e.target.value) })}>
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal({ show: false, isEdit: false, id: null })}>Cancel</button>
                  <button type="submit" className="btn text-white" style={{ background: "#0e606c" }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Brands;
