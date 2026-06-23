import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import { getCategories, createCategory, updateCategory, deleteCategory, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(null)
  const [error, setError]           = useState("")
  const [success, setSuccess]       = useState("")

  const [showModal, setShowModal]       = useState(false)
  const [editItem, setEditItem]         = useState(null)
  const [form, setForm]                 = useState({ category_name: "", status: 1 })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadCategories() }, [])

  const openAdd = () => {
    setEditItem(null)
    setForm({ category_name: "", status: 1 })
    setImageFile(null); setImagePreview(null); setError("")
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditItem(cat)
    setForm({ category_name: cat.category_name, status: cat.status })
    setImageFile(null); setImagePreview(cat.image || null); setError("")
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError("") }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.category_name.trim()) { setError("Category name is required."); return }
    setSaving(true); setError("")
    try {
      const formData = new FormData()
      formData.append("category_name", form.category_name)
      formData.append("status", form.status)
      if (imageFile) formData.append("image", imageFile)

      if (editItem) {
        const data = await updateCategory(editItem.id, formData)
        setCategories(prev => prev.map(c => c.id === editItem.id ? data.data : c))
        setSuccess("Category updated successfully!")
      } else {
        const data = await createCategory(formData)
        setCategories(prev => [data.data, ...prev])
        setSuccess("Category added successfully!")
      }
      closeModal()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    setDeleting(id)
    try {
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      setSuccess("Category deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Delete failed.")
    } finally { setDeleting(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-layer-group"
        title="Categories"
        subtitle="Manage product categories"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={openAdd}>
            <i className="fa fa-plus me-2" />Add Category
          </button>
        }
      />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2">
          <i className="fa fa-check-circle" /><small>{success}</small>
        </div>
      )}
      {error && !showModal && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
          <i className="fa fa-exclamation-circle" /><small>{error}</small>
        </div>
      )}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-3 table-responsive">

          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" />Loading...
            </div>
          ) : (
            <DataTable
              className="table table-striped table-bordered table-hover"
              options={{
                ...dtOptions,
                columnDefs: [
                  { orderable: false, targets: [1, 4] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <></>
                ) : categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td>
                      <img
                        src={cat.image || "/admin-assets/images/placeholder.png"}
                        alt={cat.category_name}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                        style={{width:45, height:45, borderRadius:8, objectFit:'cover', border:'1px solid #e2e8f0'}}
                      />
                    </td>
                    <td className="align-middle fw-semibold">{cat.category_name}</td>
                    <td className="align-middle">
                      <span className={`badge ${cat.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {cat.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(cat)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}>
                        {deleting === cat.id
                          ? <span className="spinner-border spinner-border-sm" />
                          : <i className="fa fa-trash" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}

        </div>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editItem ? "Edit Category" : "Add Category"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">

                    {error && (
                      <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                        <i className="fa fa-exclamation-circle" /><small>{error}</small>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div style={{position:'relative', display:'inline-block'}}>
                        <img
                          src={imagePreview || "/admin-assets/images/placeholder.png"}
                          alt="Category"
                          onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                          style={{width:90, height:90, borderRadius:10, objectFit:'cover', border:'2px solid #e2e8f0'}}
                        />
                        <button type="button" onClick={() => fileRef.current.click()}
                          style={{position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%',
                            background:'#0e606c', border:'2px solid #fff', color:'#fff', cursor:'pointer',
                            fontSize:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <i className="fa fa-camera" />
                        </button>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
                      <div className="mt-2" style={{fontSize:12, color:'#a0aec0'}}>Click camera to change image</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary">Category Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Enter category name"
                        value={form.category_name}
                        onChange={e => setForm({...form, category_name: e.target.value})} required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary">Status</label>
                      <select className="form-select" value={form.status}
                        onChange={e => setForm({...form, status: e.target.value})}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn text-white" style={{background:'#0e606c'}} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Category"}</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeModal} />
        </>
      )}
    </>
  )
}

export default Categories
