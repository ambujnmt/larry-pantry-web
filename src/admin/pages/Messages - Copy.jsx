// src/admin/pages/Messages.jsx
import { useState, useEffect } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import { getContactMessages, getContactMessage, deleteContactMessage, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"
import { formatDate, formatDateTime  } from '../../utils/helpers';

DataTable.use(DT)

function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  const [showModal, setShowModal]     = useState(false)
  const [viewItem, setViewItem]       = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await getContactMessages()
      setMessages(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadMessages() }, [])

  const openView = async (msg) => {
    setShowModal(true)
    setViewLoading(true)
    setViewItem(msg)
    try {
      // API call jo message ko "read" mark bhi karti hai
      const data = await getContactMessage(msg.id)
      setViewItem(data.data)
      // list mein bhi status update kar dein (badge turant refresh ho jaye)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 1 } : m))
    } catch (err) {
      setError(err.message)
    } finally { setViewLoading(false) }
  }

  const closeModal = () => { setShowModal(false); setViewItem(null) }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return
    setDeleting(id)
    try {
      await deleteContactMessage(id)
      setMessages(prev => prev.filter(m => m.id !== id))
      setSuccess("Message deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
      if (viewItem?.id === id) closeModal()
    } catch (err) {
      setError(err.message || "Delete failed.")
    } finally { setDeleting(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-envelope"
        title="Contact Messages"
        subtitle="View and manage enquiries received from the website"
      />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2">
          <i className="fa fa-check-circle" /><small>{success}</small>
        </div>
      )}
      {error && (
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
                // order: [[0, 'desc']],
                columnDefs: [
                  { orderable: false, targets: [6] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <></>
                ) : messages.map((msg, index) => (
                  <tr key={msg.id} style={{ cursor: 'pointer' }}>
                    <td className="align-middle" onClick={() => openView(msg)}>{index + 1}</td>
                    <td className="align-middle fw-semibold" onClick={() => openView(msg)}>{msg.name}</td>
                    <td className="align-middle" onClick={() => openView(msg)}>{msg.email}</td>
                    <td className="align-middle" onClick={() => openView(msg)}>{msg.phone || '-'}</td>
                    <td className="align-middle" onClick={() => openView(msg)}>{formatDate(msg.created_at)}</td>
                    <td className="align-middle" onClick={() => openView(msg)}>
                      <span className={`badge ${msg.status == 1 ? 'bg-secondary' : 'bg-success'}`}>
                        {msg.status == 1 ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-outline-primary m-1" onClick={() => openView(msg)}>
                        <i className="fa fa-eye" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger m-1" onClick={() => handleDelete(msg.id)} disabled={deleting === msg.id}>
                        {deleting === msg.id
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

      {/* View Message Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fa fa-envelope-open-text me-2" />Message Details
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  {viewLoading ? (
                    <div className="text-center py-4">
                      <span className="spinner-border spinner-border-sm me-2" />Loading...
                    </div>
                  ) : viewItem && (
                    <>
                      <div className="mb-3">
                        <label className="form-label small text-secondary mb-1">Name</label>
                        <p className="fw-semibold mb-0">{viewItem.name}</p>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6">
                          <label className="form-label small text-secondary mb-1">Email</label>
                          <p className="mb-0"><a href={`mailto:${viewItem.email}`}>{viewItem.email}</a></p>
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-secondary mb-1">Phone</label>
                          <p className="mb-0">
                            {viewItem.phone ? <a href={`tel:${viewItem.phone}`}>{viewItem.phone}</a> : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-secondary mb-1">Message</label>
                        <p className="mb-0" style={{ whiteSpace: 'pre-line', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                          {viewItem.message}
                        </p>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          Received: { formatDateTime(viewItem.created_at)}
                        </small>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => viewItem && handleDelete(viewItem.id)}
                    disabled={deleting === viewItem?.id}
                  >
                    {deleting === viewItem?.id
                      ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</>
                      : <><i className="fa fa-trash me-2" />Delete</>
                    }
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeModal} />
        </>
      )}
    </>
  )
}

export default Messages