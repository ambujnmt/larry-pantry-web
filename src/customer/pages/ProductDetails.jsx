// src/customer/pages/ProductDetails.jsx
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getProductDetails } from "../../utils/websiteApi"

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [activeImage, setActiveImage] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("")
      try {
        const res = await getProductDetails(id)
        setProduct(res.data)
        setActiveImage(res.data?.primary_image?.image_url || null)
      } catch (err) {
        setError(err.message || "Failed to load product.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
    </main>
  )
}

export default ProductDetails
