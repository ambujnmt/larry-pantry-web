const STATUS_BADGE = {
  pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  processing: { bg: "#e0e7ff", color: "#3730a3", label: "Processing" },
  shipped:    { bg: "#d1fae5", color: "#065f46", label: "Shipped" },
  delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

const css = `
  .aodm-backdrop {
    position: fixed; inset: 0; z-index: 1050;
    background: rgba(15,23,42,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: aodm-fade-in .18s ease;
  }
  @keyframes aodm-fade-in { from { opacity: 0 } to { opacity: 1 } }

  .aodm-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 720px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,.22);
    animation: aodm-slide-up .2s ease;
  }
  @keyframes aodm-slide-up { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .aodm-header {
    background: linear-gradient(135deg, #0e606c 0%, #0a4f59 100%);
    padding: 20px 24px;
    flex-shrink: 0;
  }

  .aodm-body {
    overflow-y: auto;
    flex: 1;
    padding: 20px 24px;
  }
  .aodm-body::-webkit-scrollbar { width: 5px; }
  .aodm-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  .aodm-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
  .aodm-info-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .aodm-info-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 4px;
  }
  .aodm-info-value {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .aodm-section-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .aodm-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f1f5f9;
  }

  .aodm-item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .aodm-item-row:last-child { border-bottom: none; }

  .aodm-item-img {
    width: 48px; height: 48px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .aodm-totals {
    background: linear-gradient(135deg, #0e606c 0%, #0a4f59 100%);
    border-radius: 12px;
    padding: 14px 18px;
    margin-top: 16px;
  }

  .aodm-note-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 10px;
    padding: 12px 14px;
    margin-top: 14px;
    font-size: 13px;
    color: #78350f;
  }

  .aodm-refresh-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.85);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
  }
`

function StatusDropdown({ status, onChange, updating }) {
  const s = status?.toLowerCase() || "pending"
  const style = STATUS_BADGE[s] || { bg: "#f1f5f9", color: "#475569" }
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={s}
        disabled={updating}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          background: style.bg, color: style.color,
          padding: "5px 30px 5px 12px", borderRadius: 20,
          fontSize: 12, fontWeight: 700, letterSpacing: ".03em", border: "none",
          cursor: updating ? "wait" : "pointer",
          opacity: updating ? 0.6 : 1,
        }}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt} value={opt} style={{ color: "#1e293b", background: "#fff" }}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      <i className="fa-solid fa-chevron-down" style={{
        position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
        fontSize: 9, color: style.color, pointerEvents: "none",
      }} />
    </div>
  )
}

function AdminOrderDetailModal({ order, onClose, onDownload, onStatusChange, updating, loading }) {
  if (!order) return null

  const items = order.items || order.order_items || []
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "—"
  const total = order.total_amount != null
    ? parseFloat(order.total_amount).toFixed(2)
    : "0.00"

  const totalUnits = items.reduce((s, i) => s + (parseInt(i.quantity) || 0), 0)

  // Admin ke liye customer ki details (alag alag field names ho sakte hain, isliye fallback rakha hai)
  const customerName  = order.customer_name || [order.first_name, order.last_name].filter(Boolean).join(" ") || "—"
  const customerEmail = order.email || order.customer_email || "—"
  const customerPhone = order.mobile || order.phone || "—"
  const customerAddress = order.shipping_address || order.address || "—"
  const note = order.customer_note || order.note

  return (
    <>
      <style>{css}</style>
      <div className="aodm-backdrop" onClick={onClose}>
        <div className="aodm-modal" onClick={e => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="aodm-header">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  Order Details
                  {loading && (
                    <span className="aodm-refresh-badge">
                      <span className="spinner-border spinner-border-sm" style={{ width: 9, height: 9, borderWidth: 1.5 }} />
                      Refreshing
                    </span>
                  )}
                </div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                  #{order.id}
                </div>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 5 }}>{date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusDropdown
                  status={order.status}
                  updating={updating}
                  onChange={newStatus => onStatusChange(order, newStatus)}
                />
                <button onClick={onClose} style={{
                  background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8,
                  width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="aodm-body">

            {/* Customer Info */}
            <div className="aodm-section-title">
              <i className="fa-solid fa-user" style={{ color: "#0e606c" }} />
              Customer
            </div>
            <div className="aodm-info-grid">
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-user me-1" />Name</div>
                <div className="aodm-info-value">{customerName}</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-envelope me-1" />Email</div>
                <div className="aodm-info-value">{customerEmail}</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-phone me-1" />Phone</div>
                <div className="aodm-info-value">{customerPhone}</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-location-dot me-1" />Address</div>
                <div className="aodm-info-value" style={{ fontSize: 13 }}>{customerAddress}</div>
              </div>
            </div>

            {/* Order Info */}
            <div className="aodm-section-title">
              <i className="fa-solid fa-circle-info" style={{ color: "#0e606c" }} />
              Order Info
            </div>
            <div className="aodm-info-grid">
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-hashtag me-1" />Order ID</div>
                <div className="aodm-info-value">#{order.id}</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-regular fa-calendar me-1" />Ordered On</div>
                <div className="aodm-info-value">{date}</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-boxes-stacked me-1" />Total Items</div>
                <div className="aodm-info-value">{items.length} product{items.length !== 1 ? "s" : ""} · {totalUnits} units</div>
              </div>
              <div className="aodm-info-box">
                <div className="aodm-info-label"><i className="fa-solid fa-circle-check me-1" />Status</div>
                <div className="aodm-info-value">
                  <StatusDropdown
                    status={order.status}
                    updating={updating}
                    onChange={newStatus => onStatusChange(order, newStatus)}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="aodm-section-title">
              <i className="fa-solid fa-bag-shopping" style={{ color: "#0e606c" }} />
              Order Items
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "4px 12px", marginBottom: 4 }}>
              {items.length === 0 ? (
                <div style={{ padding: "16px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  {loading ? "Loading items..." : "No items found"}
                </div>
              ) : items.map((item, idx) => (
                <div key={idx} className="aodm-item-row">
                  <img
                    src={item.product_image || "/admin-assets/images/placeholder.png"}
                    alt={item.product_name}
                    className="aodm-item-img"
                    onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Variant: <span style={{ fontWeight: 600, color: "#374151" }}>{item.variant_label || "—"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {item.quantity} × ${parseFloat(item.unit_price || 0).toFixed(2)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0e606c" }}>
                      ${parseFloat(item.total_price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="aodm-totals">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12 }}>Order Total</div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 26, lineHeight: 1.1 }}>
                    ${total}
                  </div>
                </div>
                <button onClick={() => onDownload(order)}
                  style={{
                    background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)",
                    borderRadius: 10, color: "#fff", padding: "9px 18px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                  <i className="fa-solid fa-file-invoice" />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Note */}
            {note && (
              <div className="aodm-note-box">
                <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 5, color: "#92400e" }}>
                  <i className="fa-solid fa-note-sticky me-2" />Customer Note
                </div>
                <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>
                  {note}
                </div>
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "14px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}>
            <button onClick={onClose} style={{
              background: "#f1f5f9", border: "none", borderRadius: 10,
              padding: "10px 24px", fontWeight: 600, fontSize: 14,
              color: "#374151", cursor: "pointer",
            }}>
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default AdminOrderDetailModal
