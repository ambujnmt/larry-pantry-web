import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import { getAdminOrders, getAdminOrderDetail, updateOrderStatus } from "../../utils/adminApi"
import AdminPageHeader from "../components/AdminPageHeader"
import AdminOrderDetailModal from "../components/AdminOrderDetailModal"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

DataTable.use(DT)

const STATUS_BADGE = {
  pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  processing: { bg: "#e0e7ff", color: "#3730a3", label: "Processing" },
  shipped:    { bg: "#d1fae5", color: "#065f46", label: "Shipped" },
  delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
}

const STATUS_TABS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]
const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

function Orders() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState("All")
  const [updatingId, setUpdatingId] = useState(null) 

  const [selectedOrder, setSelectedOrder] = useState(null) 
  const [detailLoading, setDetailLoading] = useState(false) 
  const ordersRef = useRef([])

  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  useEffect(() => {
    getAdminOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    window.__viewAdminOrder = (id) => {
      const order = ordersRef.current.find(o => o.id === id)
      if (order) openOrderDetail(order)
    }
    window.__downloadAdminInvoice = (id) => {
      const order = ordersRef.current.find(o => o.id === id)
      if (order) downloadInvoiceFn(order)
    }
    return () => {
      delete window.__viewAdminOrder
      delete window.__downloadAdminInvoice
    }
  }, [])

  const openOrderDetail = (order) => {
    setSelectedOrder(order)
    setDetailLoading(true)
    getAdminOrderDetail(order.id)
      .then(res => setSelectedOrder(res.data))
      .catch(() => {}) 
      .finally(() => setDetailLoading(false))
  }

  const handleStatusChange = (order, newStatus, remarks = "") => {
    if (newStatus === order.status) return
    const prevStatus = order.status
    setUpdatingId(order.id)

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }))
    }

    updateOrderStatus(order.id, newStatus, "")
      .catch(() => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: prevStatus } : o))
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(prev => ({ ...prev, status: prevStatus }))
        }
        alert("Status could not be updated. Try again.")
      })
      .finally(() => setUpdatingId(null))
  }

  const downloadInvoiceFn = (order) => {
    const items = order.items || order.order_items || []
    const date = order.created_at
      ? new Date(order.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      : "—"
    const total = order.total_amount != null ? parseFloat(order.total_amount).toFixed(2) : "0.00"

    const customerName  = order.customer_name || [order.first_name, order.last_name].filter(Boolean).join(" ") || "—"
    const customerEmail = order.email || order.customer_email || "—"
    const customerPhone = order.mobile || order.phone || "—"

    const PRIMARY   = [14, 96, 108]
    const PRIMARY_L = [232, 246, 248]
    const DARK      = [15, 23, 42]
    const MUTED     = [100, 116, 139]
    const BORDER    = [226, 232, 240]
    const WHITE     = [255, 255, 255]

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const W = 210, MARGIN = 14

    doc.setFillColor(...PRIMARY); doc.rect(0, 0, W, 2, "F")
    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("Larry Pantry", MARGIN, 20)
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Fresh groceries delivered to your door", MARGIN, 26)
    doc.text("contact@larrypantry.com  |  +1 234 567 8900", MARGIN, 31)
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
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.4); doc.line(MARGIN, 46, W - MARGIN, 46)

    const boxTop = 52, boxH = 34, col2X = W / 2 + 4
    doc.setFillColor(...PRIMARY_L); doc.roundedRect(MARGIN, boxTop, W / 2 - 18, boxH, 3, 3, "F")
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("BILL TO", MARGIN + 5, boxTop + 7)
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(customerName, MARGIN + 5, boxTop + 14)
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text(customerEmail, MARGIN + 5, boxTop + 20)
    doc.text(`Ph: ${customerPhone}`, MARGIN + 5, boxTop + 26)

    doc.setFillColor(...PRIMARY_L); doc.roundedRect(col2X, boxTop, W - MARGIN - col2X, boxH, 3, 3, "F")
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text("ORDER DETAILS", col2X + 5, boxTop + 7)
    const statusLabel = (order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Status:", col2X + 5, boxTop + 14)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(statusLabel, col2X + 22, boxTop + 14)
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Items:", col2X + 5, boxTop + 20)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK)
    doc.text(String(items.length), col2X + 22, boxTop + 20)
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Total:", col2X + 5, boxTop + 26)
    doc.setFont("helvetica", "bold"); doc.setTextColor(...PRIMARY)
    doc.text(`$${total}`, col2X + 22, boxTop + 26)

    autoTable(doc, {
      startY: boxTop + boxH + 8,
      head: [["#", "Product", "Variant", "Qty", "Unit Price ($)", "Total ($)"]],
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
      columnStyles: {
        0: { cellWidth: 8, halign: "center" }, 2: { cellWidth: 26 },
        3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 30, halign: "right" },
        5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
      },
      margin: { left: MARGIN, right: MARGIN },
      styles: { lineColor: BORDER, lineWidth: 0.2, overflow: "linebreak" },
    })

    const tY = doc.lastAutoTable.finalY + 6
    const summaryX = W - MARGIN - 70
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.3); doc.line(summaryX, tY, W - MARGIN, tY)
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED)
    doc.text("Subtotal", summaryX, tY + 7)
    doc.setTextColor(...DARK); doc.text(`$${total}`, W - MARGIN, tY + 7, { align: "right" })
    doc.setFillColor(...PRIMARY); doc.roundedRect(summaryX, tY + 11, W - MARGIN - summaryX, 11, 2, 2, "F")
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...WHITE)
    doc.text("Grand Total", summaryX + 4, tY + 18)
    doc.text(`$${total}`, W - MARGIN - 4, tY + 18, { align: "right" })

    const note = order.customer_note || order.note
    if (note) {
      const nY = tY + 28
      doc.setFillColor(255, 251, 235); doc.roundedRect(MARGIN, nY, W - MARGIN * 2, 12, 2, 2, "F")
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(146, 64, 14)
      doc.text("Note:", MARGIN + 3, nY + 5)
      doc.setFont("helvetica", "normal"); doc.setTextColor(120, 80, 10)
      doc.text(note, MARGIN + 14, nY + 5)
    }

    doc.setFillColor(...PRIMARY); doc.rect(0, 282, W, 15, "F")
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...WHITE)
    doc.text("Thank you for shopping with Larry Pantry!", W / 2, 288, { align: "center" })
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 220, 225)
    doc.text("www.larrypantry.com  |  contact@larrypantry.com", W / 2, 293, { align: "center" })

    doc.save(`Larry-Pantry-Invoice-${String(order.id).padStart(5, "0")}.pdf`)
  }

  // Status according orders filter
  const filteredOrders = activeTab === "All"
    ? orders
    : orders.filter(o => (o.status || "pending").toLowerCase() === activeTab.toLowerCase())

  const tabCount = (tab) =>
    tab === "All" ? orders.length : orders.filter(o => (o.status || "pending").toLowerCase() === tab.toLowerCase()).length

  const dtOptions = {
    pageLength: 10,
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    order: [],
    language: {
      search: "Search:",
      lengthMenu: "Show _MENU_ entries",
      paginate: { previous: "Prev", next: "Next" }
    }
  }

  return (
    <>
      <AdminPageHeader
        icon="fa-bag-shopping"
        title="All Orders"
        subtitle="View and manage customer orders"
      />

      {!loading && error && (
        <div className="alert alert-danger d-flex gap-2 py-2">
          <i className="fa fa-exclamation-circle" /><small>{error}</small>
        </div>
      )}

      <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>

        {/* Status Tabs */}
        <div style={{ padding: "16px 20px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {STATUS_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  border: "none", borderRadius: 20, padding: "5px 14px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
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
        </div>

        <div className="app-card-body p-3 table-responsive">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" style={{ color: "#0e606c" }} />
              Loading orders...
            </div>
          ) : (
            <DataTable
              key={activeTab}
              className="table table-striped table-bordered table-hover"
              options={{
                ...dtOptions,
                columnDefs: [
                  { orderable: false, targets: [4, 5] } 
                ]
              }}
            >
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const date = order.created_at
                    ? new Date(order.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"
                  const total = order.total_amount != null
                    ? `$${parseFloat(order.total_amount).toFixed(2)}`
                    : "—"
                  const s = (order.status || "pending").toLowerCase()
                  const badge = STATUS_BADGE[s] || { bg: "#f1f5f9", color: "#475569", label: order.status }
                  const customerName = order.customer_name || [order.first_name, order.last_name].filter(Boolean).join(" ") || "—"
                  const customerContact = order.email || order.customer_email || order.mobile || ""

                  return (
                    <tr key={order.id}>
                      <td className="align-middle fw-semibold" style={{ color: "#0e606c" }}>
                        #{order.id}
                      </td>
                      <td className="align-middle">
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{customerName}</div>
                        {customerContact && (
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{customerContact}</div>
                        )}
                      </td>
                      <td className="align-middle" style={{ fontSize: 13, color: "#64748b" }}>
                        {date}
                      </td>
                      <td className="align-middle fw-semibold">
                        {total}
                      </td>
                      <td className="align-middle">
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <select
                            value={s} title="Select to change the status"
                            disabled={updatingId === order.id}
                            onChange={e => handleStatusChange(order, e.target.value)}
                            style={{
                              appearance: "none", WebkitAppearance: "none",
                              background: badge.bg, color: badge.color,
                              padding: "4px 26px 4px 10px", borderRadius: 20,
                              fontSize: 12, fontWeight: 600, border: "none",
                              cursor: updatingId === order.id ? "wait" : "pointer",
                              opacity: updatingId === order.id ? 0.6 : 1,
                            }}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt} style={{ color: "#1e293b", background: "#fff" }}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </select>
                          <i className="fa-solid fa-chevron-down" style={{
                            position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
                            fontSize: 9, color: badge.color, pointerEvents: "none",
                          }} />
                        </div>
                      </td>
                      <td className="align-middle">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openOrderDetail(order)}
                          title="View Order"
                        >
                          <i className="fa fa-eye me-1" />View
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: "#0e606c", color: "#fff", border: "none" }}
                          onClick={() => downloadInvoiceFn(order)}
                          title="Download Invoice"
                        >
                          <i className="fa-solid fa-file-invoice me-1" />Invoice
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-5" style={{ color: "#94a3b8" }}>
              <i className="fa-solid fa-bag-shopping mb-3" style={{ fontSize: 36, opacity: 0.3, display: "block" }} />
              <div style={{ fontSize: 14 }}>No orders found.</div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <AdminOrderDetailModal
          order={selectedOrder}
          loading={detailLoading}
          onClose={() => setSelectedOrder(null)}
          onDownload={downloadInvoiceFn}
          onStatusChange={handleStatusChange}
          updating={updatingId === selectedOrder.id}
        />
      )}
    </>
  )
}

export default Orders
