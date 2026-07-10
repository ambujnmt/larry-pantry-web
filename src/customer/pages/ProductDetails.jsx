// src/customer/pages/ProductDetails.jsx
import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { getProductDetails, getProductsByCategory } from "../../utils/websiteApi"
import ProductCard from "../components/ProductCard"

function ProductDetails() {
  const { slug } = useParams()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [activeImage, setActiveImage] = useState(null)

  const [related, setRelated]         = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const scrollerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("")
      try {
        const res = await getProductDetails(slug)
        setProduct(res.data)
        setActiveImage(res.data?.primary_image?.image_url || null)
      } catch (err) {
        setError(err.message || "Failed to load product.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

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

  const getPrice = (p) => {
    const v = p.variants?.[0]
    return v ? `$${parseFloat(v.selling_price).toFixed(2)}` : "—"
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

  const mainImg = activeImage || product.primary_image?.image_url || "assets/images/products/product-image-1-1.jpg"

  return (
    <main className="container py-5">
      <div className="row g-4">

        {/* Left: Images */}
        <div className="col-md-5">
          <img
            src={mainImg}
            className="img-fluid rounded border w-100 mb-3"
            style={{ maxHeight: 400, objectFit: "cover" }}
            alt={product.name}
            onError={e => { e.target.onerror = null; e.target.src = "assets/images/products/product-image-1-1.jpg" }}
          />
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url}
                  alt=""
                  onClick={() => setActiveImage(img.image_url)}
                  onError={e => { e.target.onerror = null; e.target.src = "assets/images/products/product-image-1-1.jpg" }}
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

          <div className="text-muted mb-3">
            {product.category_name && <span>Category: {product.category_name}</span>}
            {product.brand_name && <span className="ms-3">Brand: {product.brand_name}</span>}
          </div>

          {product.variants?.length > 0 && (
            <table className="table table-bordered w-auto mb-4">
              <thead>
                <tr><th>Qty & Unit</th><th>Price</th></tr>
              </thead>
              <tbody>
                {product.variants.map((v, i) => (
                  <tr key={i}>
                    <td>{v.quantity} {v.unit_name}</td>
                    <td className="fw-semibold text-success">${parseFloat(v.selling_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {product.tags && (
            <div className="mb-3"><strong>Tags: </strong>{product.tags}</div>
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
            {related.map(p => (
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
                    <ProductCard name={p.name} price={getPrice(p)} image={getImage(p)} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetails