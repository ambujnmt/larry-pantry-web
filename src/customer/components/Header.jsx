// src/customer/components/Header.jsx
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">

      {/* ========== DESKTOP HEADER ========== */}
      <div className="desktop-header header1 d-none d-lg-block">

        {/* Top Bar - Free shipping message + phone */}
        <div className="header-top-area border-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6">
                <div className="header-top-left-area">
                  <p className="header-top-text-message">
                    Free shipping on orders over $25. <Link to="/">Read more</Link>
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="header-top-right-area header-top-settings">
                  <p className="header-top-text-message">
                    <i className="icon-rt-call-outline"></i> Need help? Call Us:{" "}
                    <a href="tel:0123456789">+91-0123456789</a>
                  </p>
                  <ul className="nav align-items-center head-social-icon">
                    <li><i className="fa fa-facebook"></i></li>
                    <li><i className="fa fa-instagram"></i></li>
                    <li><i className="fa fa-linkedin"></i></li>
                    <li><i className="fa fa-youtube"></i></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Bar - Logo + Search + Cart icons */}
        <div className="header-middle-area">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3">
                <div className="logo">
                  <Link to="/"><img src="/assets/img/logo.png" alt="Larry Pantry Logo" /></Link>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="search-box">
                  <form className="search-field">
                    <input type="text" className="search-field" placeholder="Search product..." />
                    <button className="search-btn">
                      <i className="icon-rt-loupe"></i>
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="header-middle-right-area">
                  <div className="my-account">
                    <Link to="/customer/login" className="header-action-item">
                      <i className="icon-rt-user"></i>
                    </Link>
                  </div>
                  {/* <div className="wishlist">
                    <a href="#" className="header-action-item">
                      <i className="icon-rt-heart2"></i>
                      <span className="wishlist-count">2</span>
                    </a>
                  </div>
                  <div className="cart">
                    <a href="#" className="header-action-item toolbar-btn">
                      <i className="icon-rt-basket-outline"></i>
                      <span className="wishlist-count">3</span>
                    </a>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Navigation Menu */}
        <div className="header-bottom-area bg-secondary header-sticky">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-10 mx-auto text-center">
                <div className="main-menu-area white_text">
                  <nav className="main-navigation">
                    <ul>
                      <li className="active"><Link to="/">Home</Link></li>
                      <li><Link to="/about">About Us</Link></li>
                      <li><Link to="#">Food Menu</Link></li>
                      <li><Link to="/categories">Categories</Link></li>
                      <li><Link to="#">Special Offers / Deals</Link></li>
                      <li><Link to="#">Gallery</Link></li>
                      <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE HEADER ========== */}
      <div className="mobile-header main-header m-header-1 d-block d-lg-none">
        <div className="container">
          <div className="row align-items-center">
            <div className="col mobile-header-start">
              <div className="d-flex gap-2">
                <div className="menu-mobile">
                  <a href="#moible-menu" className="m-menu-btn mobile-menu-active">
                    <i className="icon-rt-bars-solid"></i>
                  </a>
                </div>
                <div className="header-block search-block-mobile search-sidebar">
                  <button className="mobile-search-popup">
                    <i className="icon-rt-loupe"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col mobile-header-mobile">
              <div className="logo text-center">
                <Link to="/"><img src="/assets/img/logo.png" alt="Larry Pantry Logo" /></Link>
              </div>
            </div>
            <div className="col mobile-header-right">
              <div className="header-middle-right-area">
                <div className="my-account">
                  <Link to="/customer/login" className="header-action-item">
                    <i className="icon-rt-user"></i>
                  </Link>
                </div>
                <div className="cart">
                  <a href="#" className="header-action-item toolbar-btn">
                    <i className="icon-rt-basket-outline"></i>
                    <span className="wishlist-count">3</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;
