import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";

function Faq() {
  // Accordion open/close state manage karne ke liye
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    // Agar future mein FAQs page par kisi slider ki zaroorat pade toh use yahan load kar sakte hain
    setTimeout(() => {
      const $ = window.$;
      if (!$) return;
      try {
        // Slick ya doosre jQuery plugins ka code yahan aa sakta hai
      } catch(e) {
        console.log("jQuery error:", e);
      }
    }, 500);
  }, []);

  const faqData = [
      {
        question: "Are all Restaurant Pantry LA products Kosher / Glatt Kosher?",
        answer:
          "Yes, all RPLA items are Kosher / Glatt Kosher. All processed food products display recognized symbols of certified kosher supervision."
      },
      {
        question: "Who can order?",
        answer:
          "Our products may be purchased by anyone."
      },
      {
        question: "Do you deliver?",
        answer:
          "We only deliver. There is no pickup option."
      },
      {
        question: "What is your minimum order?",
        answer:
          "Our minimum order varies depending on the distance involved. Feel free to contact us via phone or email with your exact requirements."
      },
      {
        question: "Are the prices on the website guaranteed?",
        answer:
          "Yes, except for produce. Produce item pricing is subject to a 10% variation without prior notice."
      },
      {
        question: "What are your operating hours?",
        answer:
          "Sunday through Thursday, 9:00 a.m. – 5:00 p.m."
      },
      {
        question: "What is the order deadline for next-day orders?",
        answer:
          "Orders placed by 7:00 p.m. on the previous evening will be delivered on the next operating business day."
      },
      {
        question: "Is same-day delivery possible?",
        answer:
          "In certain cases, same-day delivery is available. If ordering online, please call us to confirm whether same-day delivery is possible."
      },
      {
        question: "What forms of payment are accepted?",
        answer:
          "We accept Zelle, Venmo, check, and cash."
      },
      {
        question: "Are you open to adding products that are not currently listed on your website?",
        answer:
          "Absolutely! Please contact us by phone or email with the product specifications and desired quantity. We will do our best to source the item and make you a happy customer."
      }
    ];

  return (
    <main>
      {/* Breadcrumb Start */}
      <Breadcrumb pageTitle="Frequently Asked Questions" />
      {/* Breadcrumb End */}

      {/* FAQ Page Main Section */}
      <section className="simple-about-us-section about-sec">
        <div className="container">
          <div className="row">
            
            {/* Left Side: Banner Image (Jaise About Us mein tha) */}
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
                  {faqData.map((faq, index) => (
                    <div 
                      key={index} 
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
