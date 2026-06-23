import { useState, useEffect } from "react"
import AdminPageHeader from "../components/AdminPageHeader"
import { getAdminOrders } from "../../utils/adminApi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const STATUS_CONFIG = {
  pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  processing: { bg: "#e0e7ff", color: "#3730a3", label: "Processing" },
  shipped:    { bg: "#d1fae5", color: "#065f46", label: "Shipped" },
  delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
}

const TABS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

const fmtDate = (str) => {
  if (!str) return "—"
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function StatusBadge({ status }) {
  const key = (status || "pending").toLowerCase()
  const cfg = STATUS_CONFIG[key] || { bg: "#f1f5f9", color: "#475569", label: status }
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: ".02em", whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  )
}

function Orders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeTab, setActiveTab] = useState("All")
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch]     = useState("")

  useEffect(() => {
    getAdminOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchTab = activeTab === "All" || o.status?.toLowerCase() === activeTab.toLowerCase()
    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(o.id).includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.email || o.customer_email || "").toLowerCase().includes(q) ||
      (o.mobile || "").includes(q)
    return matchTab && matchSearch
  })

  const tabCount = (tab) =>
    tab === "All" ? orders.length : orders.filter(o => o.status?.toLowerCase() === tab.toLowerCase()).length

  const downloadInvoice = (e, order) => {
    e.stopPropagation()
    const items = order.items || []
    const date  = fmtDate(order.created_at)
    const total = order.total_amount != null ? parseFloat(order.total_amount).toFixed(2) : "0.00"

    const customerName  = order.customer_name || [order.first_name, order.last_name].filter(Boolean).join(" ") || "—"
    const customerEmail = order.email || order.customer_email || "—"
    const customerPhone = order.mobile || "—"

    const PRIMARY   = [14, 96, 108]
    const PRIMARY_L = [232, 246, 248]
    const DARK      = [15, 23, 42]
    const MUTED     = [100, 116, 139]
    const BORDER    = [226, 232, 240]
    const WHITE     = [255, 255, 255]

    const doc    = new jsPDF({ unit: "mm", format: "a4" })
    const W      = 210
    const MARGIN = 14

    doc.setFillColor(...PRIMARY)
    doc.rect(0, 0, W, 2, "F")

    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("Larry Pantry", MARGIN, 20)
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Fresh groceries delivered to your door", MARGIN, 26)
    doc.text("contact@larrypantry.com  |  +91 98765 43210", MARGIN, 31)
    doc.text("www.larrypantry.com", MARGIN, 36)

    doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("INVOICE", W - MARGIN, 20, { align: "right" })
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Invoice No.", W - MARGIN, 28, { align: "right" })
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(`#${String(order.id).padStart(5, "0")}`, W - MARGIN, 33, { align: "right" })
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Date", W - MARGIN, 40, { align: "right" })
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(date, W - MARGIN, 45, { align: "right" })

    doc.setDrawColor(...BORDER); doc.setLineWidth(0.4)
    doc.line(MARGIN, 46, W - MARGIN, 46)

    const boxTop = 52, boxH = 34, col2X = W / 2 + 4

    doc.setFillColor(...PRIMARY_L)
    doc.roundedRect(MARGIN, boxTop, W / 2 - 18, boxH, 3, 3, "F")
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("BILL TO", MARGIN + 5, boxTop + 7)
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(customerName, MARGIN + 5, boxTop + 14)
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text(customerEmail, MARGIN + 5, boxTop + 20)
    doc.text(`Ph: ${customerPhone}`, MARGIN + 5, boxTop + 26)

    doc.setFillColor(...PRIMARY_L)
    doc.roundedRect(col2X, boxTop, W - MARGIN - col2X, boxH, 3, 3, "F")
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("ORDER DETAILS", col2X + 5, boxTop + 7)

    const STATUS_COLORS = {
      pending: [146, 64, 14], confirmed: [30, 64, 175], processing: [55, 48, 163],
      shipped: [6, 95, 70], delivered: [22, 101, 52], cancelled: [153, 27, 27],
    }
    const sColor     = STATUS_COLORS[(order.status || "pending").toLowerCase()] || [71, 85, 105]
    const statusLabel = (order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)

    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Status:", col2X + 5, boxTop + 14)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...sColor)
    doc.text(statusLabel, col2X + 22, boxTop + 14)
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Items:", col2X + 5, boxTop + 20)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(String(items.length), col2X + 22, boxTop + 20)
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Total:", col2X + 5, boxTop + 26)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text(`Rs. ${total}`, col2X + 22, boxTop + 26)

    autoTable(doc, {
      startY: boxTop + boxH + 8,
      head: [["#", "Product", "Variant", "Qty", "Unit Price (Rs.)", "Total (Rs.)"]],
      body: items.map((item, i) => [
        i + 1,
        item.product_name || "—",
        item.variant_label || "—",
        item.quantity,
        parseFloat(item.unit_price || 0).toFixed(2),
        parseFloat(item.total_price || 0).toFixed(2),
      ]),
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: "bold", fontSize: 8.5, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 } },
      bodyStyles: { fontSize: 8.5, textColor: DARK, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 8, halign: "center" }, 2: { cellWidth: 26 }, 3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 30, halign: "right" }, 5: { cellWidth: 30, halign: "right", fontStyle: "bold" } },
      margin: { left: MARGIN, right: MARGIN },
      styles: { lineColor: BORDER, lineWidth: 0.2, overflow: "linebreak" },
    })

    const tY       = doc.lastAutoTable.finalY + 6
    const summaryX = W - MARGIN - 70
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.3)
    doc.line(summaryX, tY, W - MARGIN, tY)
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Subtotal", summaryX, tY + 7)
    doc.setTextColor(...DARK)
    doc.text(`Rs. ${total}`, W - MARGIN, tY + 7, { align: "right" })
    doc.setFillColor(...PRIMARY)
    doc.roundedRect(summaryX, tY + 11, W - MARGIN - summaryX, 11, 2, 2, "F")
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...WHITE)
    doc.text("Grand Total", summaryX + 4, tY + 18)
    doc.text(`Rs. ${total}`, W - MARGIN - 4, tY + 18, { align: "right" })

    if (order.note) {
      const nY = tY + 28
      doc.setFillColor(255, 251, 235)
      doc.roundedRect(MARGIN, nY, W - MARGIN * 2, 12, 2, 2, "F")
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(146, 64, 14)
      doc.text("Note:", MARGIN + 3, nY + 5)
      doc.setFont("helvetica", "normal"); doc.setTextColor(120, 80, 10)
      doc.text(order.note, MARGIN + 14, nY + 5)
    }

    doc.setFillColor(...PRIMARY)
    doc.rect(0, 282, W, 15, "F")
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...WHITE)
    doc.text("Thank you for shopping with Larry Pantry!", W / 2, 288, { align: "center" })
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 220, 225)
    doc.text("www.larrypantry.com  |  contact@larrypantry.com", W / 2, 293, { align: "center" })

    doc.save(`Larry-Pantry-Invoice-${String(order.id).padStart(5, "0")}.pdf`)
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-bag-shopping"
        title="All Orders"
        subtitle="View and manage customer orders"
      />

      <div className="app-card shadow-sm" style={{ borderRadius: 14, overflow: "hidden", border: "none" }}>

        {/* Tabs + Search */}
        <div style={{ padding: "16px 20px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    border: "none", borderRadius: 20, padding: "5px 14px",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s",
                    background: activeTab === tab ? "#0e606c" : "#f1f5f9",
                    color: activeTab === tab ? "#fff" : "#64748b",
                  }}>
                  {tab}
                  <span style={{
                    marginLeft: 6, background: activeTab === tab ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                    color: activeTab === tab ? "#fff" : "#94a3b8",
                    borderRadius: 10, padding: "1px 6px", fontSize: 11,
                  }}>
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 13,
              }} />
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13,
                  outline: "none", width: 260, color: "#374151",
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <span className="spinner-border spinner-border-sm me-2" style={{ color: "#0e606c" }} />
            <span style={{ color: "#64748b", fontSize: 14 }}>Loading orders...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-5">
            <i className="fa-solid fa-circle-exclamation mb-2" style={{ fontSize: 32, color: "#f87171" }} />
            <div className="text-danger fw-semibold mt-2">{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-5" style={{ color: "#94a3b8" }}>
            <i className="fa-solid fa-bag-shopping mb-3" style={{ fontSize: 36, opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>No orders found.</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="table-responsive">
            <table className="table mb-0" style={{ fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={th}>Order ID</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Date</th>
                  <th style={th}>Items</th>
                  <th style={th}>Total</th>
                  <th style={th}>Status</th>
                  <th style={th}>Invoice</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const items = order.items || []
                  const isOpen = expandedId === order.id
                  return (
                    <>
                      <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" }}>
                        <td style={td}>
                          <span style={{ fontWeight: 700, color: "#0e606c" }}>#{order.id}</span>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {order.customer_name || [order.first_name, order.last_name].filter(Boolean).join(" ") || "—"}
                          </div>
                          {(order.email || order.customer_email) && (
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{order.email || order.customer_email}</div>
                          )}
                          {order.mobile && (
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>{order.mobile}</div>
                          )}
                        </td>
                        <td style={td}>
                          <span style={{ color: "#64748b" }}>{fmtDate(order.created_at)}</span>
                        </td>
                        <td style={td}>
                          <span style={{
                            background: "#f1f5f9", color: "#475569",
                            padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          }}>
                            {items.length} item{items.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 700, color: "#1e293b" }}>
                            ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                          </span>
                        </td>
                        <td style={td}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={td}>
                          <button
                            onClick={e => downloadInvoice(e, order)}
                            title="Download Invoice"
                            style={{
                              background: "#0e606c", color: "#fff", border: "none",
                              borderRadius: 7, padding: "5px 12px", cursor: "pointer",
                              fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                              whiteSpace: "nowrap",
                            }}>
                            <i className="fa-solid fa-file-invoice" />
                            <span>Invoice</span>
                          </button>
                        </td>
                        <td style={td}>
                          {items.length > 0 && (
                            <button onClick={() => setExpandedId(isOpen ? null : order.id)}
                              style={{
                                border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff",
                                padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#0e606c",
                                fontWeight: 600, whiteSpace: "nowrap",
                              }}>
                              <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} me-1`} style={{ fontSize: 10 }} />
                              {isOpen ? "Hide" : "View"}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded items row */}
                      {isOpen && (
                        <tr key={`${order.id}-items`} style={{ background: "#f8fafc" }}>
                          <td colSpan={8} style={{ padding: "0 20px 16px" }}>
                            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
                              <div style={{
                                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                                padding: "10px 16px", background: "#f1f5f9",
                                fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                textTransform: "uppercase", letterSpacing: ".06em", gap: 8,
                              }}>
                                <span>Product</span>
                                <span>Variant</span>
                                <span>Qty</span>
                                <span>Unit Price</span>
                                <span>Total</span>
                              </div>
                              {items.map((item, idx) => (
                                <div key={idx} style={{
                                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                                  padding: "10px 16px", gap: 8, alignItems: "center",
                                  borderTop: "1px solid #e2e8f0", background: "#fff",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <img src={item.product_image} alt={item.product_name}
                                      onError={e => { e.target.src = "/admin-assets/images/placeholder.png" }}
                                      style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
                                    <span style={{ fontWeight: 500, fontSize: 13, color: "#1e293b" }}>
                                      {item.product_name}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: 12, color: "#64748b" }}>{item.variant_label}</span>
                                  <span style={{ fontSize: 13, color: "#374151" }}>{item.quantity}</span>
                                  <span style={{ fontSize: 13, color: "#475569" }}>
                                    ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                                  </span>
                                  <span style={{ fontWeight: 600, fontSize: 13, color: "#0e606c" }}>
                                    ₹{parseFloat(item.total_price || 0).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

const th = {
  padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: ".06em", border: "none",
}
const td = {
  padding: "14px 16px", border: "none", verticalAlign: "middle",
}

export default Orders
