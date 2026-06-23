import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUsers, getProducts, getCategories, getBrands, STORAGE_URL } from "../../utils/adminApi"

const CARDS = [
  { key: 'users',      label: 'Total Users',    icon: 'fa-users',       bg: '#0e606c', light: '#e6f4f5', to: '/admin/users' },
  { key: 'products',   label: 'Total Products', icon: 'fa-box',         bg: '#f97316', light: '#fff4ec', to: '/admin/products' },
  { key: 'categories', label: 'Categories',     icon: 'fa-layer-group', bg: '#4f46e5', light: '#eef2ff', to: '/admin/categories' },
  { key: 'brands',     label: 'Brands',         icon: 'fa-tag',         bg: '#e11d48', light: '#fff1f4', to: '/admin/brands' },
]

const fmtDate = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatCard({ label, icon, bg, light, to, value, loading }) {
  return (
    <Link to={to} className="text-decoration-none col-6 col-xl-3">
      <div className="app-card shadow-sm h-100" style={{ borderRadius: 14, border: 'none', transition: 'transform .15s, box-shadow .15s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
        <div className="app-card-body p-3 p-lg-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fa-solid ${icon} text-white`} style={{ fontSize: 20 }} />
            </div>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: '#cbd5e1', fontSize: 13 }} />
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#111', lineHeight: 1.1, marginTop: 2 }}>
            {loading ? <span className="placeholder col-4 rounded" style={{ height: 28, display: 'inline-block', background: '#e2e8f0' }} /> : value}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Dashboard() {
  const [counts, setCounts]         = useState({ users: 0, products: 0, categories: 0, brands: 0 })
  const [recentUsers, setRecentUsers]       = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading]       = useState(true)
  const [admin, setAdmin]           = useState({})

  useEffect(() => {
    const stored = localStorage.getItem("admin_user")
    if (stored) setAdmin(JSON.parse(stored))

    const load = async () => {
      try {
        const [uRes, pRes, cRes, bRes] = await Promise.allSettled([
          getUsers(), getProducts(), getCategories(), getBrands(),
        ])
        const users      = uRes.status === 'fulfilled'      ? (uRes.value.data      || []) : []
        const products   = pRes.status === 'fulfilled'   ? (pRes.value.data   || []) : []
        const categories = cRes.status === 'fulfilled' ? (cRes.value.data || []) : []
        const brands     = bRes.status === 'fulfilled'     ? (bRes.value.data     || []) : []

        setCounts({ users: users.length, products: products.length, categories: categories.length, brands: brands.length })
        setRecentUsers([...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5))
        setRecentProducts([...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5))
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const adminName = admin.name || admin.first_name || "Admin"

  const productImg = (p) => {
    const url = p.primary_image?.image_url || ""
    if (!url) return "/admin-assets/images/placeholder.png"
    return url.startsWith("http") ? url : STORAGE_URL + url
  }

  const userAvatar = (u) => {
    if (!u.profile_img) return "/admin-assets/images/user.png"
    return u.profile_img.startsWith("http") ? u.profile_img : STORAGE_URL + u.profile_img
  }

  return (
    <>
      {/* ── Welcome Banner ── */}
      <div className="app-card shadow-sm mb-4" style={{
        borderRadius: 16, border: 'none', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0e606c 0%, #0a4f59 100%)',
      }}>
        <div className="app-card-body p-4 d-flex align-items-center gap-3 flex-wrap">
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fa-solid fa-gauge text-white" style={{ fontSize: 22 }} />
          </div>
          <div className="flex-grow-1">
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
              Welcome back, {adminName}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/admin/products" className="btn btn-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8 }}>
              <i className="fa-solid fa-plus me-1" />Add Product
            </Link>
            <Link to="/admin/users" className="btn btn-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8 }}>
              <i className="fa-solid fa-users me-1" />View Users
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {CARDS.map(c => (
          <StatCard key={c.key} {...c} value={counts[c.key]} loading={loading} />
        ))}
      </div>

      {/* ── Main Content Row ── */}
      <div className="row g-3 mb-3">

        {/* Recent Users */}
        <div className="col-12 col-xl-6">
          <div className="app-card shadow-sm h-100" style={{ borderRadius: 14, border: 'none' }}>
            <div className="app-card-body p-0">
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-users" style={{ color: '#0e606c', fontSize: 14 }} />
                  </div>
                  <span className="fw-bold" style={{ fontSize: 15 }}>Recent Users</span>
                </div>
                <Link to="/admin/users" style={{ fontSize: 13, color: '#0e606c', fontWeight: 500 }}>View all</Link>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border spinner-border-sm me-2" style={{ color: '#0e606c' }} />Loading...
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>No users yet.</div>
              ) : (
                <div>
                  {recentUsers.map((u, i) => (
                    <div key={u.id} className="d-flex align-items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < recentUsers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <img src={userAvatar(u)} alt={u.first_name || "User"}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/user.png" }}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }} />
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>
                          {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                        </div>
                        <div className="text-truncate" style={{ fontSize: 12, color: '#888' }}>{u.email}</div>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <div style={{ fontSize: 12, color: '#aaa' }}>{fmtDate(u.created_at)}</div>
                        <span className={`badge mt-1 ${u.status === 1 ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 10 }}>
                          {u.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="col-12 col-xl-6">
          <div className="app-card shadow-sm h-100" style={{ borderRadius: 14, border: 'none' }}>
            <div className="app-card-body p-0">
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff4ec',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-box" style={{ color: '#f97316', fontSize: 14 }} />
                  </div>
                  <span className="fw-bold" style={{ fontSize: 15 }}>Recent Products</span>
                </div>
                <Link to="/admin/products" style={{ fontSize: 13, color: '#0e606c', fontWeight: 500 }}>View all</Link>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border spinner-border-sm me-2" style={{ color: '#0e606c' }} />Loading...
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>No products yet.</div>
              ) : (
                <div>
                  {recentProducts.map((p, i) => {
                    const def = p.variants?.find(v => v.is_default == 1) || p.variants?.[0]
                    return (
                      <div key={p.id} className="d-flex align-items-center gap-3 px-4 py-3"
                        style={{ borderBottom: i < recentProducts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <img src={productImg(p)} alt={p.name}
                          onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                          style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{p.category_name || '—'}</div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          {def && <div className="fw-bold" style={{ fontSize: 14, color: '#0e606c' }}>${def.selling_price}</div>}
                          <span className={`badge mt-1 ${p.status == 1 ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: 10 }}>
                            {p.status == 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="app-card shadow-sm" style={{ borderRadius: 14, border: 'none' }}>
        <div className="app-card-body p-4">
          <div className="fw-bold mb-3" style={{ fontSize: 15 }}>Quick Actions</div>
          <div className="row g-2">
            {[
              { icon: 'fa-box',         label: 'Add Product',   to: '/admin/products',   bg: '#fff4ec', color: '#f97316' },
              { icon: 'fa-layer-group', label: 'Add Category',  to: '/admin/categories', bg: '#eef2ff', color: '#4f46e5' },
              { icon: 'fa-tag',         label: 'Add Brand',     to: '/admin/brands',     bg: '#fff1f4', color: '#e11d48' },
              { icon: 'fa-ruler',       label: 'Add Unit',      to: '/admin/units',      bg: '#f0fdf4', color: '#16a34a' },
              { icon: 'fa-users',       label: 'Manage Users',  to: '/admin/users',      bg: '#e6f4f5', color: '#0e606c' },
              { icon: 'fa-circle-user', label: 'My Account',    to: '/admin/account',    bg: '#fefce8', color: '#ca8a04' },
            ].map(({ icon, label, to, bg, color }) => (
              <div key={to} className="col-6 col-md-4 col-lg-2">
                <Link to={to} className="text-decoration-none d-flex flex-column align-items-center gap-2 p-3 rounded-3 text-center"
                  style={{ background: bg, transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                    <i className={`fa-solid ${icon}`} style={{ color, fontSize: 18 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
