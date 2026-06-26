import CustomerPageHeader from "../components/CustomerPageHeader"

function CustomerWishlist() {
  return (
    <>
      <CustomerPageHeader
        icon="fa-heart"
        title="Wishlist"
        subtitle="Your saved products"
      />
      <div className="app-card shadow-sm" style={{ borderRadius: 14 }}>
        <div className="app-card-body p-4 text-center py-5">
          <i className="fa-solid fa-heart mb-3" style={{ fontSize: 40, color: '#cbd5e1' }} />
          <div className="fw-semibold" style={{ fontSize: 15, color: '#374151' }}>Wishlist is empty</div>
          <div className="text-muted mt-1" style={{ fontSize: 13 }}>Products you save will appear here.</div>
        </div>
      </div>
    </>
  )
}

export default CustomerWishlist
