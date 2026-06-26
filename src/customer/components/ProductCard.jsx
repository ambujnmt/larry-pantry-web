// src/customer/components/ProductCard.jsx
import { useState } from "react";

function ProductCard({ name, price, image }) {
  const [imgLoaded, setImgLoaded] = useState(false)

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
        </a>
        <ul className="single-product-item-action">
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
        </ul>
      </div>
      <div className="single-product-item-content">
        <div className="single-product-item-rating">
          <i className="icon-rt-star-solid select-star"></i>
          <i className="icon-rt-star-solid select-star"></i>
          <i className="icon-rt-star-solid select-star"></i>
          <i className="icon-rt-star-solid select-star"></i>
          <i className="icon-rt-star-solid"></i>
        </div>
        <h6 className="single-product-item-title">
          <a href="#">{name}</a>
        </h6>
        <div className="single-product-item-price">{price}</div>
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
