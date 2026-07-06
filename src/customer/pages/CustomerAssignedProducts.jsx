import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { getAssignedProducts, placeOrder, STORAGE_URL } from "../../utils/customerApi"
import CustomerPageHeader from "../components/CustomerPageHeader"
import ProductDetailModal from "../components/ProductDetailModal"

const productImg = (p) => {
  const url = p.primary_image?.image_url || p.image_url || ""
  if (!url) return "/admin-assets/images/placeholder.png"
  return url.startsWith("http") ? url : STORAGE_URL + url
}

// qty stepper: [-] [n] [+]
function QtyInput({ value, onChange }) {
  return (
    <div className="d-flex align-items-center" style={{ gap: 4 }}>
      <button type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 28, height: 28, borderRadius: 7, border: '1.5px solid #d1d5db',
          background: value === 0 ? '#f1f5f9' : '#fff', color: '#374151',
          fontWeight: 700, fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>−</button>
      <input
        type="number" min={0}
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        style={{
          width: 44, height: 28, textAlign: 'center', borderRadius: 7,
          border: '1.5px solid #d1d5db', fontSize: 14, fontWeight: 600,
          color: value > 0 ? '#0e606c' : '#94a3b8',
        }}
      />
      <button type="button"
        onClick={() => onChange(value + 1)}
        style={{
          width: 28, height: 28, borderRadius: 7, border: '1.5px solid #0e606c',
          background: '#0e606c', color: '#fff',
          fontWeight: 700, fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>+</button>
    </div>
  )
}

function ProductCard({ product, qtys, onQtyChange, onViewDetails }) {
  const variants  = product.variants || []
  const hasAnyQty = variants.some(v => (qtys[v.id] || 0) > 0)
  const cardTotal = variants.reduce((s, v) => s + (qtys[v.id] || 0) * parseFloat(v.selling_price || 0), 0)

  return (
    <div className="app-card shadow-sm" style={{
      borderRadius: 14,
      border: hasAnyQty ? '2px solid #0e606c' : '2px solid #e2e8f0',
      transition: 'border-color .2s',
    }}>
      <div className="app-card-body p-3 p-md-4">

        {/* Product info row */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <img
            src={productImg(product)}
            alt={product.name}
            onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
            style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover',
              border: '1px solid #e2e8f0', flexShrink: 0 }}
          />
          <div className="flex-grow-1 overflow-hidden">
            <div className="fw-bold text-truncate" style={{ fontSize: 15, color: '#111' }}>
              {product.name}
              <button type="button" onClick={() => onViewDetails(product)} style={{ float: 'right', padding: 4, background: 'rgb(96 223 243)' }} className="btn btn-sm" ><i className="fa-regular fa-eye me-1" />View Details</button>
            </div>
            {product.category_name && (
              <div style={{ fontSize: 12, color: '#888' }}>{product.category_name}</div>
            )}
          </div>
          {hasAnyQty && (
            <div className="text-end flex-shrink-0">
              <div style={{ fontSize: 11, color: '#64748b' }}>Subtotal</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0e606c' }}>
                ${cardTotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Variants */}
        {variants.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 13 }}>No variants available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Variant', 'Unit Price', 'Quantity', 'Subtotal'].map((h, i) => (
                    <th key={h} style={{
                      padding: '7px 12px', fontSize: 11, fontWeight: 700,
                      color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em',
                      textAlign: i === 0 ? 'left' : 'center',
                      borderBottom: '1.5px solid #e2e8f0',
                      borderTop: '1.5px solid #e2e8f0',
                      borderLeft: i === 0 ? '1.5px solid #e2e8f0' : 'none',
                      borderRight: i === 3 ? '1.5px solid #e2e8f0' : 'none',
                      borderRadius: i === 0 ? '8px 0 0 0' : i === 3 ? '0 8px 0 0' : 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v, idx) => {
                  const qty     = qtys[v.id] || 0
                  const subTotal = qty * parseFloat(v.selling_price || 0)
                  const isLast  = idx === variants.length - 1
                  const rowBg   = qty > 0 ? '#f0fdf9' : '#fff'

                  return (
                    <tr key={v.id} style={{ background: rowBg, transition: 'background .15s' }}>
                      {/* Variant label */}
                      <td style={{
                        padding: '10px 12px', fontSize: 14, fontWeight: 600, color: '#111',
                        borderBottom: isLast ? '1.5px solid #e2e8f0' : '1px solid #f1f5f9',
                        borderLeft: '1.5px solid #e2e8f0',
                        borderRadius: isLast ? '0 0 0 8px' : 0,
                      }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                          background: qty > 0 ? '#dcfce7' : '#f1f5f9',
                          color: qty > 0 ? '#15803d' : '#374151',
                          fontSize: 13, fontWeight: 600,
                        }}>
                          {v.quantity} {v.unit_name || ''}
                        </span>
                      </td>

                      {/* Unit price */}
                      <td style={{
                        padding: '10px 12px', textAlign: 'center',
                        fontSize: 14, fontWeight: 600, color: '#0e606c',
                        borderBottom: isLast ? '1.5px solid #e2e8f0' : '1px solid #f1f5f9',
                      }}>
                        ${parseFloat(v.selling_price || 0).toFixed(2)}
                      </td>

                      {/* Qty stepper */}
                      <td style={{
                        padding: '10px 12px', textAlign: 'center',
                        borderBottom: isLast ? '1.5px solid #e2e8f0' : '1px solid #f1f5f9',
                      }}>
                        <div className="d-flex justify-content-center">
                          <QtyInput value={qty} onChange={val => onQtyChange(product.id, v.id, val)} />
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td style={{
                        padding: '10px 12px', textAlign: 'center',
                        fontSize: 14, fontWeight: 700,
                        color: qty > 0 ? '#0e606c' : '#cbd5e1',
                        borderBottom: isLast ? '1.5px solid #e2e8f0' : '1px solid #f1f5f9',
                        borderRight: '1.5px solid #e2e8f0',
                        borderRadius: isLast ? '0 0 8px 0' : 0,
                      }}>
                        {qty > 0 ? `$${subTotal.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function CustomerAssignedProducts() {
  const [products, setProducts] = useState([])
  // items: { [productId]: { [variantId]: qty } }
  const [items, setItems]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [placing, setPlacing]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [viewProduct, setViewProduct]   = useState(null) // product currently shown in details modal
  const [searchTerm, setSearchTerm]     = useState("")   // search box value

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await getAssignedProducts()
        const list = Array.isArray(res.data) ? res.data : []
        setProducts(list)
        const init = {}
        list.forEach(p => {
          init[p.id] = {}
          p.variants?.forEach(v => { init[p.id][v.id] = 0 })
        })
        setItems(init)
      } catch (err) {
        setError(err.message || "Failed to load assigned products.")
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleQtyChange = (productId, variantId, qty) => {
    setItems(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [variantId]: qty },
    }))
  }

  const resetAll = () => {
    setItems(prev => {
      const next = {}
      products.forEach(p => {
        next[p.id] = {}
        p.variants?.forEach(v => { next[p.id][v.id] = 0 })
      })
      return next
    })
  }

  // ── Search filter: product naam YA category naam se filter karo ──
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase()
    const nameMatch     = p.name?.toLowerCase().includes(term)
    const categoryMatch = p.category_name?.toLowerCase().includes(term)
    return nameMatch || categoryMatch
  })

  // ── Group filtered products category-wise ──
  const groupedProducts = filteredProducts.reduce((groups, p) => {
    const catName = p.category_name || "Uncategorized"
    if (!groups[catName]) groups[catName] = []
    groups[catName].push(p)
    return groups
  }, {})
  const categoryNames = Object.keys(groupedProducts)

  // all variant rows with qty > 0 (hamesha saare products se, search se independent)
  const orderItems = []
  products.forEach(p => {
    const qtys = items[p.id] || {};
    (p.variants || []).forEach(v => {
      if ((qtys[v.id] || 0) > 0)
        orderItems.push({ product_id: p.id, variant_id: v.id, quantity: qtys[v.id] })
    })
  })

  const totalPrice = orderItems.reduce((s, oi) => {
    const p = products.find(x => x.id === oi.product_id)
    const v = p?.variants?.find(x => x.id === oi.variant_id)
    return s + (parseFloat(v?.selling_price || 0) * oi.quantity)
  }, 0)

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      setError("Please add quantity to at least one variant.")
      setTimeout(() => setError(""), 3000)
      return
    }

    // Pehle note lene wala dialog
    const { value: note, isConfirmed } = await Swal.fire({
      title: "Add a Note",
      input: "textarea",
      inputLabel: "Any special instructions? (optional)",
      inputPlaceholder: "e.g. Please deliver before 10 AM, extra packaging needed...",
      inputAttributes: { maxlength: 500 },
      showCancelButton: true,
      confirmButtonColor: "#0e606c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Continue to Order",
      cancelButtonText: "Cancel",
      inputValue: customerNote,
    })

    if (!isConfirmed) return
    setCustomerNote(note || "")

    // Fir confirmation dialog
    const result = await Swal.fire({
      title: "Place Order?",
      html: `<div style="font-size:14px">
        <b>${orderItems.length} variant${orderItems.length > 1 ? 's' : ''}</b> selected<br/>
        Total: <b style="color:#0e606c">$${totalPrice.toFixed(2)}</b>
        ${note ? `<br/><br/><div style="background:#f8fafc;border-radius:8px;padding:8px 10px;text-align:left;font-size:13px;color:#374151"><i>Note: ${note}</i></div>` : ''}
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0e606c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Place Order",
      cancelButtonText: "Back",
    })
    if (!result.isConfirmed) return

    setPlacing(true); setError("")
    try {
      await placeOrder({ items: orderItems, customer_note: note || "" })
      setSuccess("Order placed successfully!")
      setTimeout(() => setSuccess(""), 4000)
      resetAll()
      setCustomerNote("")
    } catch (err) {
      setError(err.message || "Failed to place order.")
    } finally { setPlacing(false) }
  }

  const subtitle = loading ? 'Loading...'
    : products.length === 0 ? 'No products assigned yet'
    : `${products.length} product${products.length !== 1 ? 's' : ''} assigned to you`

  return (
    <>
      <CustomerPageHeader
        icon="fa-box"
        title="My Assigned Products"
        subtitle={subtitle}
        right={!loading && products.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass" style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12,
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                style={{
                  width: 260, height: 34, borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.3)', paddingLeft: 10, paddingRight: searchTerm ? 30 : 12,
                }}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12,
                }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
        )}
      />

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
          <i className="fa fa-check-circle" /><small>{success}</small>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
          <i className="fa fa-exclamation-circle" /><small>{error}</small>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border me-2" style={{ color: '#0e606c' }} />
          <span style={{ color: '#64748b' }}>Loading assigned products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
          <div className="app-card-body p-5 text-center">
            <i className="fa-solid fa-box" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
            <div className="fw-semibold" style={{ fontSize: 16, color: '#374151' }}>No products assigned yet</div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
              Your admin will assign products to your account.
            </div>
          </div>
        </div>
      ) : categoryNames.length === 0 ? (
        <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
          <div className="app-card-body p-5 text-center">
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 40, color: '#cbd5e1', marginBottom: 16 }} />
            <div className="fw-semibold" style={{ fontSize: 16, color: '#374151' }}>No products found</div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
              Try searching with a different keyword.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Category-wise Product Sections ── */}
          {categoryNames.map(catName => (
            <div key={catName} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{
                  width: 4, height: 20, borderRadius: 4, background: '#0e606c', flexShrink: 0,
                }} />
                <h6 className="mb-0 fw-bold" style={{ fontSize: 15, color: '#1e293b' }}>
                  {catName}
                </h6>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  ({groupedProducts[catName].length})
                </span>
              </div>
              <div className="d-flex flex-column gap-3">
                {groupedProducts[catName].map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qtys={items[p.id] || {}}
                    onQtyChange={handleQtyChange}
                    onViewDetails={setViewProduct}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ── Sticky Order Bar ── */}
          <div className="app-card shadow-sm" style={{
            borderRadius: 14, border: 'none',
            position: 'sticky', bottom: 16,
            background: orderItems.length > 0
              ? 'linear-gradient(135deg, #0e606c 0%, #0a4f59 100%)'
              : '#f8fafc',
            transition: 'background .3s',
          }}>
            <div className="app-card-body px-4 py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                {orderItems.length > 0 ? (
                  <>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      {orderItems.length} variant{orderItems.length > 1 ? 's' : ''} · {orderItems.reduce((s, i) => s + i.quantity, 0)} units
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      ${totalPrice.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>
                    Set quantity on any variant to place an order
                  </div>
                )}
              </div>
              <button
                className="btn fw-semibold px-4"
                style={{
                  background: orderItems.length > 0 ? '#fff' : '#e2e8f0',
                  color: orderItems.length > 0 ? '#0e606c' : '#94a3b8',
                  borderRadius: 10, border: 'none', fontSize: 14, height: 42,
                }}
                onClick={handlePlaceOrder}
                disabled={placing || orderItems.length === 0}
              >
                {placing
                  ? <><span className="spinner-border spinner-border-sm me-2" />Placing...</>
                  : <><i className="fa-solid fa-bag-shopping me-2" />Place Order</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Product Details Modal ── */}
      {viewProduct && (
        <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} />
      )}
    </>
  )
}

export default CustomerAssignedProducts
