// src/customer/components/FeatureIcons.jsx

function FeatureIcons() {
  return (
    <section className="our-feature-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-feature-item">
              <div className="feature-icon feature-icon-1">
                <i className="icon-rt-shipping-fast-solid"></i>
              </div>
              <div className="feature-content">
                <h6 className="title">Free Shipping</h6>
                <p className="description">Online Only. Exclusions Apply</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-feature-item">
              <div className="feature-icon feature-icon-2">
                <i className="icon-rt-money-bill-wave-solid"></i>
              </div>
              <div className="feature-content">
                <h6 className="title">Best Price Guarantee</h6>
                <p className="description">If You Find a Lower Price</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-feature-item">
              <div className="feature-icon feature-icon-3">
                <i className="icon-rt-gift-solid"></i>
              </div>
              <div className="feature-content">
                <h6 className="title">Free Curbside Pickup</h6>
                <p className="description">Grab Your Gear and Go</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="single-feature-item">
              <div className="feature-icon feature-icon-4">
                <i className="icon-rt-help-buoy-outline"></i>
              </div>
              <div className="feature-content">
                <h6 className="title">Support 24/7</h6>
                <p className="description">Contact us 24 hours a day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureIcons;