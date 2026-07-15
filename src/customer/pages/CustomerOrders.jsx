import { useState, useEffect, useRef } from "react"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import { getMyOrders, getProfile } from "../../utils/customerApi"
import CustomerPageHeader from "../components/CustomerPageHeader"
import OrderDetailModal from "../components/OrderDetailModal"

DataTable.use(DT)

const STATUS_BADGE = {
  pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed:  { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  processing: { bg: "#e0e7ff", color: "#3730a3", label: "Processing" },
  shipped:    { bg: "#d1fae5", color: "#065f46", label: "Shipped" },
  delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
}

function CustomerOrders() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [customer, setCustomer]       = useState({})

  // Ref — DataTable ke andar buttons ko orders state se connect karne ke liye
  const ordersRef = useRef([])

  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customer_user")
      if (stored) setCustomer(JSON.parse(stored))
    } catch (_) {}

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

  // View button click — window function ke through (DataTable se React state connect)
  useEffect(() => {
    window.__viewOrder = (id) => {
      const order = ordersRef.current.find(o => o.id === id)
      if (order) setSelectedOrder(order)
    }
    return () => {
      delete window.__viewOrder
    }
  }, [])


  const dtOptions = {
    pageLength: 10,
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    order: [[0, "desc"]],
    language: {
      search: "Search:",
      lengthMenu: "Show _MENU_ entries",
      paginate: { previous: "Prev", next: "Next" }
    }
  }

  return (
    <>
      <CustomerPageHeader
        icon="fa-bag-shopping"
        title="My Orders"
        subtitle="View and track your orders"
      />

      {!loading && error && (
        <div className="alert alert-danger d-flex gap-2 py-2">
          <i className="fa fa-exclamation-circle" /><small>{error}</small>
        </div>
      )}

      <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
        <div className="app-card-body p-3 table-responsive">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" style={{ color: "#0e606c" }} />
              Loading orders...
            </div>
          ) : (
            <DataTable
              className="table table-striped table-bordered table-hover"
              options={{
                ...dtOptions,
                columnDefs: [
                  { orderable: false, targets: [3, 4] } // Status aur Actions sort nahi honge
                ]
              }}
            >
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const date = order.created_at
                    ? new Date(order.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"
                  const total = order.total_amount != null
                    ? `$${parseFloat(order.total_amount).toFixed(2)}`
                    : "—"
                  const s = (order.status || "pending").toLowerCase()
                  const badge = STATUS_BADGE[s] || { bg: "#f1f5f9", color: "#475569", label: order.status }

                  return (
                    <tr key={order.id}>
                      <td className="align-middle fw-semibold" style={{ color: "#0e606c" }}>
                        #{order.id}
                      </td>
                      <td className="align-middle" style={{ fontSize: 13, color: "#64748b" }}>
                        {date}
                      </td>
                      <td className="align-middle fw-semibold">
                        {total}
                      </td>
                      <td className="align-middle">
                        <span style={{
                          background: badge.bg, color: badge.color,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="align-middle">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order"
                        >
                          <i className="fa fa-eye me-1" />View
                        </button>
                        {order.invoice_url ? (
                          <a
                            href={order.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-success"
                            title="Download Invoice"
                          >
                            <i className="fa-solid fa-file-pdf me-1" />Invoice
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>Invoice pending</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  )
}

export default CustomerOrders