// src/customer/pages/About.jsx
import { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import { getWebsitePage } from "../../utils/websiteApi";
import Testimonials from "../components/Testimonials";

function About() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWebsitePage("about-us")
      .then(res => setPage(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const $ = window.$;
      if (!$) return;
      try {
        $('.testimonials-slider-active').slick({
          dots: true,
          infinite: true,
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: false,
          prevArrow: '<button type="button" class="slick-prev"><i class="icon-rt-arrow-left-solid"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"></i></button>',
          responsive: [
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } }
          ]
        });
      } catch(e) {
        console.log("Slick error:", e);
      }
    }, 500);
  }, []);
  return (
    <main>

      {/* Breadcrumb Start */}
      <Breadcrumb pageTitle="About Us" />
      {/* Breadcrumb End */}


      {/*About Page*/}
        <section className="simple-about-us-section about-sec">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-5">
                        <div className="banner text-center">
                            <img src={page?.image_url || "assets/img/about-img.png"} alt="image" />
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="simple-about-us-content">
                            <div className="section-title-two">
                                <h3 className="sub-title">About Us</h3>
                                <h2 className="section-title">{page?.title || "Welcome to Restaurant Pantry LA"}</h2>
                            </div>
                            <div className="single-about-inner-content">
                                {loading ? (
                                  <p className="text-muted">Loading...</p>
                                ) : (
                                  <div dangerouslySetInnerHTML={{ __html: page?.content || "" }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-4 col-md-4">
                        <div className="single-process-item">
                            <div className="image">
                                <img src="assets/img/home-icon.jpg" alt="image" />
                            </div>
                            <img className="process-arrow-image d-none d-lg-block" src="assets/images/others/line1.png" alt="image" />
                            <p>Shop groceries and home essentials from your favorite local stores.</p>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4">
                        <div className="single-process-item">
                            <div className="image">
                                <img src="assets/img/home-icon2.jpg" alt="image" />
                            </div>
                            <img className="process-arrow-image  d-none d-lg-block" src="assets/images/others/line2.png" alt="image" />
                            <p>Burpy routes your order to a vetted Personal Shopper who collects your items.</p>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4">
                        <div className="single-process-item">
                            <div className="image">
                                <img src="assets/images/others/img3_banner2_mixy3.webp" alt="image" />
                            </div>
                            <p>Your order is delivered in as little as 1 hour.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section> 
        {/*// About Page */}


        {/*Testimonials Section Start*/}
        <Testimonials />
        {/*Testimonials Section Start*/}


      {/* Contact Banner */}
      <ContactBanner />

      {/* Newsletter */}
      <Newsletter />

      {/* Features */}
      {/*<FeatureIcons />*/}

    </main>
  );
}

export default About;
