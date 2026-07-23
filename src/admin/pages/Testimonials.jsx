// src/admin/pages/Testimonials.jsx
import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(null)
  const [error, setError]               = useState("")
  const [success, setSuccess]           = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm] = useState({
    name: "", designation: "", description: "", rating: 5, status: 1, sort_order: 0
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const data = await getTestimonials()
      setTestimonials(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadTestimonials() }, [])

  const openAdd = () => {
    setEditItem(null)
    setForm({ name: "", designation: "", description: "", rating: 5, status: 1, sort_order: 0 })
    setImageFile(null); setImagePreview(null); setError("")
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditItem(t)
    setForm({
      name: t.name,
      designation: t.designation || "",
      description: t.description || "",
      rating: t.rating ?? 5,
      status: t.status,
      sort_order: t.sort_order ?? 0
    })
    setImageFile(null); setImagePreview(t.image || null); setError("")
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
    if (!form.name.trim()) { setError("Name is required."); return }
    setSaving(true); setError("")
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("designation", form.designation)
      formData.append("description", form.description)
      formData.append("rating", form.rating)
      formData.append("status", form.status)
      formData.append("sort_order", form.sort_order)
      if (imageFile) formData.append("image", imageFile)

      if (editItem) {
        const data = await updateTestimonial(editItem.id, formData)
        setTestimonials(prev => prev.map(t => t.id === editItem.id ? data.data : t))
        setSuccess("Testimonial updated successfully!")
      } else {
        const data = await createTestimonial(formData)
        setTestimonials(prev => [data.data, ...prev])
        setSuccess("Testimonial added successfully!")
      }
      closeModal()
      loadTestimonials()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return
    setDeleting(id)
    try {
      await deleteTestimonial(id)
      setTestimonials(prev => prev.filter(t => t.id !== id))
      setSuccess("Testimonial deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Delete failed.")
    } finally { setDeleting(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-quote-right"
        title="Testimonials"
        subtitle="Manage customer testimonials"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={openAdd}>
            <i className="fa fa-plus me-2" />Add Testimonial
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
                  { orderable: false, targets: [1, 6] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t, index) => (
                  <tr key={t.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td>
                      <img
                        src={t.image || "/admin-assets/images/placeholder.png"}
                        alt={t.name}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                        style={{width:45, height:45, borderRadius:'50%', objectFit:'cover', border:'1px solid #e2e8f0'}}
                      />
                    </td>
                    <td className="align-middle fw-semibold">{t.name}</td>
                    <td className="align-middle text-muted">{t.designation}</td>
                    <td className="align-middle fw-bold text-primary">{t.sort_order ?? 0}</td>
                    <td className="align-middle">
                      <span className={`badge ${t.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {t.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle text-nowrap">
                      <button className="btn btn-sm btn-outline-primary m-1" onClick={() => openEdit(t)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger m-1" onClick={() => handleDelete(t.id)} disabled={deleting === t.id}>
                        {deleting === t.id
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
                  <h5 className="modal-title">{editItem ? "Edit Testimonial" : "Add Testimonial"}</h5>
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
                          alt="Testimonial"
                          onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                          style={{width:90, height:90, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0'}}
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

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small text-secondary">Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" placeholder="Enter customer name"
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})} required />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label small text-secondary">Designation</label>
                        <input type="text" className="form-control" placeholder="e.g. Engineer, Customer"
                          value={form.designation}
                          onChange={e => setForm({...form, designation: e.target.value})} />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary">Testimonial Text</label>
                      <textarea className="form-control" rows="4" placeholder="What did they say?"
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})} />
                    </div>

                    <div className="row">
                      {/*<div className="col-6 mb-3">
                        <label className="form-label small text-secondary">Rating (1-5)</label>
                        <input type="number" min="1" max="5" className="form-control"
                          value={form.rating}
                          onChange={e => setForm({...form, rating: e.target.value})} />
                      </div>*/}
                      <div className="col-6 mb-3">
                        <label className="form-label small text-secondary">Sort Order</label>
                        <input type="number" min="0" className="form-control" placeholder="0"
                          value={form.sort_order}
                          onChange={e => setForm({...form, sort_order: e.target.value})} />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label small text-secondary">Status</label>
                        <select className="form-select" value={form.status}
                          onChange={e => setForm({...form, status: e.target.value})}>
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn text-white" style={{background:'#0e606c'}} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Testimonial"}</>
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

export default Testimonials
