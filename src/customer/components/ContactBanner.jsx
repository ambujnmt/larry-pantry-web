// src/customer/components/ContactBanner.jsx

function ContactBanner() {
  return (
    <section className="banner-section">
      <div className="container-fluid px-0">
        <div className="row gx-0">
          <div className="col-md-4">
            <a href="#" className="inner-image">
              <img src="assets/img/img2.avif" alt="image" />
            </a>
          </div>
          <div className="col-md-4">
            <a href="#" className="inner-image position-relative">
              <img src="assets/images/banners/img2_banner2_mixy4.webp" alt="image" />
              <div className="banner-content banner-lg-text text-center w-100 start-0">
                <h2 className="banner-title text-white">Get Your Free Estimate</h2>
                <h2 className="banner-title-2 text-white">(323) 963-1600</h2>
                <h2 className="banner-offer text-white">restaurantpantryla@gmail.com</h2>
                <span className="mt-5 fw-semibold btn btn--primary btn--meddim">
                  Contact Us <i className="icon-rt-arrow-right-solid"></i>
                </span>
              </div>
            </a>
          </div>
          <a href="#" className="col-md-4">
            <div className="inner-image">
              <img src="assets/img/img3.avif" alt="image" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactBanner;