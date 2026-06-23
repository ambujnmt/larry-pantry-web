// src/customer/components/Footer.jsx

function Footer() {
  return (
    <footer className="footer-section border-top">

      {/* Top Footer - Logo + Links */}
      <div className="footer-top-area pt-4 section-space-pb border-bottom">
        <div className="container">
          <div className="row">

            {/* Column 1 - Logo + Social */}
            <div className="col-lg-3 col-md-3 col-sm-6">
              <div className="footer-widget">
                <div className="footer-logo">
                  <a href="#">
                    <img src="/assets/img/logo.png" alt="Larry Pantry Logo" />
                  </a>
                </div>
                <ul className="footer-social-list">
                  <li>
                    <a href="#" className="facebook"><i className="fa fa-facebook"></i></a>
                  </li>
                  <li>
                    <a href="#" className="instagram"><i className="icon-rt-logo-instagram"></i></a>
                  </li>
                  <li>
                    <a href="#" className="twitter"><i className="fa fa-linkedin"></i></a>
                  </li>
                  <li>
                    <a href="#" className="youtube"><i className="icon-rt-2-youtube2"></i></a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2 - Information */}
            <div className="col-lg-3 col-md-3 col-sm-6 col-6">
              <div className="footer-widget">
                <h6 className="footer-title">INFORMATION</h6>
                <ul className="footer-list">
                  <li><a href="#">Contact us</a></li>
                  <li><a href="/about">About us</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Wishlist</a></li>
                  <li><a href="#">Checkout</a></li>
                </ul>
              </div>
            </div>

            {/* Column 3 - Quick Links */}
            <div className="col-lg-3 col-md-3 col-sm-6 col-6">
              <div className="footer-widget">
                <h6 className="footer-title">Quick Links</h6>
                <ul className="footer-list">
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Food Menu</a></li>
                  <li><a href="/categories">Categories</a></li>
                  <li><a href="#">Special Offers / Deals</a></li>
                  <li><a href="#">Gallery</a></li>
                  <li><a href="/contact">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* Column 4 - My Account */}
            <div className="col-lg-3 col-md-3 col-sm-6 col-6">
              <div className="footer-widget">
                <h6 className="footer-title">MY ACCOUNT</h6>
                <ul className="footer-list">
                  <li><a href="#">Login</a></li>
                  <li><a href="#">Register</a></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer - Copyright */}
      <div className="footer-bottom">
        <div className="container">
          <div className="copy-right-content text-center">
            <p>
              © Copyright 2026. All Rights Reserved. Powered By{" "}
              <a href="https://www.nmttechnologies.com/">NMT Technologies</a>
            </p>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
