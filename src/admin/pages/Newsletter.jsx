// src/admin/pages/Newsletter.jsx
import { useState, useEffect } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import { getNewsletterSubscribers, deleteNewsletterSubscriber, dtOptions } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

function Newsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  const loadSubscribers = async () => {
    try {
      setLoading(true)
      const data = await getNewsletterSubscribers()
      setSubscribers(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadSubscribers() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return
    setDeleting(id)
    try {
      await deleteNewsletterSubscriber(id)
      setSubscribers(prev => prev.filter(s => s.id !== id))
      setSuccess("Subscriber deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Delete failed.")
    } finally { setDeleting(null) }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-paper-plane"
        title="Newsletter Subscribers"
        subtitle="View and manage email subscriptions received from the website"
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
                order: [[0, 'desc']],
                columnDefs: [
                  { orderable: false, targets: [2] }
                ]
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <></>
                ) : subscribers.map((sub, index) => (
                  <tr key={sub.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle fw-semibold">{sub.email}</td>
                    <td className="align-middle">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleting === sub.id}
                      >
                        {deleting === sub.id
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
    </>
  )
}

export default Newsletter