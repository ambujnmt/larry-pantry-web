/*---- src\customer\components\ProductDetailModal.jsx ----*/
import { STORAGE_URL, getProductReviews } from "../../utils/customerApi"
import { useState, useEffect } from "react"
import StarRating from "./StarRating"

const css = `
  .pdm-backdrop {
    position: fixed; inset: 0; z-index: 1050;
    background: rgba(15,23,42,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: pdm-fade-in .18s ease;
  }
  @keyframes pdm-fade-in { from { opacity: 0 } to { opacity: 1 } }

  .pdm-modal {
    background: #fff;
    border-radius: 14px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,.22);
    animation: pdm-slide-up .2s ease;
  }
  @keyframes pdm-slide-up { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .pdm-header {
    padding: 18px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center; 
    justify-content: space-between;
    flex-shrink: 0;
  }

  .pdm-body {
    overflow-y: auto;
    flex: 1;
    padding: 22px 24px;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 24px;
  }
  @media (max-width: 640px) {
    .pdm-body { grid-template-columns: 1fr; }
  }
  .pdm-body::-webkit-scrollbar { width: 5px; }
  .pdm-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

  .pdm-thumb {
    width: 56px; height: 56px; border-radius: 8px; object-fit: cover;
    border: 2px solid #e2e8f0; cursor: pointer; flex-shrink: 0;
  }
  .pdm-thumb.active { border-color: #0e606c; }

  .pdm-info-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    flex: 1;
  }
  .pdm-info-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 3px;
  }
  .pdm-info-value {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }

  .pdm-table { width: 100%; border-collapse: collapse; }
  .pdm-table th {
    text-align: left; font-size: 12px; font-weight: 700; color: #475569;
    padding: 8px 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  .pdm-table td {
    padding: 9px 10px; font-size: 13.5px; color: #1e293b; border-bottom: 1px solid #f1f5f9;
  }

  .pdm-tag-badge {
    display: inline-block; padding: 3px 10px; border-radius: 6px;
    font-size: 12px; font-weight: 600; margin-right: 6px; margin-top: 8px;
  }

  .pdm-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: #e6f2f3;
    color: #0e606c;
  }

  .pdm-discount-badge {
    display: inline-block;
    margin-left: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #16a34a;
    vertical-align: middle;
  }

  .pdm-desc-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
  }
  .pdm-desc-box p { margin: 0 0 8px 0; }
  .pdm-desc-box p:last-child { margin-bottom: 0; }
`

const productImg = (p, url) => {
  const u = url || p?.primary_image?.image_url || p?.image_url || ""
  if (!u) return "/admin-assets/images/placeholder.png"
  return u.startsWith("http") ? u : STORAGE_URL + u
}

function ProductDetailModal({ product, onClose }) {
  const [activeImg, setActiveImg] = useState(null)
  const [rating, setRating] = useState({ average: 0, count: 0 })

  useEffect(() => {
    if (!product?.id) return
    getProductReviews(product.id).then(res => {
      const data = res?.data ?? res
      setRating({ average: data?.average_rating || 0, count: data?.review_count || 0 })
    }).catch(() => {})
  }, [product?.id])

  if (!product) return null

  const variants = product.variants || []
  // Support either an `images` array or a single primary image
  const images = product.images?.length ? product.images : (product.primary_image ? [product.primary_image] : [])
  const mainImage = productImg(product, activeImg)

  const tags = typeof product.tags === "string"
    ? product.tags.split(",").map(t => t.trim()).filter(Boolean)
    : (Array.isArray(product.tags) ? product.tags : [])

  return (
    <>
      <style>{css}</style>
      <div className="pdm-backdrop" onClick={onClose}>
        <div className="pdm-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="pdm-header">
            <h5 className="mb-0 fw-bold" style={{ fontSize: 18, color: "#1e293b" }}>View Product</h5>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#64748b", cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-solid fa-xmark" /></button>
          </div>

          {/* Body */}
          <div className="pdm-body">

            {/* Left: Image + Thumbnails */}
            <div>
              <div style={{ position: "relative" }}>
                <img
                  src={mainImage}
                  alt={product.name}
                  onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                  style={{ width: "100%", height: 240, borderRadius: 10, objectFit: "cover", border: "1px solid #e2e8f0" }}
                />

                {/* Icon badges (Gluten Free, Kosher, etc.) */}
                {product.stickers?.length > 0 && (
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                    {product.stickers.map((url, i) => (
                      <img key={i} src={url} alt="icon" style={{ width: 64, objectFit: "contain", background: "#fff", borderRadius: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.18)", padding: 2 }} />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {images.map((img, idx) => {
                    const src = productImg(product, img.image_url || img)
                    return (
                      <img
                        key={idx}
                        src={src}
                        alt=""
                        className={`pdm-thumb ${mainImage === src ? "active" : ""}`}
                        onClick={() => setActiveImg(img.image_url || img)}
                        onError={e => { e.target.onerror = null; e.target.src = "/admin-assets/images/placeholder.png" }}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              <div className="d-flex align-items-start justify-content-between mb-1">
                <h4 className="fw-bold mb-0" style={{ fontSize: 21, color: "#1e293b" }}>{product.name}</h4>
                {product.status !== undefined && (
                  <span style={{ background: Number(product.status) === 1 ? "#dcfce7" : "#fee2e2", color: Number(product.status) === 1 ? "#166534" : "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {Number(product.status) === 1 ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2 mb-2">
                <StarRating value={rating.average} size={14} />
                <span style={{ fontSize: 12.5, color: "#64748b" }}>{rating.count > 0 ? `${rating.average} (${rating.count} review${rating.count !== 1 ? "s" : ""})` : "No reviews yet"}</span>
              </div>

              {(product.sku || product.brand_name) && (
                <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 14 }}>
                  {product.sku && <>SKU: {product.sku}</>}
                  {product.sku && product.brand_name && " | "}
                  {product.brand_name && <>Brand: {product.brand_name}</>}
                </div>
              )}

              <div className="d-flex gap-3 mb-3 flex-wrap">
                {product.category_name && (
                  <div className="pdm-info-box">
                    <div className="pdm-info-label">Category</div>
                    <div className="pdm-info-value">{product.category_name}</div>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="pdm-info-box">
                    <div className="pdm-info-label">Tags</div>
                    <div className="d-flex flex-wrap gap-1" style={{ marginTop: 4 }}>
                      {tags.map(t => <span key={t} className="pdm-pill">{t}</span>)}
                    </div>
                  </div>
                )}
              </div>

              <div className="pdm-info-label mb-2" style={{ fontSize: 12 }}>Variants</div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                <table className="pdm-table">
                  <thead>
                    <tr><th>Qty & Unit</th><th>Regular Price</th><th>Selling Price</th></tr>
                  </thead>
                  <tbody>
                    {variants.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8" }}>No variants available</td></tr>
                    ) : variants.map((v, idx) => {
                      const regular = v.regular_price ? parseFloat(v.regular_price) : null
                      const selling = parseFloat(v.selling_price || 0)
                      const hasDiscount = regular != null && regular > selling
                      const discountPercent = hasDiscount ? Math.round((1 - selling / regular) * 100) : null
                      return (
                        <tr key={v.id ?? idx}>
                          <td>{v.quantity} {v.unit_name || ""}</td>
                          <td>
                            {hasDiscount ? (
                              <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>${regular.toFixed(2)}</span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ color: "#0e606c", fontWeight: 700 }}>
                            ${selling.toFixed(2)}
                            {hasDiscount && <span className="pdm-discount-badge">↓{discountPercent}%</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {(product.is_new_arrival === 1 || product.is_featured === 1) && (
                <div className="mb-3">
                  {product.is_new_arrival === 1 && <span className="pdm-tag-badge" style={{ background: "#cffafe", color: "#0e7490" }}>New Arrival</span>}
                  {product.is_featured === 1 && <span className="pdm-tag-badge" style={{ background: "#dcfce7", color: "#15803d" }}>Featured</span>}
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              {product.description && (
                <>
                  <div className="pdm-info-label mb-2" style={{ fontSize: 12 }}>Description</div>
                  <div className="pdm-desc-box" dangerouslySetInnerHTML={{ __html: product.description }} />
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "9px 22px", fontWeight: 600, fontSize: 14, color: "#374151", cursor: "pointer" }}>Close</button>
          </div>

        </div>
      </div>
    </>
  )
}

export default ProductDetailModal
