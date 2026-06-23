import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getProfile, getAssignedProducts, STORAGE_URL } from "../../utils/customerApi"
import { getMyOrders } from "../../utils/customerApi"

const STAT_COLOR = {
  teal:   { bg: '#0e606c', light: '#e6f4f5' },
  orange: { bg: '#f97316', light: '#fff4ec' },
  rose:   { bg: '#e11d48', light: '#fff1f4' },
  indigo: { bg: '#4f46e5', light: '#eef2ff' },
}

const STATUS_BADGE = {
  pending:    { bg: "#fef3c7", color: "#92400e" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af" },
  processing: { bg: "#e0e7ff", color: "#3730a3" },
  shipped:    { bg: "#d1fae5", color: "#065f46" },
  delivered:  { bg: "#dcfce7", color: "#166534" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b" },
}

function StatCard({ icon, label, value, colorKey, to, loading }) {
  const c = STAT_COLOR[colorKey]
  return (
    <Link to={to} className="text-decoration-none col-6">
      <div className="app-card shadow-sm h-100" style={{ borderRadius: 12, overflow: 'hidden', border: 'none' }}>
        <div className="app-card-body p-3 p-lg-4 d-flex align-items-center gap-3">
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`fa-solid ${icon} text-white`} style={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
            {loading
              ? <div style={{ width: 40, height: 28, borderRadius: 6, background: '#e2e8f0', marginTop: 4 }} />
              : <div style={{ fontSize: 28, fontWeight: 700, color: '#111', lineHeight: 1.1 }}>{value}</div>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}

function CustomerDashboard() {
  const [user, setUser]           = useState({})
  const [orders, setOrders]       = useState([])
  const [productCount, setProductCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("customer_user")
    if (stored) setUser(JSON.parse(stored))

    getProfile()
      .then(res => {
        const profile = res?.data ?? res
        setUser(profile)
        localStorage.setItem("customer_user", JSON.stringify(profile))
      })
      .catch(() => {})

    Promise.all([getMyOrders(), getAssignedProducts()])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data || [])
        const products = productsRes.data || productsRes.assigned_products || productsRes || []
        setProductCount(Array.isArray(products) ? products.length : 0)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Customer"

  const avatarSrc = user.profile_img
    ? (user.profile_img.startsWith("http") ? user.profile_img : STORAGE_URL + user.profile_img)
    : "/admin-assets/images/user.png"

  const recentOrders = orders.slice(0, 3)

  return (
    <>
      {/* Welcome Banner */}
      <div className="app-card shadow-sm mb-4" style={{
        borderRadius: 14, overflow: 'hidden', border: 'none',
        background: 'linear-gradient(135deg, #0e606c 0%, #0a4f59 100%)',
      }}>
        <div className="app-card-body p-4 d-flex align-items-center gap-3">
          <img
            src={avatarSrc}
            alt={fullName}
            onError={e => { e.target.src = "/admin-assets/images/user.png" }}
            style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.35)', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Welcome back, {fullName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {user.email || ""}
              {user.mobile ? ` · ${user.mobile}` : ""}
            </div>
          </div>
          <Link to="/customer/profile" className="btn btn-sm ms-auto text-white"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-pen me-1" />Edit Profile
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <StatCard icon="fa-box"          label="My Products"  value={productCount}   colorKey="teal"   to="/customer/assigned-products" loading={statsLoading} />
        <StatCard icon="fa-bag-shopping" label="Total Orders" value={orders.length}  colorKey="orange" to="/customer/orders"            loading={statsLoading} />
      </div>

      {/* Bottom Row */}
      <div className="row g-3">
        {/* Recent Orders */}
        <div className="col-12 col-lg-7">
          <div className="app-card shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="app-card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0" style={{ color: '#111' }}>Recent Orders</h6>
                <Link to="/customer/orders" style={{ fontSize: 13, color: '#0e606c', fontWeight: 500 }}>View all</Link>
              </div>

              {statsLoading && (
                <div className="d-flex flex-column gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 48, borderRadius: 8, background: '#f1f5f9' }} />
                  ))}
                </div>
              )}

              {!statsLoading && recentOrders.length === 0 && (
                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-muted" style={{ minHeight: 120 }}>
                  <i className="fa-solid fa-bag-shopping mb-2" style={{ fontSize: 32, opacity: 0.25 }} />
                  <div style={{ fontSize: 14 }}>No orders yet.</div>
                  <Link to="/customer/assigned-products" className="btn btn-sm mt-3 text-white" style={{ background: '#0e606c', borderRadius: 8 }}>
                    Start Shopping
                  </Link>
                </div>
              )}

              {!statsLoading && recentOrders.length > 0 && (
                <div className="d-flex flex-column gap-2">
                  {recentOrders.map(order => {
                    const s = (order.status || "pending").toLowerCase()
                    const badge = STATUS_BADGE[s] || { bg: "#f1f5f9", color: "#475569" }
                    const date = order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"
                    return (
                      <Link key={order.id} to="/customer/orders" className="text-decoration-none d-flex align-items-center gap-3 px-3 py-2"
                        style={{ borderRadius: 8, background: '#f8fafc', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#edfdf6'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                      >
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4f5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="fa-solid fa-bag-shopping" style={{ color: '#0e606c', fontSize: 13 }} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Order #{order.id}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{date} · {order.items?.length || 0} item(s)</div>
                        </div>
                        <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px",
                          borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {order.status}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#0e606c', whiteSpace: 'nowrap' }}>
                          ₹{parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-12 col-lg-5">
          <div className="app-card shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="app-card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: '#111' }}>Quick Links</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: 'fa-box',          label: 'My Products',   to: '/customer/assigned-products' },
                  { icon: 'fa-circle-user',  label: 'My Profile',    to: '/customer/profile' },
                  { icon: 'fa-bag-shopping', label: 'My Orders',     to: '/customer/orders' },
                  { icon: 'fa-store',        label: 'Back to Store', to: '/' },
                ].map(({ icon, label, to }) => (
                  <Link key={to} to={to} className="text-decoration-none d-flex align-items-center gap-3 px-3 py-2"
                    style={{ borderRadius: 8, color: '#374151', fontSize: 14, fontWeight: 500,
                      background: '#f8fafc', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#edfdf6'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${icon}`} style={{ color: '#0e606c', fontSize: 14 }} />
                    </span>
                    {label}
                    <i className="fa-solid fa-chevron-right ms-auto" style={{ fontSize: 11, color: '#aaa' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerDashboard
