// src/customer/components/Footer.jsx
import { useState, useEffect } from "react";
import { getWebsiteSocial, getWebsiteLogo } from "../../utils/websiteApi";

function Footer() {
  const [social, setSocial] = useState({ facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "" })
  const [logoUrl, setLogoUrl] = useState("/assets/img/logo.png")

  useEffect(() => {
    const load = async () => {
      try {
        const [socialRes, logoRes] = await Promise.all([
          getWebsiteSocial(),
          getWebsiteLogo(),
        ])
        setSocial(socialRes.data || {})
        if (logoRes.data?.logo_url) setLogoUrl(logoRes.data.logo_url)
      } catch (e) {
        console.error("Footer data load failed:", e)
      }
    }
    load()
  }, [])

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
                    <img src={logoUrl} alt="Logo"
                      onError={e => { e.target.onerror = null; e.target.src = "/assets/img/logo.png" }} />
                  </a>
                </div>
                <ul className="footer-social-list">
                  {social.facebook && (
                    <li>
                      <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="facebook"><i className="fa fa-facebook"></i></a>
                    </li>
                  )}
                  {social.instagram && (
                    <li>
                      <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="instagram"><i className="icon-rt-logo-instagram"></i></a>
                    </li>
                  )}
                  {social.linkedin && (
                    <li>
                      <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="twitter"><i className="fa fa-linkedin"></i></a>
                    </li>
                  )}
                  {social.youtube && (
                    <li>
                      <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="youtube"><i className="icon-rt-2-youtube2"></i></a>
                    </li>
                  )}
                  {social.twitter && (
                    <li>
                      <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="twitter"><i className="fa fa-twitter"></i></a>
                    </li>
                  )}
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