// src/customer/pages/Home.jsx
import { useState, useEffect, useMemo } from "react";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import ProductCard from "../components/ProductCard";
import { getWebsiteCategories, getBestSellers, getNewArrivals, getFeaturedProducts, getWebsiteSliders } from "../../utils/websiteApi";

import { Link } from "react-router-dom";

function Home() {
  const [categories,  setCategories]  = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [featured,    setFeatured]    = useState([])
  const [sliders,     setSliders]     = useState([])
  const [dataLoaded,  setDataLoaded]  = useState(false)
  const [activeCat, setActiveCat] = useState(null)
  // Category name URL-friendly : "Fresh Vegetables" -> "fresh-vegetables"
  const slugify = (str = "") =>
    str.toString().toLowerCase().trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

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
        console.log(bsRes.data)
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

  // Bootstrap carousel — auto-start after loading sliders
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

  // Slick sliders — after loading categories/products
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
}, [dataLoaded, activeCat])

  const getPrice = (product) => {
    const v = product.variants?.[0]
    if (!v) return "—"
    return `$${parseFloat(v.selling_price).toFixed(2)}`
  }

  const getImage = (product) =>
    product.primary_image?.image_url || "/assets/img/no-image.jpg"

  //Select up to 5 random categories from the product categories listed under 'Best Sellers'.
  const bestSellerCategories = useMemo(() => {
    const map = {}
    bestSellers.forEach(p => {
      if (p.category_id && !map[p.category_id]) {
        map[p.category_id] = { id: p.category_id, name: p.category_name }
      }
    })
    const all = Object.values(map)
    return [...all].sort(() => Math.random() - 0.5).slice(0, 5)
  }, [bestSellers])


  useEffect(() => {
    if (bestSellerCategories.length > 0 && activeCat === null) {
      setActiveCat(bestSellerCategories[0].id)
    }
  }, [bestSellerCategories])

  const filteredBestSellers = activeCat
    ? bestSellers.filter(p => p.category_id === activeCat)
    : bestSellers

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
                    <Link to={`/categories/${slugify(cat.category_name)}`}>
                      <img src={cat.image} alt={cat.category_name} onError={e => { e.target.onerror = null; e.target.src = "assets/images/categories/fresh_vegetables.webp" }} />
                    </Link>
                  </div>
                  <div className="category-content"><p>{cat.products_count} Products</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Category Section End */}

      {/* Best Sellers Section Start */}
      <section className="product-item-section best-sellers-sec">
        <div className="container">
          <div className="row">
            <div className="col-12 position-relative">
              <div className="d-lg-flex align-items-center justify-content-lg-between mb-4">
                <div className="col-md-6 section-title-wrap mb-md-0">
                  <h2 className="section-title">Best Sellers</h2>
                  <p>Explore our most popular products, trusted and preferred by our customers. View product details and place your orders.</p>
                </div>
                <ul className="nav menu-tabs" role="tablist">
                  {bestSellerCategories.map(cat => (
                    <li key={cat.id} className={activeCat === cat.id ? "active" : ""}>
                      <a href="#" className={activeCat === cat.id ? "active" : ""}
                        onClick={e => { e.preventDefault(); setActiveCat(cat.id) }}>
                        {cat.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="product-border-box">
            <div className="product-slider-active-4" key={activeCat}>
              {filteredBestSellers.map(p => (
                <Link to={`/product/${p.slug || p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ProductCard productId={p.id} name={p.name} price={getPrice(p)} image={getImage(p)} stickers={p.stickers || []} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Best Sellers Section End */}

      {/* New Arrivals Section Start */}
      <section className="product-item-section pb-5 mt-4">
        <div className="container">
          <div className="row">
            <div className="col-12 position-relative">
              <div className="section-title-wrap">
                {/*<h2 className="section-title">New Arrivals</h2>*/}
                <h2 className="section-title">Special Offers</h2>
                <p>Check out our new collection and see what's new. Be sure to review the product details before placing your order.</p>
              </div>
            </div>
          </div>
          <div className="product-slider-active product-border-box">
            {newArrivals.map((p) => (
              <Link key={p.id} to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <ProductCard productId={p.id} name={p.name} price={getPrice(p)} image={getImage(p)} />
              </Link>
            ))}
          </div>

        </div>
      </section>
      {/* New Arrivals Section End */}

      {/* Contact Banner */}
      <ContactBanner />

      {/* Newsletter */}
      <Newsletter />

      {/* Features */}
      {/*<FeatureIcons />*/}

    </main>
  );
}

export default Home;
