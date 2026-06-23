import { useState, useEffect } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import { getUnits, createUnit, updateUnit, deleteUnit, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const defaultForm = { name: "", status: 1 }

function Units() {
  const [units, setUnits]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(defaultForm)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUnits()
        setUnits(data.data || [])
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const openAdd = () => {
    setEditItem(null); setForm(defaultForm); setError("")
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditItem(u)
    setForm({ name: u.name, status: u.status })
    setError(""); setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError("") }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Unit name is required."); return }
    setSaving(true); setError("")
    try {
      if (editItem) {
        const data = await updateUnit(editItem.id, form)
        setUnits(prev => prev.map(u => u.id === editItem.id ? data.data : u))
        setSuccess("Unit updated successfully!")
      } else {
        const data = await createUnit(form)
        setUnits(prev => [...prev, data.data])
        setSuccess("Unit added successfully!")
      }
      closeModal()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return
    setDeleting(id)
    try {
      await deleteUnit(id)
      setUnits(prev => prev.filter(u => u.id !== id))
      setSuccess("Unit deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message || "Delete failed.") }
    finally { setDeleting(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-ruler"
        title="Units"
        subtitle="Manage measurement units"
        right={
          <button className="btn text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 8 }} onClick={openAdd}>
            <i className="fa fa-plus me-2" />Add Unit
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
                  { orderable: false, targets: [2] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Unit Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No units found</td></tr>
                ) : units.map((u, i) => (
                  <tr key={u.id}>
                    <td className="align-middle">{i + 1}</td>
                    <td className="align-middle">
                      <span className="badge border text-black fs-6 fw-normal px-3 py-2"> 
                        {u.name}
                      </span>
                    </td>
                    <td className="align-middle">
                      <span className={`badge ${u.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {u.status == 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(u)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)} disabled={deleting === u.id}>
                        {deleting === u.id
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
                  <h5 className="modal-title">{editItem ? "Edit Unit" : "Add Unit"}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">

                    {error && (
                      <div className="alert alert-danger py-2 d-flex gap-2">
                        <i className="fa fa-exclamation-circle" /><small>{error}</small>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-secondary">
                        Unit Name <span className="text-danger">*</span>
                        <small className="text-muted ms-1">(e.g. kg, L, piece, dozen)</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. kg, ml, piece, case"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-secondary">Status</label>
                      <select className="form-select"
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
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
                        : <><i className="fa fa-save me-2" />{editItem ? "Update" : "Add Unit"}</>
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

export default Units
