// src/customer/components/Testimonials.jsx

import { useState, useEffect } from "react";
import { getWebsiteTestimonials } from "../../utils/websiteApi";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWebsiteTestimonials()
      .then((res) => setTestimonials(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const timer = setTimeout(() => {
      const $ = window.$;
      if (!$) return;
      try {
        const $slider = $(".testimonials-slider-active");
        if ($slider.hasClass("slick-initialized")) {
          $slider.slick("unslick");
        }
        $slider.slick({
          dots: true,
          infinite: true,
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: false,
          prevArrow:
            '<button type="button" class="slick-prev"><i class="icon-rt-arrow-left-solid"></i></button>',
          nextArrow:
            '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"></i></button>',
          responsive: [
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
          ],
        });
      } catch (e) {
        console.log("Slick error:", e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [testimonials]);

  // Loading ho raha ho YA testimonials 0 ho -> Dono case me section KO HIDE rakhein
  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
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
              {testimonials.map((t) => (
                <div className="testimonial-card" key={t.id}>
                  <div className="testimonial-card-inner">
                    <div className="testimonial-card-header">
                      <div className="tes-image">
                        <img
                          src={
                            t.image || "assets/images/testimonials/ttm1.webp"
                          }
                          alt={t.name}
                        />
                      </div>
                      <div className="author">
                        <h6>{t.name}</h6>
                        {t.designation && <p>/ {t.designation}</p>}
                      </div>
                    </div>
                    <div className="testimonial-card-content">
                      <p className="testimonial-card-description">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;