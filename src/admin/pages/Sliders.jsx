import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import { getSliders, createSlider, updateSlider, deleteSlider, updateSliderStatus, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const defaultForm = { title: "", status: 1 }

function Sliders() {
  const [sliders, setSliders]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(defaultForm)
  const [image, setImage]         = useState(null)
  const [preview, setPreview]     = useState("")
  const fileRef = useRef()

  useEffect(() => { loadSliders() }, [])

  const loadSliders = async () => {
    setLoading(true)
    try {
      const res = await getSliders()
      setSliders(res.data || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditItem(null); setForm(defaultForm)
    setImage(null); setPreview(""); setError("")
    setShowModal(true)
  }

  const openEdit = (s) => {
    setEditItem(s)
    setForm({ title: s.title || "", status: s.status ?? 1 })
    setImage(null); setPreview(""); setError("")
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError("") }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editItem && !image) { setError("Slider image is required."); return }

    setSaving(true); setError("")
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("status", form.status)
      if (image) fd.append("image", image)

      if (editItem) {
        await updateSlider(editItem.id, fd)
        setSuccess("Slider updated successfully!")
      } else {
        await createSlider(fd)
        setSuccess("Slider added successfully!")
      }
      closeModal()
      loadSliders()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slider?")) return
    setDeleting(id)
    try {
      await deleteSlider(id)
      setSliders(prev => prev.filter(s => s.id !== id))
      setSuccess("Slider deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setDeleting(null) }
  }

  const toggleStatus = async (s) => {
    const newStatus = s.status == 1 ? 0 : 1
    try {
      await updateSliderStatus(s.id, newStatus)
      setSliders(prev => prev.map(x => x.id === s.id ? { ...x, status: newStatus } : x))
    } catch (err) { setError(err.message) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-images"
        title="Sliders"
        subtitle="Manage homepage banner sliders"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={openAdd}>
            <i className="fa fa-plus me-2" />Add Slider
          </button>
        }
      />

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && !showModal && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-3 table-responsive">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading...</div>
          ) : (
            <DataTable className="table table-hover mb-0 w-100"
              options={{ ...dtOptions, columnDefs: [{ targets: '_all', defaultContent: '' }, { orderable: false, targets: [1, 4] }] }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sliders.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No sliders found</td></tr>
                ) : sliders.map((s, i) => (
                  <tr key={s.id}>
                    <td className="align-middle">{i + 1}</td>
                    <td style={{ width: "40%" }}>
                      <div >
                      <img src={s.image_url || "/admin-assets/images/placeholder.png"} alt={s.title}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                        className="img-fluid" />
                      </div>
                    </td>
                    <td className="align-middle">{s.title || '—'}</td>
                    <td className="align-middle">
                      <span className={`badge ${s.status == 1 ? 'bg-success' : 'bg-secondary'}`}
                        role="button" onClick={() => toggleStatus(s)} style={{ cursor: 'pointer' }}>
                        {s.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(s)}><i className="fa fa-edit" /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)} disabled={deleting === s.id}>
                        {deleting === s.id ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-trash" />}
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editItem ? "Edit Slider" : "Add Slider"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger py-2 d-flex gap-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

                    {/* Image */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Slider Image {!editItem && <span className="text-danger">*</span>}</label>

                      {editItem?.image_url && !preview && (
                        <div className="mb-2">
                          <img src={editItem.image_url} alt={editItem.title}
                            onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        </div>
                      )}

                      {preview && (
                        <div className="mb-2">
                          <img src={preview} alt="preview"
                            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px dashed #0e606c' }} />
                        </div>
                      )}

                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                        <i className="fa fa-upload me-2" />{editItem ? "Replace Image" : "Upload Image"}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                      <small className="text-muted ms-2">Recommended: 1920x600px</small>
                    </div>

                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Title</label>
                      <input type="text" className="form-control" placeholder="Enter slider title"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Status</label>
                      <select className="form-select" value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn text-white" style={{ background: '#0e606c' }} disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Slider"}</>}
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

export default Sliders