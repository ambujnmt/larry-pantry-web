import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// NOTE: This auto-generated invoice is HIDDEN from the customer UI now.
// Customer now downloads the invoice that admin uploads (via order.invoice_url) instead.
// Keeping this function here, unused, in case it's needed again later.
export default function generateCustomerInvoicePdf(order, customer) {
  const items = order.items || order.order_items || []
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "—"
  const total = order.total_amount != null ? parseFloat(order.total_amount).toFixed(2) : "0.00"

  const customerName  = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "—"
  const customerEmail = customer.email || "—"
  const customerPhone = customer.mobile || "—"

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
    styles: { lineColor: BORDER, lineWidth: 0.2 },
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

  if (order.customer_note) {
    const nY = tY + 28
    doc.setFillColor(255, 251, 235); doc.roundedRect(MARGIN, nY, W - MARGIN * 2, 12, 2, 2, "F")
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(146, 64, 14)
    doc.text("Note:", MARGIN + 3, nY + 5)
    doc.setFont("helvetica", "normal"); doc.setTextColor(120, 80, 10)
    doc.text(order.customer_note, MARGIN + 14, nY + 5)
  }

  doc.setFillColor(...PRIMARY); doc.rect(0, 282, W, 15, "F")
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...WHITE)
  doc.text("Thank you for shopping with Larry Pantry!", W / 2, 288, { align: "center" })
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 220, 225)
  doc.text("www.larrypantry.com  |  contact@larrypantry.com", W / 2, 293, { align: "center" })

  doc.save(`Larry-Pantry-Invoice-${String(order.id).padStart(5, "0")}.pdf`)
}
