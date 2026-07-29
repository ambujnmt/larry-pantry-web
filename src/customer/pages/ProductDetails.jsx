// src/customer/pages/ProductDetails.jsx
import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { getProductDetails, getProductsByCategory, getProductReviews } from "../../utils/websiteApi"
import ProductCard from "../components/ProductCard"
import StarRating from "../components/StarRating"

function ProductDetails() {
  const { slug } = useParams()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [activeImage, setActiveImage] = useState(null)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)

  const [related, setRelated]         = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const scrollerRef = useRef(null)

  const [reviewData, setReviewData] = useState({ average_rating: 0, review_count: 0, reviews: [], has_more: false })
  const [reviewPage, setReviewPage] = useState(1)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("")
      try {
        const res = await getProductDetails(slug)
        setProduct(res.data)
        setActiveImage(res.data?.primary_image?.image_url || null)
        // Default to the product's marked default variant, else the first one
        const variants = res.data?.variants || []
        const defaultIdx = variants.findIndex(v => v.is_default == 1)
        setSelectedVariantIdx(defaultIdx >= 0 ? defaultIdx : 0)
      } catch (err) {
        setError(err.message || "Failed to load product.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  // Rating summary + reviews for this product
  // Rating summary + first page of reviews for this product
  useEffect(() => {
    if (!product?.id) return
    setReviewPage(1)
    getProductReviews(product.id, 1)
      .then(res => setReviewData(res.data || { average_rating: 0, review_count: 0, reviews: [], has_more: false }))
      .catch(() => {})
  }, [product?.id])

  const loadMoreReviews = () => {
    const nextPage = reviewPage + 1
    setLoadingMoreReviews(true)
    getProductReviews(product.id, nextPage)
      .then(res => {
        setReviewData(prev => ({
          ...res.data,
          reviews: [...prev.reviews, ...(res.data?.reviews || [])],
        }))
        setReviewPage(nextPage)
      })
      .catch(() => {})
      .finally(() => setLoadingMoreReviews(false))
  }

  // Related products: same category, current product excluded
  useEffect(() => {
    if (!product) return
    const categoryId = product.category_id || product.category?.id
    if (!categoryId) { setRelated([]); return }

    const loadRelated = async () => {
      setRelatedLoading(true)
      try {
        const res = await getProductsByCategory(categoryId)
        const list = (res.data || []).filter(
          p => p.id !== product.id && (p.slug || p.id) !== slug
        )
        setRelated(list)
      } catch {
        setRelated([])
      } finally {
        setRelatedLoading(false)
      }
    }
    loadRelated()
  }, [product, slug])

  const scrollByCards = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" })
  }

  // Returns { selling, regular } as numbers (or null) from the product's default/first variant
  const getPriceData = (p) => {
    const variants = p.variants || []
    const v = variants.find(x => x.is_default == 1) || variants[0]
    if (!v) return { selling: null, regular: null }
    const selling = v.selling_price != null ? parseFloat(v.selling_price) : null
    const regular = v.regular_price ? parseFloat(v.regular_price) : null
    return { selling, regular }
  }
  const getImage = (p) =>
    p.primary_image?.image_url || "/assets/img/no-image.jpg" 

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border" style={{ color: "#0e606c" }} />
      </div>
    )
  }

  if (error) {
    return <div className="container py-5 text-center text-danger">{error}</div>
  }

  if (!product) return null

  const images = product.images?.length
    ? product.images
    : (product.primary_image ? [product.primary_image] : [])

  const mainImg = activeImage || product.primary_image?.image_url || "/assets/img/no-image.jpg"

  const tags = typeof product.tags === "string"
    ? product.tags.split(",").map(t => t.trim()).filter(Boolean)
    : (Array.isArray(product.tags) ? product.tags : [])

  // Currently selected variant + its derived pricing
  const variants = product.variants || []
  const selectedVariant = variants[selectedVariantIdx] || variants[0] || null
  const selRegular = selectedVariant?.regular_price ? parseFloat(selectedVariant.regular_price) : null
  const selSelling = selectedVariant ? parseFloat(selectedVariant.selling_price || 0) : null
  const selHasDiscount = selRegular != null && selSelling != null && selRegular > selSelling
  const selDiscountPercent = selHasDiscount ? Math.round((1 - selSelling / selRegular) * 100) : null

  return (
    <main className="container py-5">
      <style>{`
        .pd-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: #e6f2f3;
          color: #0e606c;
        }
        .pd-discount-badge {
          display: inline-block;
          margin-left: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #16a34a;
          vertical-align: middle;
        }
        .pd-variant-pill {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #374151;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: border-color .15s, background .15s, color .15s;
        }
        .pd-variant-pill:hover { border-color: #0e606c; }
        .pd-variant-pill.active {
          border: 2px solid #0e606c;
          background: #e6f2f3;
          color: #0e606c;
          font-weight: 700;
        }
      `}</style>
      <div className="row g-4">

        {/* Left: Images */}
        <div className="col-md-5">
          <div style={{ position: "relative" }}>
            <img
              src={mainImg}
              className="img-fluid rounded border w-100 mb-3"
              style={{ maxHeight: 400, objectFit: "cover" }}
              alt={product.name}
              onError={e => { e.target.onerror = null; e.target.src = "/assets/img/no-image.jpg" }}
            />

            {/* Stickers overlay on the main image (Gluten Free, Kosher, etc.) */}
            {product.stickers?.length > 0 && (
              <div style={{
                position: "absolute", top: 10, left: 10,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                {product.stickers.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="sticker"
                    style={{
                      width: 96, objectFit: "contain",
                      background: "#fff", borderRadius: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.18)", padding: 3,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url}
                  alt=""
                  onClick={() => setActiveImage(img.image_url)}
                  onError={e => { e.target.onerror = null; e.target.src = "/assets/img/no-image.jpg" }}
                  style={{
                    width: 70, height: 70, objectFit: "cover", borderRadius: 8, cursor: "pointer",
                    border: mainImg === img.image_url ? "2px solid #0e606c" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="col-md-7">
          <h2 className="fw-bold mb-2">{product.name}</h2>

          <div className="d-flex align-items-center gap-2 mb-3">
            <StarRating value={reviewData.average_rating} size={16} />
            <span style={{ fontSize: 13, color: "#64748b" }}>
              {reviewData.review_count > 0
                ? `${reviewData.average_rating} (${reviewData.review_count} review${reviewData.review_count !== 1 ? "s" : ""})`
                : "No reviews yet"}
            </span>
          </div>

          <div className="text-muted mb-3">
            {product.category_name && <span>Category: {product.category_name}</span>}
            {product.brand_name && <span className="ms-3">Brand: {product.brand_name}</span>}
          </div>

          {/* Variant selector + price for the selected variant */}
          {variants.length > 0 && (
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedVariantIdx(i)}
                    className={`pd-variant-pill ${i === selectedVariantIdx ? "active" : ""}`}
                  >
                    {v.quantity} {v.unit_name}
                  </button>
                ))}
              </div>

              {selectedVariant && (
                <div className="d-flex align-items-baseline gap-2 flex-wrap">
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#0e606c" }}>
                    ${selSelling.toFixed(2)}
                  </span>
                  {selHasDiscount && (
                    <>
                      <span style={{ fontSize: 16, textDecoration: "line-through", color: "#94a3b8" }}>
                        ${selRegular.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
                        ↓{selDiscountPercent}% off
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-1">
                {tags.map(t => <span key={t} className="pd-pill">{t}</span>)}
              </div>
            </div>
          )}

          {product.description && (
            <div className="mb-4">
              <h5 className="fw-semibold mb-2">Description</h5>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          <Link to="/" className="btn btn-outline-secondary">
            <i className="fa fa-arrow-left me-2" />Back to Home
          </Link>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-5 pt-4 border-top">
        <h4 className="fw-bold mb-3">Customer Reviews</h4>
        {reviewData.reviews.length === 0 ? (
          <p className="text-muted">No reviews yet for this product.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviewData.reviews.map(r => (
              <div key={r.id} className="border rounded-3 p-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-semibold">{r.customer_name || "Customer"}</span>
                  <StarRating value={r.rating} size={13} />
                </div>
                {r.review_text && <div style={{ fontSize: 14, color: "#374151" }}>{r.review_text}</div>}
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            ))}
            {reviewData.has_more && (
              <button
                type="button"
                className="btn btn-outline-secondary align-self-start"
                onClick={loadMoreReviews}
                disabled={loadingMoreReviews}
              >
                {loadingMoreReviews ? "Loading..." : "Show more reviews"}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Related Products */}
      {!relatedLoading && related.length > 0 && (
        <section className="mt-5 pt-4 border-top">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h4 className="fw-bold mb-0">Related Products</h4>
              {product.category_name && (
                <small className="text-muted">More from {product.category_name}</small>
              )}
            </div>
            <div className="d-none d-md-flex gap-2">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                className="btn btn-sm btn-outline-secondary rounded-circle"
                style={{ width: 32, height: 32, padding: 'unset' }}
                aria-label="Scroll left"
              >
                <i className="fa fa-chevron-left" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                className="btn btn-sm btn-outline-secondary rounded-circle"
                style={{ width: 32, height: 32, padding: 'unset' }}
                aria-label="Scroll right"
              >
                <i className="fa fa-chevron-right" />
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="d-flex gap-3 pb-2"
            style={{
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {related.map(p => {
              const { selling, regular } = getPriceData(p)
              return (
                <div
                  key={p.id}
                  style={{
                    flex: "0 0 auto",
                    width: 190,
                    scrollSnapAlign: "start",
                  }}
                >
                  <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div
                      className="border rounded-3 h-100 bg-white"
                      style={{ transition: "box-shadow .2s, transform .2s" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.transform = "translateY(0)"
                      }}
                    >
                      <ProductCard productId={p.id} name={p.name} price={selling} regularPrice={regular} image={getImage(p)} stickers={p.stickers || []} />
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetails
