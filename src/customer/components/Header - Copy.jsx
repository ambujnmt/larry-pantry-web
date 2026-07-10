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
                      <li><Link to="#">Food Menu</Link></li>
                      <li><Link to="/categories">Categories</Link></li>
                      <li><Link to="#">Special Offers / Deals</Link></li>
                      <li><Link to="/qa">Q & A</Link></li>
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
            {/* baaki mobile header same rahega */}
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;
