// src/customer/pages/Categories.jsx
import { useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";

function Categories() {

  useEffect(() => {
    setTimeout(() => {
      const $ = window.$;
      if (!$) return;
      try {

        // Grid List Toggle
        $('[data-role="grid-3"]').on('click', function () {
          $('[data-role="grid-3"]').addClass('active')
          $('[data-role="grid-list"]').removeClass('active')
          $('.archive-products .col-xl-12').removeClass('col-xl-12').addClass('col-xl-3')
          $('.archive-products').removeClass('list-view')
        })

        $('[data-role="grid-list"]').on('click', function () {
          $('[data-role="grid-list"]').addClass('active')
          $('[data-role="grid-3"]').removeClass('active')
          $('.archive-products .col-xl-3').removeClass('col-xl-3').addClass('col-xl-12')
          $('.archive-products').addClass('list-view')
        })

      } catch(e) {
        console.log(e)
      }
    }, 500)
  }, [])

  return (
    <>
      <main>

        {/* Breadcrumb Start */}
        <section className="breadcrumb-section">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="breadcrumb-content">
                  <h1 className="page-title">Categories</h1>
                  <ul className="breadcrumb-page-list">
                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                    <li className="breadcrumb-item">Categories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Breadcrumb End */}

        {/* inner Page */}
        <section className="page-secton-wrapper section-space-pb">
          <div className="container">
            <div className="row">

              {/* Sidebar */}
              <div className="col-lg-3 col-12 sidebar widget-area-side left-sidebar order-2 order-lg-1">

                <div className="shop-widget">
                  <h5 className="widget-title">Product categories</h5>
                  <ul className="product-categorie">
                    <li className="product-categorie-item"><a href="#">Chicken</a></li>
                    <li className="product-categorie-item"><a href="#">Eggs</a></li>
                    <li className="product-categorie-item"><a href="#">Grocery</a></li>
                    <li className="product-categorie-item"><a href="#">Dairy</a></li>
                    <li className="product-categorie-item"><a href="#">Snacks</a></li>
                  </ul>
                </div>

                <div className="shop-widget">
                  <h5 className="widget-title">Dietary &amp; Lifestyle</h5>
                  <ul className="product-brand">
                    <li className="product-brand-item">
                      <input type="checkbox" name="hight-fiber" id="hight-fiber" />
                      <label htmlFor="hight-fiber">High fiber (23)</label>
                    </li>
                    <li className="product-brand-item">
                      <input type="checkbox" name="hight-protein" id="hight-protein" />
                      <label htmlFor="hight-protein">High Protein (6)</label>
                    </li>
                    <li className="product-brand-item">
                      <input type="checkbox" name="low-sodium" id="low-sodium" />
                      <label htmlFor="low-sodium">Low sodium (20)</label>
                    </li>
                    <li className="product-brand-item">
                      <input type="checkbox" name="low-sugar" id="low-sugar" />
                      <label htmlFor="low-sugar">Low Sugar (2)</label>
                    </li>
                    <li className="product-brand-item">
                      <input type="checkbox" name="nut-free" id="nut-free" />
                      <label htmlFor="nut-free">Nut-free (21)</label>
                    </li>
                  </ul>
                </div>

                <div className="shop-widget">
                  <h5 className="widget-title">Average Rating</h5>
                  <ul className="product-categories">
                    <li className="single-product-item-rating-list">
                      <a href="#" className="single-product-item-rating">
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <span className="small">(21)</span>
                      </a>
                    </li>
                    <li className="single-product-item-rating-list">
                      <a href="#" className="single-product-item-rating">
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid"></i>
                        <span className="small">(1)</span>
                      </a>
                    </li>
                    <li className="single-product-item-rating-list">
                      <a href="#" className="single-product-item-rating">
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <span className="small">(2)</span>
                      </a>
                    </li>
                    <li className="single-product-item-rating-list">
                      <a href="#" className="single-product-item-rating">
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <span className="small">(2)</span>
                      </a>
                    </li>
                    <li className="single-product-item-rating-list">
                      <a href="#" className="single-product-item-rating">
                        <i className="icon-rt-star-solid select-star"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <i className="icon-rt-star-solid"></i>
                        <span className="small">(1)</span>
                      </a>
                    </li>
                  </ul>
                </div>

              </div>
              {/* Sidebar End */}

              {/* Products Area */}
              <div className="col-lg-9 col-12 order-1 order-lg-2">

                {/* Shop Toolbar */}
                <div className="shop-toolbar-wrapper ms-lg-4 mb-3">
                  <div className="shop-toolbar-btn d-flex align-items-center">
                    <button data-role="grid-3" type="button" className="active btn-grid-3" title="3">
                      <i className="icon-rt-apps-sharp"></i>
                    </button>
                    <button data-role="grid-list" type="button" className="btn-list" title="List">
                      <i className="icon-rt-list"></i>
                    </button>
                    <div className="page_amount ms-3">
                      <p>Showing 1–9 of 21 results</p>
                    </div>
                  </div>
                  <form className="select_option" action="#">
                    <select name="orderby" id="short">
                      <option value="1">Default sorting</option>
                      <option value="2">Sort by popularity</option>
                      <option value="3">Sort by newness</option>
                      <option value="4">Sort by price: low to high</option>
                      <option value="5">Sort by price: high to low</option>
                      <option value="6">Product Name: Z</option>
                    </select>
                  </form>
                </div>
                {/* Shop Toolbar End */}

                {/* Products Grid */}
                <div className="shop-product-wrapper ms-lg-4 border-top border-start row gx-0 archive-products">

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://www.agrosuper.com/global/wp-content/uploads/2025/03/1013017.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Skinless Boneless Chicken Breast</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://www.greenbelt-global.com/wp-content/uploads/2025/08/10150713KG-checkers515Wx515H.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Leg Quarters</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://static.vecteezy.com/system/resources/thumbnails/062/678/060/small/three-raw-chicken-drumsticks-with-rosemary-fresh-chicken-legs-uncooked-chicken-drumsticks-with-herbs-png.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Drumsticks</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://elatmeat.com/wp-content/uploads/2025/05/Turkey-Wings.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Boneless Thighs (Pargiot)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://www.boombay.in/cdn/shop/articles/chicken_biryani_37b7b0fc-7021-4b9e-8e77-e1e6b7adaa84_1024x.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Chicken Consomme (Parve 5×2.2lbs)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://static.vecteezy.com/system/resources/previews/053/783/988/non_2x/mixed-brown-and-white-eggs-free-png.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Fresh White/Brown Eggs</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://png.pngtree.com/png-clipart/20250424/original/pngtree-fresh-brown-eggs-with-broken-shell-and-liquid-splash-png-image_20780455.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Liquid Eggs</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://png.pngtree.com/png-vector/20240528/ourmid/pngtree-fried-egg-with-sugar-on-a-white-background-3d-illustration-png-image_12512362.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Sugared Eggs</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://nutrigroupe.ca/wp-content/uploads/2023/08/oeuf-couille-craque.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Egg Whites</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://5.imimg.com/data5/SELLER/Default/2026/1/576639315/WT/BL/OT/138799188/garlic-granules.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Granulated Garlic (5lbs)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://arizoneinternational.com/wp-content/uploads/2023/05/onion-powder.png.webp" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Granulated Onion (5lbs)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://www.drrkfoods.com/wp-content/uploads/2021/01/black_pepper_dish1.png" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Ground Black Pepper (5lbs)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div className="single-product-item">
                      <div className="single-product-item-image">
                        <a href="#" className="prodcut-images">
                          <img className="primary-image" src="https://img.freepik.com/free-vector/realistic-vector-icon-illustration-dairy-farm-fresh-milk-splash-with-milk-jug-bottle-isola_134830-2399.jpg" alt="" />
                        </a>
                        <ul className="single-product-item-action">
                          <li className="single-product-item-action-list"><a href="#" className="single-product-item-action-link"><i className="icon-rt-heart2"></i></a></li>
                          <li className="single-product-item-action-list"><a href="#" title="Quick View" className="single-product-item-action-link"><i className="icon-rt-eye2"></i></a></li>
                        </ul>
                      </div>
                      <div className="single-product-item-content">
                        <div className="single-product-item-rating"><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid select-star"></i><i className="icon-rt-star-solid"></i></div>
                        <h6 className="single-product-item-title"><a href="#">Milk (2/1-Gallon)</a></h6>
                        <div className="single-product-item-price">$70.00</div>
                        <div className="cart-btn1"><a href="#"><i className="fa fa-shopping-cart"></i>&nbsp; Add to cart</a></div>
                      </div>
                    </div>
                  </div>

                </div>
                {/* Products Grid End */}

                {/* Pagination */}
                <nav className="page-pagination">
                  <ul className="page-pagination-numbers">
                    <li><a href="#" aria-current="page" className="page-numbers current">1</a></li>
                    <li><a className="page-numbers" href="#">2</a></li>
                    <li><a className="next page-numbers" href="#"><i className="icon-rt-arrow-right-solid"></i></a></li>
                  </ul>
                </nav>

              </div>
              {/* Products Area End */}

            </div>
          </div>
        </section>
        {/* inner Page End */}

      </main>

      <ContactBanner />
      <Newsletter />
      <FeatureIcons />
    </>
  )
}

export default Categories