import { useState, useEffect } from "react"
import CustomerPageHeader from "../components/CustomerPageHeader"
import { getMyOrders, getProfile } from "../../utils/customerApi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const STATUS_BADGE = {
  pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  processing: { bg: "#e0e7ff", color: "#3730a3", label: "Processing" },
  shipped:    { bg: "#d1fae5", color: "#065f46", label: "Shipped" },
  delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || "pending"
  const style = STATUS_BADGE[s] || { bg: "#f1f5f9", color: "#475569", label: status }
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: ".03em",
    }}>
      {style.label}
    </span>
  )
}

function OrderSkeleton() {
  return (
    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ width: 120, height: 14, borderRadius: 6, background: "#e2e8f0", marginBottom: 8 }} />
          <div style={{ width: 80, height: 12, borderRadius: 6, background: "#f1f5f9" }} />
        </div>
        <div style={{ width: 70, height: 24, borderRadius: 20, background: "#e2e8f0" }} />
      </div>
    </div>
  )
}

function CustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [customer, setCustomer] = useState({})

  useEffect(() => {
    // localStorage se pehle load karo (instant)
    try {
      const stored = localStorage.getItem("customer_user")
      if (stored) setCustomer(JSON.parse(stored))
    } catch (_) {}

    // Fresh data API se
    getProfile()
      .then(res => {
        const profile = res?.data ?? res
        setCustomer(profile)
        localStorage.setItem("customer_user", JSON.stringify(profile))
      })
      .catch(() => {})

    getMyOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  const downloadInvoice = (e, order) => {
    e.stopPropagation()
    const items = order.items || order.order_items || []
    const date = order.created_at
      ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—"
    const total = order.total_amount != null ? parseFloat(order.total_amount).toFixed(2) : "0.00"

    // Customer info from state (API se fresh loaded)
    const customerName =
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.name || "—"
    const customerEmail = customer.email || "—"
    const customerPhone = customer.mobile || customer.phone || "—"

    const PRIMARY   = [14, 96, 108]
    const PRIMARY_L = [232, 246, 248]
    const DARK      = [15, 23, 42]
    const MUTED     = [100, 116, 139]
    const BORDER    = [226, 232, 240]
    const WHITE     = [255, 255, 255]

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const W = 210
    const MARGIN = 14

    // ── Top accent bar ──────────────────────────────────────────────────────
    doc.setFillColor(...PRIMARY)
    doc.rect(0, 0, W, 2, "F")

    // ── Header: Company (left) + Invoice label (right) ──────────────────────
    // Company block
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...PRIMARY)
    doc.text("Larry Pantry", MARGIN, 20)

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Fresh groceries delivered to your door", MARGIN, 26)
    doc.text("contact@larrypantry.com  |  +91 98765 43210", MARGIN, 31)
    doc.text("www.larrypantry.com", MARGIN, 36)

    // Invoice label block (right side)
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...PRIMARY)
    doc.text("INVOICE", W - MARGIN, 20, { align: "right" })

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text(`Invoice No.`, W - MARGIN, 28, { align: "right" })
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...DARK)
    doc.text(`#${String(order.id).padStart(5, "0")}`, W - MARGIN, 33, { align: "right" })

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Date", W - MARGIN, 40, { align: "right" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...DARK)
    doc.text(date, W - MARGIN, 45, { align: "right" })

    // ── Divider ─────────────────────────────────────────────────────────────
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.4)
    doc.line(MARGIN, 46, W - MARGIN, 46)

    // ── Bill To + Order Info boxes ───────────────────────────────────────────
    const boxTop = 52
    const boxH   = 34
    const col2X  = W / 2 + 4

    // Bill To box
    doc.setFillColor(...PRIMARY_L)
    doc.roundedRect(MARGIN, boxTop, W / 2 - 18, boxH, 3, 3, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...PRIMARY)
    doc.text("BILL TO", MARGIN + 5, boxTop + 7)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...DARK)
    doc.text(customerName, MARGIN + 5, boxTop + 14)
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text(customerEmail, MARGIN + 5, boxTop + 20)
    doc.text(`Ph: ${customerPhone}`, MARGIN + 5, boxTop + 26)

    // Order Info box
    doc.setFillColor(...PRIMARY_L)
    doc.roundedRect(col2X, boxTop, W - MARGIN - col2X, boxH, 3, 3, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...PRIMARY)
    doc.text("ORDER DETAILS", col2X + 5, boxTop + 7)

    const statusLabel = (order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)
    const STATUS_COLORS = {
      pending: [146, 64, 14], confirmed: [30, 64, 175], processing: [55, 48, 163],
      shipped: [6, 95, 70], delivered: [22, 101, 52], cancelled: [153, 27, 27],
    }
    const sColor = STATUS_COLORS[(order.status || "pending").toLowerCase()] || [71, 85, 105]

    doc.setFontSize(8.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Status:", col2X + 5, boxTop + 14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...sColor)
    doc.text(statusLabel, col2X + 22, boxTop + 14)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Items:", col2X + 5, boxTop + 20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...DARK)
    doc.text(String(items.length), col2X + 22, boxTop + 20)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Total:", col2X + 5, boxTop + 26)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...PRIMARY)
    doc.text(`Rs. ${total}`, col2X + 22, boxTop + 26)

    // ── Items Table ──────────────────────────────────────────────────────────
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
      headStyles: {
        fillColor: PRIMARY, textColor: WHITE,
        fontStyle: "bold", fontSize: 8.5,
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      },
      bodyStyles: { fontSize: 8.5, textColor: DARK, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        2: { cellWidth: 26 },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
      },
      margin: { left: MARGIN, right: MARGIN },
      styles: { lineColor: BORDER, lineWidth: 0.2, overflow: "linebreak" },
      tableLineColor: BORDER,
      tableLineWidth: 0.2,
    })

    // ── Totals summary ───────────────────────────────────────────────────────
    const tY = doc.lastAutoTable.finalY + 6
    const summaryX = W - MARGIN - 70

    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.line(summaryX, tY, W - MARGIN, tY)

    // Subtotal
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text("Subtotal", summaryX, tY + 7)
    doc.setTextColor(...DARK)
    doc.text(`Rs. ${total}`, W - MARGIN, tY + 7, { align: "right" })

    // Grand total row with background
    doc.setFillColor(...PRIMARY)
    doc.roundedRect(summaryX, tY + 11, W - MARGIN - summaryX, 11, 2, 2, "F")
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...WHITE)
    doc.text("Grand Total", summaryX + 4, tY + 18)
    doc.text(`Rs. ${total}`, W - MARGIN - 4, tY + 18, { align: "right" })

    // ── Note ────────────────────────────────────────────────────────────────
    if (order.note) {
      const nY = tY + 28
      doc.setFillColor(255, 251, 235)
      doc.roundedRect(MARGIN, nY, W - MARGIN * 2, 12, 2, 2, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(146, 64, 14)
      doc.text("Note:", MARGIN + 3, nY + 5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120, 80, 10)
      doc.text(order.note, MARGIN + 14, nY + 5)
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFillColor(...PRIMARY)
    doc.rect(0, 282, W, 15, "F")
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...WHITE)
    doc.text("Thank you for shopping with Larry Pantry!", W / 2, 288, { align: "center" })
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(180, 220, 225)
    doc.text("www.larrypantry.com  |  contact@larrypantry.com", W / 2, 293, { align: "center" })

    doc.save(`Larry-Pantry-Invoice-${String(order.id).padStart(5, "0")}.pdf`)
  }

  return (
    <>
      <CustomerPageHeader
        icon="fa-bag-shopping"
        title="My Orders"
        subtitle="View and track your orders"
      />

      <div className="app-card shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>

        {loading && (
          <div>
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-center">
            <i className="fa-solid fa-circle-exclamation mb-2" style={{ fontSize: 32, color: "#f87171" }} />
            <div className="text-danger fw-semibold mt-1">{error}</div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="app-card-body p-4 text-center py-5">
            <i className="fa-solid fa-bag-shopping mb-3" style={{ fontSize: 40, color: "#cbd5e1" }} />
            <div className="fw-semibold" style={{ fontSize: 15, color: "#374151" }}>No orders yet</div>
            <div className="text-muted mt-1" style={{ fontSize: 13 }}>Your placed orders will appear here.</div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
              padding: "12px 24px", background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em",
              gap: 8,
            }}>
              <span>Order ID</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map(order => {
              const isOpen = expandedId === order.id
              const date = order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
              const total = order.total_amount != null
                ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                : "—"
              const items = order.items || order.order_items || []

              return (
                <div key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {/* Row */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                    padding: "16px 24px", alignItems: "center", gap: 8,
                    cursor: items.length ? "pointer" : "default",
                    transition: "background .15s",
                  }}
                    onClick={() => items.length && toggleExpand(order.id)}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <span style={{ fontWeight: 600, color: "#0e606c", fontSize: 14 }}>
                      #{order.id}
                    </span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{date}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{total}</span>
                    <StatusBadge status={order.status} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        onClick={e => downloadInvoice(e, order)}
                        title="Download Invoice"
                        style={{
                          background: "#0e606c", color: "#fff", border: "none",
                          borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <i className="fa-solid fa-file-invoice" />
                        <span>Invoice</span>
                      </button>
                      {items.length > 0 && (
                        <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"}`}
                          style={{ color: "#94a3b8", fontSize: 12 }} />
                      )}
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isOpen && items.length > 0 && (
                    <div style={{ background: "#f8fafc", padding: "10px 24px 16px 24px" }}>
                      <div style={{
                        border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden",
                      }}>
                        <div style={{
                          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                          padding: "10px 16px", background: "#f1f5f9",
                          fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em",
                          gap: 8,
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
                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                              <span style={{ fontWeight: 500, fontSize: 13, color: "#1e293b" }}>
                                {item.product_name}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, color: "#64748b" }}>{item.variant_label}</span>
                            <span style={{ fontSize: 13, color: "#374151" }}>{item.quantity}</span>
                            <span style={{ fontSize: 13, color: "#475569" }}>
                              ₹{parseFloat(item.unit_price).toFixed(2)}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#0e606c" }}>
                              ₹{parseFloat(item.total_price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.note && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                          <span style={{ fontWeight: 600 }}>Note: </span>{order.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default CustomerOrders
