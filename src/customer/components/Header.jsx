// src/customer/components/Header.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWebsiteContact, getWebsiteSocial, getWebsiteLogo } from "../../utils/websiteApi";
import SearchBox from "./SearchBox";

function Header() {
  const [contact, setContact] = useState({ phone: "", email: "", address: "" })
  const [social, setSocial]   = useState({ facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" })
  const [logoUrl, setLogoUrl] = useState("/assets/img/logo.png")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [contactRes, socialRes, logoRes] = await Promise.all([
          getWebsiteContact(),
          getWebsiteSocial(),
          getWebsiteLogo(),
        ])
        setContact(contactRes.data || {})
        setSocial(socialRes.data || {})
        if (logoRes.data?.logo_url) setLogoUrl(logoRes.data.logo_url)
      } catch (e) {
        console.error("Header data load failed:", e)
      }
    }
    load()
  }, [])

  // Mobile menu khula ho to background scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    // { to: "#", label: "Food Menu" },
    { to: "/categories", label: "Categories" },
    { to: "#", label: "Special Offers / Deals" },
    { to: "/qa", label: "FAQ" },
    { to: "/contact", label: "Contact Us" },
  ]

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
                  {/* <p className="header-top-text-message">
                    Free shipping on orders over $25. <Link to="/">Read more</Link>
                  </p> */}
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="header-top-right-area header-top-settings">
                  {contact.phone && (
                    <p className="header-top-text-message">
                      <i className="icon-rt-call-outline"></i> Need help? Call Us:{" "}
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </p>
                  )}
                  <ul className="nav align-items-center head-social-icon">
                    {social.facebook && (
                      <li><a href={social.facebook} target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a></li>
                    )}
                    {social.instagram && (
                      <li><a href={social.instagram} target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a></li>
                    )}
                    {social.linkedin && (
                      <li><a href={social.linkedin} target="_blank" rel="noopener noreferrer"><i className="fa fa-linkedin"></i></a></li>
                    )}
                    {social.youtube && (
                      <li><a href={social.youtube} target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube"></i></a></li>
                    )}
                    {social.twitter && (
                      <li><a href={social.twitter} target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a></li>
                    )}
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
                  <Link to="/"><img src={logoUrl} alt="Logo" onError={e => { e.target.onerror = null; e.target.src = "/assets/img/logo.png" }} /></Link>
                </div>
              </div>
              <div className="col-lg-6">
                <SearchBox />
              </div>
              <div className="col-lg-3">
                <div className="header-middle-right-area">
                  <div className="my-account">
                    <Link to="/customer/login" className="header-action-item">
                      <i className="icon-rt-user"></i>
                    </Link>
                  </div>
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
                      {/*<li><Link to="#">Food Menu</Link></li>*/}
                      <li><Link to="/categories">Categories</Link></li>
                      <li><Link to="#">Special Offers / Deals</Link></li>
                      <li><Link to="/qa">FAQ</Link></li>
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
                  
                  <a  href="#moible-menu"
                    className="m-menu-btn mobile-menu-active"
                    onClick={e => { e.preventDefault(); setMobileMenuOpen(true) }}
                  >
                    <i className="icon-rt-bars-solid"></i>
                  </a>
                </div>
                <div className={`header-block search-block-mobile search-sidebar ${mobileSearchOpen ? "active" : ""}`}>
                  <button
                    type="button"
                    className="mobile-search-popup"
                    onClick={() => setMobileSearchOpen(prev => !prev)}
                  >
                    <i className="icon-rt-loupe"></i>
                  </button>

                  {mobileSearchOpen && (
                    <div className="mobile-search-panel">
                      <SearchBox
                        variant="mobile"
                        onNavigate={() => setMobileSearchOpen(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col mobile-header-mobile">
              <div className="logo text-center">
                <Link to="/"><img src={logoUrl} alt="Logo" onError={e => { e.target.onerror = null; e.target.src = "/assets/img/logo.png" }} /></Link>
              </div>
            </div>

            <div className="col mobile-header-right">
              <div className="header-middle-right-area">
                <div className="my-account">
                  <Link to="/customer/login" className="header-action-item">
                    <i className="icon-rt-user"></i>
                  </Link>
                </div>
                {/*<div className="cart">
                  <a href="#" className="header-action-item toolbar-btn">
                    <i className="icon-rt-basket-outline"></i>
                    <span className="wishlist-count">3</span>
                  </a>
                </div>*/}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE OFFCANVAS MENU ========== */}
      <div
        className={`offcanvas-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1040, display: mobileMenuOpen ? "block" : "none",
        }}
      />
      <div
        id="moible-menu"
        className={`offcanvas-mobile-menu ${mobileMenuOpen ? "active" : ""}`}
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 280,
          background: "#fff", zIndex: 1050, padding: "20px",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease", boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          overflowY: "auto",
        }}
      >
        <button
          type="button"
          className="btn-close-offcanvas"
          onClick={() => setMobileMenuOpen(false)}
          style={{ background: "none", border: "none", fontSize: 22, marginBottom: 20 }}
          aria-label="Close menu"
        >
          ✕
        </button>

        <nav className="offcanvas-navigation">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {navLinks.map(link => (
              <li key={link.label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <Link
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: "block", padding: "14px 4px", color: "#333", textDecoration: "none", fontWeight: 500 }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {contact.phone && (
          <p className="mt-4">
            <i className="icon-rt-call-outline"></i> Call Us: <a href={`tel:${contact.phone}`}>{contact.phone}</a>
          </p>
        )}
      </div>

    </header>
  );
}

export default Header;