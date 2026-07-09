// src/customer/pages/Contact.jsx
import { useState, useEffect } from "react";
import { getWebsiteContact } from "../../utils/websiteApi";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";

function Contact() {
  // Dynamic contact state initialize kiya
  const [contact, setContact] = useState({ phone: "", email: "", address: "" });

  // Header ki tarah contact data load karne ke liye useEffect
  useEffect(() => {
    const loadContactData = async () => {
      try {
        const contactRes = await getWebsiteContact();
        setContact(contactRes.data || {});
      } catch (e) {
        console.error("Contact page data load failed:", e);
      }
    };
    loadContactData();
  }, []);

  return (
    <main>

      {/* Breadcrumb Start */}
      <Breadcrumb pageTitle="Contact Us" />
      {/* Breadcrumb End */}


      {/* Contact Info + Form Start */}
      <section className="page-secton-wrapper section-space-ptb">
        <div className="container">
          <div className="row">

            {/* Left - Contact Info */}
            <div className="col-lg-4">
              <div className="contact-us-area">
                <h2 className="fw-bold mb-3">Let us know how we can help</h2>
                <p>Please contact us using the below options. For fastest reply, please include your name, organization, appropriate contact information and a brief summary of your inquiry.</p>
                <ul className="mt-5">
                  
                  {/* 1. Mailing Address (Client Requirement: Office Location -> Mailing Address) */}
                  {contact.address && (
                    <li className="contact-feature-item">
                      <div className="contact-feature-icon">
                        <i className="icon-rt-location-pin"></i>
                      </div>
                      <div className="contact-feature-content">
                        <h5 className="contact-feature-title fw-bold mb-1">Mailing Address</h5>
                        <p style={{ whiteSpace: "pre-line" }}>{contact.address}</p>
                      </div>
                    </li>
                  )}

                  {/* 2. Call us anytime */}
                  {contact.phone && (
                    <li className="contact-feature-item">
                      <div className="contact-feature-icon feature-icon-2">
                        <i className="icon-rt-phone-volume-solid"></i>
                      </div>
                      <div className="contact-feature-content">
                        <h5 className="contact-feature-title fw-bold mb-1">Call us anytime</h5>
                        <p>
                          {/*For immediate help please call <br />*/}
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </p>
                      </div> 
                    </li>
                  )}

                  {/* 3. Send Email (Client Requirement: Send Mail -> Send Email) */}
                  {contact.email && (
                    <li className="contact-feature-item">
                      <div className="contact-feature-icon feature-icon-3">
                        <i className="icon-rt-mail-outline"></i>
                      </div>
                      <div className="contact-feature-content">
                        <h5 className="contact-feature-title fw-bold mb-1">Send Email</h5>
                        <p>
                          <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </p>
                      </div>
                    </li>
                  )}

                </ul>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="col-lg-8">
              <div className="contact-us-form-wrap">
                <form id="contact-form" action="#" method="post">
                  <div className="single-input-box">
                    <input type="text" placeholder="Name *" name="con_name" required />
                  </div>
                  <div className="single-input-box">
                    <input type="email" placeholder="Email *" name="con_email" required />
                  </div>
                  <div className="single-input-box">
                    <input type="text" placeholder="Phone" name="con_phone" />
                  </div>
                  <div className="single-input-box">
                    <textarea placeholder="Message *" name="con_message" required></textarea>
                  </div>
                  <div className="single-input-box">
                    <button type="submit" className="btn btn--primary">Send Message</button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* Contact Info + Form End */}


      {/* Google Map Start */}
      {/*<div className="ifram-map-wrapper">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14008.49392963452!2d77.367603!3d28.626060999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1778149750832!5m2!1sen!2sin"
          width="100%"
          height="330px"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map"
        ></iframe>
      </div>*/}
      {/* Google Map End */}


      {/* Contact Banner */}
      <ContactBanner />

      {/* Newsletter */}
      <Newsletter />

      {/* Features */}
      {/*<FeatureIcons />*/}

    </main>
  );
}

export default Contact;
