import { useState, useEffect } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import { getSizes, createSize, updateSize, deleteSize, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const defaultForm = { label: "", sort_order: "", status: 1 }

function Sizes() {
  const [sizes, setSizes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(defaultForm)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSizes()
        setSizes(data.data || [])
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const openAdd = () => {
    setEditItem(null); setForm(defaultForm); setError("")
    setShowModal(true)
  }

  const openEdit = (s) => {
    setEditItem(s)
    setForm({ label: s.label, sort_order: s.sort_order, status: s.status })
    setError(""); setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError("") }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) { setError("Label is required."); return }
    setSaving(true); setError("")
    try {
      if (editItem) {
        const data = await updateSize(editItem.id, form)
        setSizes(prev => prev.map(s => s.id === editItem.id ? data.data : s))
        setSuccess("Size updated successfully!")
      } else {
        const data = await createSize(form)
        setSizes(prev => [...prev, data.data])
        setSuccess("Size added successfully!")
      }
      closeModal()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) return
    setDeleting(id)
    try {
      await deleteSize(id)
      setSizes(prev => prev.filter(s => s.id !== id))
      setSuccess("Size deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message || "Delete failed.") }
    finally { setDeleting(null) }
  }

  const f = (key) => ({
    value: form[key] ?? "",
    onChange: e => setForm({ ...form, [key]: e.target.value })
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="app-page-title mb-0">Sizes</h1>
        <button className="btn text-white" style={{ background: '#0e606c', borderRadius: 8 }} onClick={openAdd}>
          <i className="fa fa-plus me-2" />Add Size
        </button>
      </div>

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

      <div className="app-card shadow-sm table-responsive">
        <div className="app-card-body p-3">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" />Loading...
            </div>
          ) : (
            <DataTable
              className="table table-hover mb-0 w-100"
              options={{
                ...dtOptions,
                columnDefs: [
                  { targets: '_all', defaultContent: '' },
                  { orderable: false, targets: [3] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Label</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sizes.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No sizes found</td></tr>
                ) : sizes.map((s, i) => (
                  <tr key={s.id}>
                    <td className="align-middle">{i + 1}</td>
                    <td className="align-middle">
                      <span className="badge border text-black fs-6 fw-normal">{s.label}</span>
                    </td>
                    <td className="align-middle">{s.sort_order}</td>
                    <td className="align-middle">
                      <span className={`badge ${s.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {s.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(s)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(s.id)} disabled={deleting === s.id}>
                        {deleting === s.id
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

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editItem ? "Edit Size" : "Add Size"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">

                    {error && (
                      <div className="alert alert-danger py-2 d-flex gap-2">
                        <i className="fa fa-exclamation-circle" /><small>{error}</small>
                      </div>
                    )}

                    {/* Label */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">
                        Label <span className="text-danger">*</span>
                        <small className="text-muted ms-1">(e.g. 1kg, 500ml, 1 dozen)</small>
                      </label>
                      <input type="text" className="form-control"
                        placeholder="e.g. 1kg, 500ml, 1 case (24 pcs)"
                        {...f('label')} required />
                    </div>

                    {/* Sort Order */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">
                        Sort Order
                        <small className="text-muted ms-1">(chhota number pehle dikhega)</small>
                      </label>
                      <input type="number" className="form-control"
                        placeholder="0" {...f('sort_order')} />
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label small text-secondary">Status</label>
                      <select className="form-select" {...f('status')}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn text-white"
                      style={{ background: '#0e606c' }} disabled={saving}>
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Size"}</>
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

export default Sizes
