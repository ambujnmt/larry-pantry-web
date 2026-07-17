import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import Swal from "sweetalert2"
import { getUsers, updateUserStatus, deleteUser, dtOptions, STORAGE_URL, getProducts, getUserProducts, assignUserProducts } from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const STATUS_MAP = { 0: ['Pending', 'secondary'], 1: ['Active', 'success'], 2: ['Deactivated', 'danger'], 3: ['Suspended', 'warning'], 4: ['Deleted', 'dark'] }
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const fmtDate = (str) => str ? new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (str) => str ? new Date(str).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const avatarUrl = (img, fallback = "/admin-assets/images/user.png") => !img ? fallback : (img.startsWith("http") ? img : STORAGE_URL + img)

const css = `
  .cp-section-title { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .cp-section-title::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
  .cp-avatar-lg { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,.5); }
`

function AssignProductsModal({ user, onClose, onSaved }) {
  const [allProducts, setAllProducts] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([getProducts(), getUserProducts(user.id).catch(() => ({ data: [] }))])
        setAllProducts(Array.isArray(pRes.data) ? pRes.data : [])
        setSelected(new Set((Array.isArray(aRes.data) ? aRes.data : []).map(p => p.id ?? p)))
      } catch (err) { setError(err.message || "Failed to load products.") }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const toggle = (id) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const toggleAll = () => {
    const visible = filtered.map(p => p.id)
    const allSelected = visible.every(id => selected.has(id))
    setSelected(prev => { const next = new Set(prev); visible.forEach(id => allSelected ? next.delete(id) : next.add(id)); return next })
  }

  const handleSave = async () => {
    setSaving(true); setError("")
    try { await assignUserProducts(user.id, [...selected]); onSaved([...selected].length) }
    catch (err) { setError(err.message || "Failed to assign products.") }
    finally { setSaving(false) }
  }

  const filtered = allProducts.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
  const productImg = (p) => p.primary_image?.image_url ? (p.primary_image.image_url.startsWith("http") ? p.primary_image.image_url : STORAGE_URL + p.primary_image.image_url) : "/admin-assets/images/placeholder.png"
  const defaultPrice = (p) => { if (!p.variants?.length) return null; const def = p.variants.find(v => v.is_default == 1) || p.variants[0]; return def ? `$${def.selling_price}` : null }
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "User"
  const visibleAllChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id))

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header" style={{ background: '#0e606c' }}>
              <div>
                <h5 className="modal-title text-white mb-0"><i className="fa fa-box me-2" />Assign Products</h5>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{fullName} · {selected.size} product{selected.size !== 1 ? 's' : ''} selected</div>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>

            <div className="px-3 pt-3 pb-2 border-bottom" style={{ background: '#f8fafc' }}>
              <div className="position-relative">
                <i className="fa fa-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 2 }} />
                <input type="text" className="form-control ps-4 ms-1" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
              </div>
            </div>

            <div className="modal-body p-0" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {error && <div className="alert alert-danger m-3 py-2 d-flex gap-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

              {loading ? (
                <div className="text-center py-5"><span className="spinner-border spinner-border-sm me-2" />Loading products...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>{search ? `No products found for "${search}"` : "No products available."}</div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: 40 }}><input type="checkbox" className="form-check-input" checked={visibleAllChecked} onChange={toggleAll} title="Select / deselect all visible" /></th>
                      <th style={{ width: 52 }}></th><th>Product</th><th style={{ width: 100 }}>Price</th><th style={{ width: 80 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} onClick={() => toggle(p.id)} style={{ cursor: 'pointer', background: selected.has(p.id) ? '#f0fdf9' : '' }}>
                        <td onClick={e => e.stopPropagation()}><input type="checkbox" className="form-check-input" checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                        <td><img src={productImg(p)} alt={p.name} onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} /></td>
                        <td className="align-middle">
                          <div className="fw-semibold" style={{ fontSize: 14 }}>{p.name}</div>
                          {p.category_name && <div style={{ fontSize: 12, color: '#888' }}>{p.category_name}</div>}
                        </td>
                        <td className="align-middle fw-semibold text-success" style={{ fontSize: 14 }}>{defaultPrice(p) || '—'}</td>
                        <td className="align-middle "><span className={`badge ${p.status == 1 ? 'bg-success' : 'bg-secondary'}`}>{p.status == 1 ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer d-flex justify-content-between align-items-center">
              <span style={{ fontSize: 13, color: '#555' }}>{selected.size} of {allProducts.length} products selected</span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                <button className="btn text-white" style={{ background: '#0e606c' }} onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="fa fa-save me-2" />Save Assignment</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="col-sm-6 mb-3">
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: '#999', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#222', marginTop: 2 }}>{value ?? '—'}</div>
  </div>
)

function UserViewModal({ user, onClose }) {
  const [label, color] = STATUS_MAP[user.status] ?? ['Unknown', 'secondary']
  let workingHours = null
  if (user.working_hours) { try { workingHours = typeof user.working_hours === 'string' ? JSON.parse(user.working_hours) : user.working_hours } catch (_) { workingHours = null } }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "User"
  const hasLocation = user.latitude && user.longitude
  const mapUrl = hasLocation ? `https://www.google.com/maps?q=${user.latitude},${user.longitude}` : null

  return (
    <>
      <style>{css}</style>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header" style={{ background: '#0e606c' }}>
              <div className="d-flex align-items-center gap-3">
                <img src={avatarUrl(user.profile_img)} alt={fullName} onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/user.png" }} className="cp-avatar-lg" />
                <div>
                  <h5 className="modal-title text-white mb-0">{fullName}</h5>
                  <span className={`badge bg-${color} mt-1`}>{label}</span>
                </div>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>

            <div className="modal-body">

              <div className="cp-section-title"><i className="fa-solid fa-address-book" style={{ color: "#0e606c" }} />Contact Details</div>
              <div className="row">
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Email Verified" value={user.email_verified_at ? fmtDateTime(user.email_verified_at) : 'Not Verified'} />
                <InfoRow label="Mobile" value={user.mobile} />
                {/*<InfoRow label="Mobile 2" value={user.mobile_2} />*/}
              </div>

              <div className="cp-section-title mt-2"><i className="fa-solid fa-location-dot" style={{ color: "#0e606c" }} />Address & Location</div>
              <div className="row">
                <InfoRow label="Address" value={user.address} />
                {/*<InfoRow label="Coordinates" value={hasLocation ? <a href={mapUrl} target="_blank" rel="noreferrer">{user.latitude}, {user.longitude} <i className="fa fa-external-link ms-1" style={{ fontSize: 11 }} /></a> : '—'} />*/}
              </div>

              <div className="cp-section-title mt-2"><i className="fa-solid fa-building" style={{ color: "#0e606c" }} />Business Information</div>
              <div className="row">
                <InfoRow label="Organization Type" value={user.organization_type} />
                <InfoRow label="Store Address" value={user.store_address} />
              </div>

              {workingHours && (
                <div className="table-responsive mt-2">
                  <u>Working Hours</u>
                  <table className="table table-sm table-bordered mb-0">
                    <thead><tr><th>Day</th><th>Open</th><th>Close</th><th>Status</th></tr></thead>
                    <tbody>
                      {DAYS.map(day => workingHours[day] && (
                        <tr key={day}>
                          <td className="text-capitalize">{day}</td>
                          <td>{workingHours[day].open || '—'}</td>
                          <td>{workingHours[day].close || '—'}</td>
                          <td>{workingHours[day].closed ? <span className="badge bg-secondary">Closed</span> : <span className="badge bg-success">Open</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="cp-section-title mt-3"><i className="fa-solid fa-circle-info" style={{ color: "#0e606c" }} />Account Info</div>
              <div className="row">
                <InfoRow label="Joined On" value={fmtDateTime(user.created_at)} />
                <InfoRow label="Last Updated" value={fmtDateTime(user.updated_at)} />
                <InfoRow label="Last Login" value={fmtDateTime(user.last_login)} />
                <InfoRow label="User ID" value={`#${user.id}`} />
              </div>

            </div>

            <div className="modal-footer"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  )
}

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleting, setDeleting] = useState(null)
  const [assignUser, setAssignUser] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("admin_token")
        if (!token) { navigate("/admin/login"); return }
        const res = await getUsers()
        setUsers(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        const msg = err.message || ""
        if (msg.toLowerCase().includes("unauthenticated") || msg.toLowerCase().includes("unauthorized")) {
          localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user"); navigate("/admin/login"); return
        }
        setError(msg || "Failed to load users.")
      } finally { setLoading(false) }
    }
    load()
  }, [navigate])

  const handleStatusChange = async (id, status, currentStatus) => {
    if (status === currentStatus) return

    const [newLabel] = STATUS_MAP[status] ?? ['this status', 'secondary']
    const result = await Swal.fire({
      title: "Change Status?",
      text: `Are you sure you want to mark this user as "${newLabel}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0e606c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Change",
      cancelButtonText: "Cancel",
    })
    if (!result.isConfirmed) return

    try {
      await updateUserStatus(id, status)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      setSuccess("Status updated successfully!"); setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Delete User?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", cancelButtonColor: "#6c757d", confirmButtonText: "Yes, Delete", cancelButtonText: "Cancel" })
    if (!result.isConfirmed) return
    setDeleting(id)
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSuccess("User deleted successfully!"); setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setDeleting(null) }
  }

  const handleAssignSaved = (count) => {
    setAssignUser(null)
    setSuccess(`${count} product${count !== 1 ? 's' : ''} assigned successfully!`)
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <>
      <AdminPageHeader icon="fa-users" title="Users" subtitle="Manage customer accounts" right={<span className="badge fs-6" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{users.length} Total</span>} />

      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2"><i className="fa fa-check-circle" /><small>{success}</small></div>}
      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2"><i className="fa fa-exclamation-circle" /><small>{error}</small></div>}

      <div className="app-card shadow-sm">
        <div className="app-card-body p-3 table-responsive">
          {loading ? (
            <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted">No users found.</div>
          ) : (
            <DataTable key={users.length} className="table table-hover mb-0 w-100" options={{ ...dtOptions, destroy: true, columnDefs: [{ targets: '_all', defaultContent: '—' }, { orderable: false, targets: [1, 7] }] }}>
              <thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Email</th><th>Mobile</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u, i) => {
                  const [label, color] = STATUS_MAP[u.status] ?? ['Unknown', 'secondary']
                  return (
                    <tr key={u.id}>
                      <td className="align-middle">{i + 1}</td>
                      <td><img src={avatarUrl(u.profile_img)} alt={u.first_name || "User"} onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/user.png" }} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} /></td>
                      <td className="align-middle">
                        <div className="fw-semibold">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</div>
                        {/*{u.address && <div style={{ fontSize: 12, color: '#888' }}>{u.address}</div>}*/}
                      </td>
                      <td className="align-middle">{u.email}</td>
                      <td className="align-middle">{u.mobile || '—'}</td>
                      <td className="align-middle">
                        <div>{fmtDate(u.created_at)}</div>
                        {u.last_login && <div style={{ fontSize: 12, color: '#888' }}>Last: {fmtDate(u.last_login)}</div>}
                      </td>
                      <td className="align-middle">
                        <select className="form-select form-select-sm mb-1" style={{ minWidth: 110 }} value={u.status} onChange={e => handleStatusChange(u.id, parseInt(e.target.value), u.status)}>
                          <option value={1}>Active</option><option value={2}>Deactivated</option><option value={3}>Suspended</option>
                        </select>
                        <span className={`badge bg-${color}`}>{label}</span>
                      </td>
                      <td className="align-middle">
                        <button className="btn btn-sm btn-outline-info me-1" title="View Details" onClick={() => setViewUser(u)}><i className="fa fa-eye" /></button>
                        <button className="btn btn-sm btn-outline-success me-1" title="Assign Products" onClick={() => setAssignUser(u)}><i className="fa fa-box" /></button>
                        <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(u.id)} disabled={deleting === u.id}>
                          {deleting === u.id ? <span className="spinner-border spinner-border-sm" /> : <i className="fa fa-trash" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>

      {viewUser && <UserViewModal user={viewUser} onClose={() => setViewUser(null)} />}
      {assignUser && <AssignProductsModal user={assignUser} onClose={() => setAssignUser(null)} onSaved={handleAssignSaved} />}
    </>
  )
}

export default Users