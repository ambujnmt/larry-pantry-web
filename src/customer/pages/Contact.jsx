// src/customer/pages/Contact.jsx
import { useState, useEffect } from "react";
import { getWebsiteContact, submitContactForm } from "../../utils/websiteApi";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";

function Contact() {
  const [contact, setContact] = useState({ phone: "", email: "", address: "" });

  // Form ke liye state
  const [formData, setFormData] = useState({
    con_name: "",
    con_email: "",
    con_phone: "",
    con_message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      await submitContactForm({
        name: formData.con_name,
        email: formData.con_email,
        phone: formData.con_phone,
        message: formData.con_message,
      });

      setStatusMsg({ type: "success", text: "Your message has been sent successfully!" });
      setFormData({ con_name: "", con_email: "", con_phone: "", con_message: "" });
    } catch (err) {
      console.error("Contact form submit failed:", err);
      setStatusMsg({
        type: "error",
        text: err?.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <Breadcrumb pageTitle="Contact Us" />

      <section className="page-secton-wrapper section-space-ptb">
        <div className="container">
          <div className="row">

            {/* Left - Contact Info (same as before) */}
            <div className="col-lg-4">
              <div className="contact-us-area">
                <h2 className="fw-bold mb-3">Let us know how we can help</h2>
                <p>Please contact us using the below options. For fastest reply, please include your name, organization, appropriate contact information and a brief summary of your inquiry.</p>
                <ul className="mt-5">
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
                  {contact.phone && (
                    <li className="contact-feature-item">
                      <div className="contact-feature-icon feature-icon-2">
                        <i className="icon-rt-phone-volume-solid"></i>
                      </div>
                      <div className="contact-feature-content">
                        <h5 className="contact-feature-title fw-bold mb-1">Call us anytime</h5>
                        <p><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>
                      </div>
                    </li>
                  )}
                  {contact.email && (
                    <li className="contact-feature-item">
                      <div className="contact-feature-icon feature-icon-3">
                        <i className="icon-rt-mail-outline"></i>
                      </div>
                      <div className="contact-feature-content">
                        <h5 className="contact-feature-title fw-bold mb-1">Send Email</h5>
                        <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right - Contact Form (ab dynamic) */}
            <div className="col-lg-8">
              <div className="contact-us-form-wrap">
                <form id="contact-form" onSubmit={handleSubmit}>
                  <div className="single-input-box">
                    <input
                      type="text"
                      placeholder="Name *"
                      name="con_name"
                      value={formData.con_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="single-input-box">
                    <input
                      type="email"
                      placeholder="Email *"
                      name="con_email"
                      value={formData.con_email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="single-input-box">
                    <input
                      type="text"
                      placeholder="Phone"
                      name="con_phone"
                      value={formData.con_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="single-input-box">
                    <textarea
                      placeholder="Message *"
                      name="con_message"
                      value={formData.con_message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {statusMsg.text && (
                    <div className="single-input-box">
                      <p style={{ color: statusMsg.type === "success" ? "green" : "red" }}>
                        {statusMsg.text}
                      </p>
                    </div>
                  )}

                  <div className="single-input-box">
                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <ContactBanner />
      <Newsletter />
    </main>
  );
}

export default Contact;