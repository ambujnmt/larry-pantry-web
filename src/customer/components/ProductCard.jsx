/*---- src\customer\components\ProductCard.jsx ----*/
import { useState, useEffect } from "react";
import { getProductReviews } from "../../utils/websiteApi";
import StarRating from "./StarRating";

function ProductCard({ productId, name, price, regularPrice, image, stickers = [] }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [rating, setRating] = useState({ average: 0, count: 0 })
  useEffect(() => {
    if (!productId) return
    getProductReviews(productId)
      .then(res => {
        const data = res?.data ?? res
        setRating({ average: data?.average_rating || 0, count: data?.review_count || 0 })
      })
      .catch(() => {})
  }, [productId])

  // Regular (MRP) price only counts as a "discount" if it's actually higher than the selling price
  const hasDiscount = regularPrice != null && price != null && parseFloat(regularPrice) > parseFloat(price)
  const discountPercent = hasDiscount ? Math.round((1 - parseFloat(price) / parseFloat(regularPrice)) * 100) : null

  return (
    <div className="single-product-item" style={{ padding: '0 8px' }}>
      <div className="single-product-item-image">
        <a href="#" className="prodcut-images" style={{ position: 'relative', display: 'block' }}>
          {!imgLoaded && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '400px 100%',
              animation: 'pc-shimmer 1.4s infinite linear',
              borderRadius: 8,
              zIndex: 1,
            }} />
          )}
          <img
            className="primary-image" 
            src={image}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
          />
          
          {/* Sticker badges (Gluten Free, Kosher, etc.) — top-left of the image */}
          {stickers?.length > 0 && (
            <div style={{
              position: 'absolute', top: 6, left: 6, zIndex: 2,
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {stickers.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="sticker"
                  style={{
                    width: 62, objectFit: 'contain',
                    background: '#fff', borderRadius: 6,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)', padding: 2,
                  }}
                />
              ))}
            </div>
          )}
        </a>
        {/*<ul className="single-product-item-action">
          <li className="single-product-item-action-list">
            <a href="#" className="single-product-item-action-link">
              <i className="icon-rt-heart2"></i>
            </a>
          </li>
          <li className="single-product-item-action-list">
            <a href="#" className="single-product-item-action-link">
              <i className="icon-rt-eye2"></i>
            </a>
          </li>
        </ul>*/}
      </div>
      <div className="single-product-item-content">
        <div className="single-product-item-rating" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StarRating value={rating.average} size={13} />
          {rating.count > 0 && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>({rating.count})</span>
          )}
        </div>
        <h6 className="single-product-item-title">
          <a href="#">{name}</a>
        </h6>
        <div className="single-product-item-price" style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          {hasDiscount && (
            <span style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 700 }}>
              ↓{discountPercent}%
            </span>
          )}
          {hasDiscount && (
            <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 12.5, fontWeight: 500 }}>
              ${parseFloat(regularPrice).toFixed(2)}
            </span>
          )}
          <span style={{ fontWeight: 700, color: '#0e606c' }}>
            {price != null ? `$${parseFloat(price).toFixed(2)}` : '—'}
          </span>
        </div>
        {/* <div className="cart-btn1">
          <a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a>
        </div> */}
      </div>
      <style>{`
        @keyframes pc-shimmer {
          0%   { background-position: -400px 0 }
          100% { background-position:  400px 0 }
        }
      `}</style>
    </div>
  );
}
export default ProductCard;
