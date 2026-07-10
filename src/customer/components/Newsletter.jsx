// src/customer/components/Newsletter.jsx
import { useState, useEffect } from "react";
import { getWebsiteContact, subscribeNewsletter } from "../../utils/websiteApi";

function Newsletter() {
  const [contact, setContact] = useState({ phone: "" })
  const [email, setEmail]         = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback]   = useState({ type: "", message: "" }) // type: "success" | "error"

  useEffect(() => {
    getWebsiteContact()
      .then(res => setContact(res.data || {}))
      .catch(e => console.error("Newsletter contact load failed:", e))
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setFeedback({ type: "", message: "" })

    try {
      const res = await subscribeNewsletter(email.trim())
      setFeedback({ type: "success", message: res.message || "Subscribed successfully!" })
      setEmail("")
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong. Please try again."
      setFeedback({ type: "error", message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="newsletter-section bg-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 col-md-6 order-md-1 order-lg-1">
            <div className="newsletter-title-wrap">
              <div className="newsletter-content">
                <h2>Get Fresh Deals in Your Inbox</h2>
                <p>Subscribe for weekly discounts, new arrivals, and exclusive offers — straight to your email.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mt-4 mt-md-0 order-md-2 order-lg-3">
            <div className="newsletter-whatsapp-wrap">
              <div className="newsletter-whatsapp-inner">
                <div className="whatsapp-content">
                  <p>Call Us 24/7</p>
                  {contact.phone ? (
                    <h2><a href={`tel:${contact.phone}`} className="text-white text-decoration-none">{contact.phone}</a></h2>
                  ) : (
                    <h2>—</h2>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5 col-md-12 mt-4 mt-lg-0 order-md-3 order-lg-2 text-center">
            {feedback.message && (
              <h4
                className="mt-2 mb-0 fw-bold"
                style={{ color: feedback.type === "success" ? "#086208" : "#ffc107" }}
              >
                {feedback.message}
              </h4>
            )}
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your Email Address..."
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
              <button
                className="btn btn--primary submit-button fw-semibold"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Subscribing..." : "Subscribe!"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Newsletter;