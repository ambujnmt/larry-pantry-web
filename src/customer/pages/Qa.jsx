import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import { getWebsiteFaqs } from "../../utils/websiteApi";

function Faq() {
  // To manage the accordion's open/closed state
  const [openFaq, setOpenFaq] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    getWebsiteFaqs()
      .then(res => setFaqData(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // If a slider is needed on the Fox page in the future, it can be loaded here.
    setTimeout(() => {
      const $ = window.$;
      if (!$) return;
      try {
        // Code for Slick or other jQuery plugins can go here.
      } catch(e) {
        console.log("jQuery error:", e);
      }
    }, 500);
  }, []);

  return (
    <main>
      {/* Breadcrumb Start */}
      <Breadcrumb pageTitle="Frequently Asked Questions" />
      {/* Breadcrumb End */}

      {/* FAQ Page Main Section */}
      <section className="simple-about-us-section about-sec">
        <div className="container">
          <div className="row">
            
            {/* Left side: Banner image (like the one in 'About Us') */}
            <div className="col-md-4">
              <div className="banner text-center">
                <img src="/assets/img/faq.jpg" alt="FAQ Graphic" />
              </div>
            </div>

            {/* Right Side: FAQ Content */}
            <div className="col-md-8">
              <div className="simple-about-us-content">
                <div className="section-title-two">
                  <h3 className="sub-title">FAQ</h3>
                  <h2 className="section-title">Have Any Questions?</h2>
                </div>

                {/* React Native Accordion Wrapper */}
                <div className="faq-accordion-wrapper" style={{ marginTop: '30px' }}>
                  {loading ? (
                    <p className="text-muted">Loading...</p>
                  ) : faqData.length === 0 ? (
                    <p className="text-muted">No FAQs available right now.</p>
                  ) : faqData.map((faq, index) => (
                    <div 
                      key={faq.id ?? index} 
                      className={`faq-item ${openFaq === index ? 'active' : ''}`}
                      style={{ 
                        borderBottom: '1px solid #eee', 
                        padding: '15px 0',
                        cursor: 'pointer' 
                      }}
                      onClick={() => toggleFaq(index)}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                          {faq.question}
                        </h5>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                          {openFaq === index ? '−' : '+'}
                        </span>
                      </div>
                      
                      {openFaq === index && (
                        <div style={{ marginTop: '10px', color: '#666', animate: 'fadeIn 0.5s' }}>
                          <p style={{ marginBottom: 0 }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>


        </div>
      </section>

      {/* Bottom Banners */}
      <ContactBanner />
      <Newsletter />
      {/*<FeatureIcons />*/}
    </main>
  );
}

export default Faq;
