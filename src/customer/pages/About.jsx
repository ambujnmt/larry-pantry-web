// src/customer/pages/About.jsx
import { useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";

function About() {
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
                            <img src="assets/img/about-img.png" alt="image" />
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="simple-about-us-content">
                            <div className="section-title-two">
                                <h3 className="sub-title">About Us</h3>
                                <h2 className="section-title">Welcome to Larry Pantry</h2>
                            </div>
                            <div className="single-about-inner-content">
                                <p>
                                    <strong>Update #1, 04/15/2026:</strong>
                                </p>

                                <p>
                                    It was 2006, and at age 14, Levi Graubard began working at the Chick ‘n Chow
                                    Restaurant in Los Angeles. Then, in 2013, at age 21, Levi purchased the
                                    restaurant from the owner, and business really took off!
                                </p>

                                <p>
                                    Living the ins and outs of the restaurant business gave Levi a unique
                                    perspective to help others in his field. Keeping the restaurant constantly
                                    stocked with all supplies needed in a timely manner - Keeping the staff
                                    population in correct synch with the ebb and flow of business - Finding the
                                    right price point to sell quality goods at a profit while maintaining
                                    outstanding customer satisfaction - These are just some of the many focal
                                    spots that required meticulous monitoring and planning. More than anything
                                    else, having a positive personal relationship with his customers meant
                                    everything to Levi.
                                </p>

                                <p>
                                    With his personal values and goals in mind, Levi began to branch out towards
                                    other dimensions of the food industry where he felt that he could make a
                                    difference.
                                </p>

                                <p>
                                    Thus, RPLA was born. Customers can rely on RPLA to deliver quality products
                                    in an efficient timely manner.
                                </p>

                                <p>
                                    <strong>A quality experience from start to finish!</strong>
                                </p>

                                <p>
                                    All RPLA products are kosher / glatt kosher.
                                </p>

                                <p>
                                    RPLA is always looking to add new products. We would love to hear from you!
                                    Please drop us a line to let us know what you would like to see next!
                                </p>
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
        <section className="testimonials-section section-space-ptb-90 bg-gray">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                        <div className="section-title-two mb-30 mb-lg-0">
                            <h3 className="sub-title">Testimonials</h3>
                            <h2 className="section-title">Why Do People Love Us</h2>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="testimonials-slider-active px-3 slider-inner-pagination">
                            <div className="testimonial-card">
                                <div className="testimonial-card-inner">
                                    <div className="testimonial-card-header">
                                        <div className="tes-image"><img src="assets/images/testimonials/ttm1.webp" alt="" /></div>
                                        <div className="author">
                                            <h6>Cora Lynn</h6>
                                            <p>/ Engineer</p>
                                        </div>
                                    </div>
                                    <div className="testimonial-card-content">
                                        <p className="testimonial-card-description">
                                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde non soluta vitae itaque sequi architecto accusantium est deleniti modi assumenda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card">
                                <div className="testimonial-card-inner">
                                    <div className="testimonial-card-header">
                                        <div className="tes-image"><img src="assets/images/testimonials/ttm2.webp" alt="" /></div>
                                        <div className="author">
                                            <h6>Sarah Sutton</h6>
                                            <p>/ Customer</p>
                                        </div>
                                    </div>
                                    <div className="testimonial-card-content">
                                        <p className="testimonial-card-description">
                                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde non soluta vitae itaque sequi architecto accusantium est deleniti modi assumenda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card">
                                <div className="testimonial-card-inner">
                                    <div className="testimonial-card-header">
                                        <div className="tes-image"><img src="assets/images/testimonials/ttm3.webp" alt="" /></div>
                                        <div className="author">
                                            <h6>Sandy Wilcke</h6>
                                            <p>/ Designer</p>
                                        </div>
                                    </div>
                                    <div className="testimonial-card-content">
                                        <p className="testimonial-card-description">
                                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde non soluta vitae itaque sequi architecto accusantium est deleniti modi assumenda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card">
                                <div className="testimonial-card-inner">
                                    <div className="testimonial-card-header">
                                        <div className="tes-image"><img src="assets/images/testimonials/ttm4.webp" alt="" /></div>
                                        <div className="author">
                                            <h6>Sandy Wilcke</h6>
                                            <p>/ Designer</p>
                                        </div>
                                    </div>
                                    <div className="testimonial-card-content">
                                        <p className="testimonial-card-description">
                                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde non soluta vitae itaque sequi architecto accusantium est deleniti modi assumenda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {/*Testimonials Section Start*/}


      {/* Contact Banner */}
      <ContactBanner />

      {/* Newsletter */}
      <Newsletter />

      {/* Features */}
      <FeatureIcons />

    </main>
  );
}

export default About;