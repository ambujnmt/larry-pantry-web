import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUser, updateUserStatus, deleteUser } from "../../utils/adminApi"

function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUser(id)
        setUser(data.data)
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleStatusChange = async (status) => {
    try {
      await updateUserStatus(id, parseInt(status))
      setUser(prev => ({ ...prev, status: parseInt(status) }))
      setSuccess("Status updated!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(id)
      navigate("/admin/users")
    } catch (err) { setError(err.message) }
  }

  const avatar = user?.profile_img_url || "/admin-assets/images/user.png"

  const statusLabel = { 1: ['Active','success'], 2: ['Inactive','secondary'], 3: ['Suspended','warning'] }

  const InfoRow = ({ label, value }) => (
    <div className="border-bottom py-2 row">
      <div className="col-5 text-secondary small">{label}</div>
      <div className="col-7 fw-semibold">{value || '—'}</div>
    </div>
  )

  if (loading) return <div className="text-center py-5"><span className="spinner-border" /></div>
  if (!user) return <div className="alert alert-danger">User not found.</div>

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate("/admin/users")}>
            <i className="fa fa-arrow-left me-1" />Back
          </button>
          <h1 className="app-page-title mb-0">User Details</h1>
        </div>
        <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
          <i className="fa fa-trash me-1" />Delete User
        </button>
      </div>

      {success && <div className="alert alert-success d-flex gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && <div className="alert alert-danger d-flex gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="row g-4">

        {/* Left — Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="app-card shadow-sm text-center p-4">

            <img src={avatar} alt={user.first_name}
              onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/user.png" }}
              style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                border: '3px solid #e2e8f0', marginBottom: 16 }} />

            <h5 className="fw-bold mb-1">{user.first_name} {user.last_name}</h5>
            <p className="text-muted mb-3">{user.email}</p>

            <div className="d-flex justify-content-center gap-2 mb-4">
              <span className={`badge bg-${user.user_type === 'manager' ? 'primary' : 'secondary'}`}>
                {user.user_type === 'manager' ? 'Manager' : 'User'}
              </span>
              {user.authoriser == 1 && <span className="badge bg-info">Authoriser</span>}
            </div>

            {/* Status Change */}
            <div>
              <label className="form-label small text-secondary">Change Status</label>
              <select className="form-select form-select-sm"
                value={user.status}
                onChange={e => handleStatusChange(e.target.value)}>
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
                <option value={3}>Suspended</option>
              </select>
            </div>

            <div className="mt-3">
              <span className={`badge bg-${statusLabel[user.status]?.[1] || 'secondary'} fs-6`}>
                {statusLabel[user.status]?.[0] || 'Unknown'}
              </span>
            </div>

          </div>
        </div>

        {/* Right — Info */}
        <div className="col-12 col-lg-8">
          <div className="app-card shadow-sm p-4">
            <h6 className="fw-bold mb-3 pb-2 border-bottom">Personal Information</h6>
            <InfoRow label="First Name"   value={user.first_name} />
            <InfoRow label="Last Name"    value={user.last_name} />
            <InfoRow label="Email"        value={user.email} />
            <InfoRow label="Mobile"       value={user.mobile ? `+${user.country_code || ''} ${user.mobile}` : null} />
            <InfoRow label="Gender"       value={user.gender} />
            <InfoRow label="Address"      value={user.address} />
            <InfoRow label="Joined"       value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : null} />
            <InfoRow label="Last Login"   value={user.last_login ? new Date(user.last_login).toLocaleString() : null} />
          </div>
        </div>

      </div>
    </>
  )
}

export default UserDetail
