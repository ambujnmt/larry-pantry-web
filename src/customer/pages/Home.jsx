// src/customer/pages/Home.jsx
import { useState, useEffect } from "react";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import ProductCard from "../components/ProductCard";
import { getWebsiteCategories, getBestSellers, getNewArrivals, getFeaturedProducts, getWebsiteSliders } from "../../utils/websiteApi";

function Home() {
  const [categories,  setCategories]  = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [featured,    setFeatured]    = useState([])
  const [sliders,     setSliders]     = useState([])
  const [dataLoaded,  setDataLoaded]  = useState(false)

  // Saara data ek hi jagah fetch
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, bsRes, naRes, ftRes, sliderRes] = await Promise.all([
          getWebsiteCategories(),
          getBestSellers(),
          getNewArrivals(),
          getFeaturedProducts(),
          getWebsiteSliders(),
        ])
        setCategories(catRes.data  || [])
        setBestSellers(bsRes.data  || [])
        setNewArrivals(naRes.data  || [])
        setFeatured(ftRes.data     || [])
        setSliders(sliderRes.data  || [])
      } catch (e) {
        console.error("Home data load failed:", e)
      } finally {
        setDataLoaded(true)
      }
    }
    load()
  }, [])

  // Bootstrap carousel — sliders load hone ke baad auto-start
  useEffect(() => {
    if (sliders.length === 0) return
    const timer = setTimeout(() => {
      const el = document.getElementById('carouselExampleIndicators')
      if (el && window.bootstrap) {
        const carousel = window.bootstrap.Carousel.getOrCreateInstance(el, {
          interval: 3000,
          ride: 'carousel',
          wrap: true,
        })
        carousel.cycle()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [sliders])

  // Slick sliders — categories/products data load hone ke baad
  useEffect(() => {
    if (!dataLoaded) return
    const $ = window.$
    if (!$) return

    const timer = setTimeout(() => {
      try {
        const destroy = (sel) => { try { if ($(sel).hasClass('slick-initialized')) $(sel).slick('destroy') } catch(_) {} }

        destroy('.categories-slider-active')
        destroy('.product-slider-active')
        destroy('.category-three-slider-active')
        $('.product-slider-active-4').each(function() { try { if ($(this).hasClass('slick-initialized')) $(this).slick('destroy') } catch(_) {} })

        $('.categories-slider-active').slick({
          dots: false, infinite: true, rows: 2, slidesToShow: 4, slidesToScroll: 1, autoplay: false,
          prevArrow: '<button type="button" class="slick-prev"> <i class="icon-rt-arrow-left-solid"> </i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"> </i></button>',
          responsive: [
            { breakpoint: 1199, settings: { slidesToShow: 3 } },
            { breakpoint: 992,  settings: { slidesToShow: 2 } },
            { breakpoint: 767,  settings: { slidesToShow: 2, prevArrow: false, nextArrow: false } },
            { breakpoint: 479,  settings: { slidesToShow: 1, prevArrow: false, nextArrow: false } }
          ]
        })

        $('.product-slider-active').slick({
          dots: false, infinite: true, slidesToShow: 5, slidesToScroll: 1, autoplay: false,
          prevArrow: '<button type="button" class="slick-prev"> <i class="icon-rt-arrow-left-solid"> </i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"> </i></button>',
          responsive: [
            { breakpoint: 1199, settings: { slidesToShow: 4 } },
            { breakpoint: 991,  settings: { slidesToShow: 3 } },
            { breakpoint: 767,  settings: { slidesToShow: 2 } },
            { breakpoint: 479,  settings: { slidesToShow: 1 } }
          ]
        })

        $('.product-slider-active-4').each(function() {
          $(this).slick({
            dots: false, infinite: true, slidesToShow: 5, slidesToScroll: 1, autoplay: false,
            prevArrow: '<button type="button" class="slick-prev"> <i class="icon-rt-arrow-left-solid"> </i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"> </i></button>',
            responsive: [
              { breakpoint: 1199, settings: { slidesToShow: 5 } },
              { breakpoint: 991,  settings: { slidesToShow: 3 } },
              { breakpoint: 767,  settings: { slidesToShow: 2 } },
              { breakpoint: 479,  settings: { slidesToShow: 1 } }
            ]
          })
        })

        $('.category-three-slider-active').slick({
          dots: false, infinite: true, slidesToShow: 6, slidesToScroll: 1, autoplay: false,
          prevArrow: '<button type="button" class="slick-prev"> <i class="icon-rt-arrow-left-solid"> </i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="icon-rt-arrow-right-solid"> </i></button>',
          responsive: [
            { breakpoint: 1199, settings: { slidesToShow: 3 } },
            { breakpoint: 991,  settings: { slidesToShow: 3 } },
            { breakpoint: 767,  settings: { slidesToShow: 2 } },
            { breakpoint: 479,  settings: { slidesToShow: 1 } }
          ]
        })

        $('[data-bs-toggle="tab"]').on('shown.bs.tab', function() {
          $('.product-slider-active-4').slick('setPosition')
        })

      } catch(e) {
        console.log("Slick error:", e)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [dataLoaded])

  const getPrice = (product) => {
    const v = product.variants?.[0]
    if (!v) return "—"
    return `$${parseFloat(v.selling_price).toFixed(2)}`
  }

  const getImage = (product) =>
    product.primary_image?.image_url || "assets/images/products/product-image-1-1.jpg"

  return (
    <main>
      <style>{`
        .categories-slider-active:not(.slick-initialized),
        .product-slider-active:not(.slick-initialized),
        .product-slider-active-4:not(.slick-initialized),
        .category-three-slider-active:not(.slick-initialized) {
          opacity: 0;
          overflow: hidden;
          max-height: 300px;
        }
      `}</style>

      {/* Slider Main Start */}
      {sliders.length > 0 && (
        <div id="carouselExampleIndicators" className="carousel slide">
          <div className="carousel-indicators">
            {sliders.map((s, i) => (
              <button key={s.id} type="button" data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to={i} className={i === 0 ? "active" : ""}
                aria-current={i === 0 ? "true" : undefined} aria-label={`Slide ${i + 1}`}></button>
            ))}
          </div>
          <div className="carousel-inner">
            {sliders.map((s, i) => (
              <div key={s.id} className={`carousel-item ${i === 0 ? "active" : ""}`}>
                <img src={s.image_url || "assets/img/slider-1.png"} className="d-block w-100" alt={s.title || "slider"}
                  onError={e => { e.target.onerror = null; e.target.src = "assets/img/slider-1.png" }} />
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden"><i className="icon-rt-arrow-left-solid"></i></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden"><i className="icon-rt-arrow-right-solid"></i></span>
          </button>
        </div>
      )}
      {/* Slider Main End */}

      {/* Popular Categories Start */}
      <section className="popular-categories-section">
        <div className="container">
          <div className="row">
            <div className="col-12 position-relative">
              <div className="section-title-wrap">
                <h2 className="section-title">Popular Categories</h2>
                <p>Some of our popular categories include grocery</p>
              </div>
            </div>
          </div>
          <div className="categories-box product-border-box">
            <div className="categories-slider-col-20">
              <a href="#" className="categories-banner-wrap" style={{ display: 'block', height: '100%' }}>
                <img
                  src="assets/images/banners/img_banner4_mixy1.webp"
                  alt="image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </a>
            </div>
            <div className="categories-slider-col-80">
              <div className="categories-slider-active">
                {categories.map(cat => (
                  <div key={cat.id} className="single-categories-item">
                    <div className="category-image" style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 8 }}>
                      <a href="#" style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img
                          src={cat.image}
                          alt={cat.category_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.onerror = null; e.target.src = "assets/images/categories/fresh_vegetables.webp" }}
                        />
                      </a>
                    </div>
                    <div className="category-content">
                      <h6><a href="#">{cat.category_name}</a></h6>
                      <p className="count">{cat.products_count} Products</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Popular Categories End */}

      {/* Best Sellers Section Start */}
      <section className="product-item-section best-sellers-sec">
        <div className="container">
          <div className="row">
            <div className="col-12 position-relative">
              <div className="d-lg-flex align-items-center justify-content-lg-between mb-4">
                <div className="section-title-wrap mb-md-0">
                  <h2 className="section-title">Best Sellers</h2>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                </div>
                <ul className="nav menu-tabs" role="tablist">
                  <li className="active"><a className="active" href="#chicken" role="tab" data-bs-toggle="tab">Chicken</a></li>
                  <li><a href="#eggs" role="tab" data-bs-toggle="tab">Eggs</a></li>
                  <li><a href="#grocery-bakery" role="tab" data-bs-toggle="tab">Grocery</a></li>
                  <li><a href="#dairy" role="tab" data-bs-toggle="tab">Dairy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="product-border-box">
            <div className="product-slider-active-4">
              {bestSellers.map(p => (
                <ProductCard key={p.id} name={p.name} price={getPrice(p)} image={getImage(p)} />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Best Sellers Section End */}

      {/* Category Section Start */}
      <section className="category-section section-space-ptb-90">
        <div className="container">
          <div className="col-lg-12 section-title-wrap text-center">
            <h2 className="section-title">Shop by Department</h2>
          </div>
          <div className="category-three-slider-active">
            {categories.map(cat => (
              <div key={cat.id} className="col">
                <div className="single-category text-center">
                  <h5 className="category-name fw-semibold mb-4">{cat.category_name}</h5>
                  <div className="category-image">
                    <a href="#"><img src={cat.image} alt={cat.category_name} onError={e => { e.target.onerror = null; e.target.src = "assets/images/categories/fresh_vegetables.webp" }} /></a>
                  </div>
                  <div className="category-content"><p>{cat.products_count} Products</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Category Section End */}

      {/* New Arrivals Section Start */}
      <section className="product-item-section pb-5">
        <div className="container">
          <div className="row">
            <div className="col-12 position-relative">
              <div className="section-title-wrap">
                <h2 className="section-title">New Arrivals</h2>
                <p>Add bestselling products to weekly line up</p>
              </div>
            </div>
          </div>
          <div className="product-slider-active product-border-box">
            {newArrivals.map(p => (
              <ProductCard key={p.id} name={p.name} price={getPrice(p)} image={getImage(p)} />
            ))}
          </div>
        </div>
      </section>
      {/* New Arrivals Section End */}

      {/* Contact Banner */}
      <ContactBanner />

    </main>
  );
}

export default Home;