import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import { getAdminOrders, getAdminOrderDetail, updateOrderStatus, uploadOrderInvoice } from "../../utils/adminApi"
import AdminPageHeader from "../components/AdminPageHeader"
import AdminOrderDetailModal from "../components/AdminOrderDetailModal"
import generateInvoicePdf from "../../utils/generateInvoicePdf"

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

  // Invoice upload (replaces old auto-generated PDF invoice)
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState(null)
  const invoiceInputRef = useRef(null)
  const invoiceTargetOrderId = useRef(null)

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
    return () => {
      delete window.__viewAdminOrder
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
      .catch(err => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: prevStatus } : o))
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(prev => ({ ...prev, status: prevStatus }))
        }
        alert(err.message)
      })
      .finally(() => setUpdatingId(null))
  }

  // NOTE: old auto-generate invoice (jsPDF) is now hidden.
  // Client uploads their own QuickBooks invoice instead — see below.
  // If ever needed again, the old logic lives in ../../utils/generateInvoicePdf.js (unused).

  const triggerInvoiceUpload = (order) => {
    invoiceTargetOrderId.current = order.id
    invoiceInputRef.current?.click()
  }

  const handleInvoiceFileChange = (e) => {
    const file = e.target.files?.[0]
    const orderId = invoiceTargetOrderId.current
    e.target.value = "" // allow re-selecting the same file next time
    if (!file || !orderId) return

    if (file.type !== "application/pdf") {
      alert("Only PDF invoices can be uploaded.")
      return
    }

    setUploadingInvoiceId(orderId)
    uploadOrderInvoice(orderId, file)
      .then(res => {
        const invoiceUrl = res.data?.invoice_url
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, invoice_url: invoiceUrl } : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, invoice_url: invoiceUrl }))
        }
      })
      .catch(err => alert(err.message || "Invoice upload failed. Please try again."))
      .finally(() => setUploadingInvoiceId(null))
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

      {/* Hidden file input shared by all rows for invoice upload/update */}
      <input
        ref={invoiceInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleInvoiceFileChange}
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
                  const isUploadingInvoice = uploadingInvoiceId === order.id

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

                        {order.invoice_url && (
                          <a
                            href={order.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-success me-1"
                            title="View Invoice"
                          >
                            <i className="fa-solid fa-file-pdf me-1" />Invoice
                          </a>
                        )}

                        <button
                          className={`btn btn-sm ${order.invoice_url ? "btn-outline-success" : "btn-outline-warning"}`}
                          onClick={() => triggerInvoiceUpload(order)}
                          disabled={isUploadingInvoice}
                          title={order.invoice_url ? "Update Invoice" : "Upload Invoice"}
                        >
                          {isUploadingInvoice ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : order.invoice_url ? (
                              <i className="fa-solid fa-pencil"></i>
                            ) : (
                              <>
                                <i className="fa-solid fa-upload me-1"></i>
                                Upload
                              </>
                            )}
                        </button>
                        {/*<button onClick={() => generateInvoicePdf(order)} className="btn btn-sm btn-outline-secondary">
                          <i className="fa-solid fa-file-invoice me-1" />Generate Invoice
                        </button>*/}
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
          onStatusChange={handleStatusChange}
          onUploadInvoice={triggerInvoiceUpload}
          uploadingInvoice={uploadingInvoiceId === selectedOrder.id}
          updating={updatingId === selectedOrder.id}
        />
      )}
    </>
  )
}

export default Orders
