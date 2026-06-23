import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import Swal from "sweetalert2"
import {
  getUsers, updateUserStatus, deleteUser, dtOptions, STORAGE_URL,
  getProducts, getUserProducts, assignUserProducts,
} from "../../utils/adminApi"
import AdminPageHeader from "../../admin/components/AdminPageHeader"

DataTable.use(DT)

const STATUS_MAP = {
  0: ['Inactive',  'secondary'],
  1: ['Active',    'success'],
  2: ['Blocked',   'danger'],
  3: ['Suspended', 'warning'],
}

const fmtDate = (str) => {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function AssignProductsModal({ user, onClose, onSaved }) {
  const [allProducts, setAllProducts]     = useState([])
  const [selected, setSelected]           = useState(new Set())
  const [search, setSearch]               = useState("")
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          getProducts(),
          getUserProducts(user.id).catch(() => ({ data: [] })),
        ])
        const products = Array.isArray(pRes.data) ? pRes.data : []
        const assigned = Array.isArray(aRes.data) ? aRes.data : []
        setAllProducts(products)
        setSelected(new Set(assigned.map(p => p.id ?? p)))
      } catch (err) {
        setError(err.message || "Failed to load products.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const visible = filtered.map(p => p.id)
    const allSelected = visible.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      visible.forEach(id => allSelected ? next.delete(id) : next.add(id))
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true); setError("")
    try {
      await assignUserProducts(user.id, [...selected])
      onSaved([...selected].length)
    } catch (err) {
      setError(err.message || "Failed to assign products.")
    } finally { setSaving(false) }
  }

  const filtered = allProducts.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const productImg = (p) => {
    const url = p.primary_image?.image_url || ""
    if (!url) return "/admin-assets/images/placeholder.png"
    if (url.startsWith("http")) return url
    return STORAGE_URL + url
  }

  const defaultPrice = (p) => {
    if (!p.variants?.length) return null
    const def = p.variants.find(v => v.is_default == 1) || p.variants[0]
    return def ? `$${def.selling_price}` : null
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "User"
  const visibleAllChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id))

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header" style={{ background: '#0e606c' }}>
              <div>
                <h5 className="modal-title text-white mb-0">
                  <i className="fa fa-box me-2" />Assign Products
                </h5>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                  {fullName} · {selected.size} product{selected.size !== 1 ? 's' : ''} selected
                </div>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2 border-bottom" style={{ background: '#f8fafc' }}>
              <div className="position-relative">
                <i className="fa fa-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 2 }} />
                <input
                  type="text"
                  className="form-control ps-4"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Body */}
            <div className="modal-body p-0" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {error && (
                <div className="alert alert-danger m-3 py-2 d-flex gap-2">
                  <i className="fa fa-exclamation-circle" /><small>{error}</small>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border spinner-border-sm me-2" />Loading products...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>
                  {search ? `No products found for "${search}"` : "No products available."}
                </div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={visibleAllChecked}
                          onChange={toggleAll}
                          title="Select / deselect all visible"
                        />
                      </th>
                      <th style={{ width: 52 }}></th>
                      <th>Product</th>
                      <th style={{ width: 100 }}>Price</th>
                      <th style={{ width: 80 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr
                        key={p.id}
                        onClick={() => toggle(p.id)}
                        style={{ cursor: 'pointer', background: selected.has(p.id) ? '#f0fdf9' : '' }}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={productImg(p)}
                            alt={p.name}
                            onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                            style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                          />
                        </td>
                        <td className="align-middle">
                          <div className="fw-semibold" style={{ fontSize: 14 }}>{p.name}</div>
                          {p.category_name && (
                            <div style={{ fontSize: 12, color: '#888' }}>{p.category_name}</div>
                          )}
                        </td>
                        <td className="align-middle fw-semibold text-success" style={{ fontSize: 14 }}>
                          {defaultPrice(p) || '—'}
                        </td>
                        <td className="align-middle">
                          <span className={`badge ${p.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {p.status == 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer d-flex justify-content-between align-items-center">
              <span style={{ fontSize: 13, color: '#555' }}>
                {selected.size} of {allProducts.length} products selected
              </span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                <button
                  className="btn text-white"
                  style={{ background: '#0e606c' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                    : <><i className="fa fa-save me-2" />Save Assignment</>}
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

function Users() {
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [success, setSuccess]         = useState("")
  const [deleting, setDeleting]       = useState(null)
  const [assignUser, setAssignUser]   = useState(null)
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
          localStorage.removeItem("admin_token")
          localStorage.removeItem("admin_user")
          navigate("/admin/login")
          return
        }
        setError(msg || "Failed to load users.")
      } finally { setLoading(false) }
    }
    load()
  }, [navigate])

  const handleStatusChange = async (id, status) => {
    try {
      await updateUserStatus(id, status)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      setSuccess("Status updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    })
    if (!result.isConfirmed) return
    setDeleting(id)
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSuccess("User deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) { setError(err.message) }
    finally { setDeleting(null) }
  }

  const handleAssignSaved = (count) => {
    setAssignUser(null)
    setSuccess(`${count} product${count !== 1 ? 's' : ''} assigned successfully!`)
    setTimeout(() => setSuccess(""), 3000)
  }

  const avatar = (u) => {
    if (!u.profile_img) return "/admin-assets/images/user.png"
    if (u.profile_img.startsWith("http")) return u.profile_img
    return STORAGE_URL + u.profile_img
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-users"
        title="Users"
        subtitle="Manage customer accounts"
        right={<span className="badge fs-6" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{users.length} Total</span>}
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
        <div className="app-card-body p-3">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" />Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted">No users found.</div>
          ) : (
            <DataTable
              key={users.length}
              className="table table-hover mb-0 w-100"
              options={{
                ...dtOptions,
                destroy: true,
                columnDefs: [
                  { targets: '_all', defaultContent: '—' },
                  { orderable: false, targets: [0, 5, 6] },
                ],
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 56 }}>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const [label, color] = STATUS_MAP[u.status] ?? ['Unknown', 'secondary']
                  return (
                    <tr key={u.id}>
                      <td>
                        <img
                          src={avatar(u)}
                          alt={u.first_name || "User"}
                          onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/user.png" }}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                        />
                      </td>
                      <td className="align-middle">
                        <div className="fw-semibold">
                          {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                        </div>
                        {u.address && (
                          <div style={{ fontSize: 12, color: '#888' }}>{u.address}</div>
                        )}
                      </td>
                      <td className="align-middle">{u.email}</td>
                      <td className="align-middle">{u.mobile || '—'}</td>
                      <td className="align-middle">
                        <div>{fmtDate(u.created_at)}</div>
                        {u.last_login && (
                          <div style={{ fontSize: 12, color: '#888' }}>
                            Last: {fmtDate(u.last_login)}
                          </div>
                        )}
                      </td>
                      <td className="align-middle">
                        <select
                          className="form-select form-select-sm mb-1"
                          style={{ minWidth: 110 }}
                          value={u.status}
                          onChange={e => handleStatusChange(u.id, parseInt(e.target.value))}
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                          <option value={2}>Blocked</option>
                          <option value={3}>Suspended</option>
                        </select>
                        <span className={`badge bg-${color}`}>{label}</span>
                      </td>
                      <td className="align-middle">
                        <button
                          className="btn btn-sm btn-outline-success me-1"
                          title="Assign Products"
                          onClick={() => setAssignUser(u)}
                        >
                          <i className="fa fa-box" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                        >
                          {deleting === u.id
                            ? <span className="spinner-border spinner-border-sm" />
                            : <i className="fa fa-trash" />}
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

      {assignUser && (
        <AssignProductsModal
          user={assignUser}
          onClose={() => setAssignUser(null)}
          onSaved={handleAssignSaved}
        />
      )}
    </>
  )
}

export default Users
