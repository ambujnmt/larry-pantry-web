// src/customer/pages/Categories.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import ProductCard from "../components/ProductCard";
import { getWebsiteCategories, getProductsByCategory } from "../../utils/websiteApi";

function Categories() {
  const { categoryId } = useParams()

  const [categories, setCategories] = useState([])
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")

  useEffect(() => {
    getWebsiteCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("")
      try {
        const res = await getProductsByCategory(categoryId || null)
        setProducts(res.data || [])
      } catch (err) {
        setError(err.message || "Failed to load products.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categoryId])

  const activeCategory = categories.find(c => String(c.id) === String(categoryId))

  const getPrice = (product) => {
    const v = product.variants?.[0]
    return v ? `$${parseFloat(v.selling_price).toFixed(2)}` : "—"
  }
  const getImage = (product) =>
    product.primary_image?.image_url || "assets/images/products/product-image-1-1.jpg"

  return (
    <>
      <main>

        {/* Breadcrumb Start */}
        <section className="breadcrumb-section">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="breadcrumb-content">
                  <h1 className="page-title">{activeCategory ? activeCategory.category_name : "Categories"}</h1>
                  <ul className="breadcrumb-page-list">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/categories">Categories</Link></li>
                    {activeCategory && <li className="breadcrumb-item">{activeCategory.category_name}</li>}
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

              {/* Sidebar — dynamic category list */}
              <div className="col-lg-3 col-12 sidebar widget-area-side left-sidebar order-2 order-lg-1">
                <div className="shop-widget">
                  <h5 className="widget-title">Product categories</h5>
                  <ul className="product-categorie">
                    <li className={`product-categorie-item ${!categoryId ? "active" : ""}`}>
                      <Link to="/categories">All Categories</Link>
                    </li>
                    {categories.map(cat => (
                      <li key={cat.id} className={`product-categorie-item ${String(cat.id) === String(categoryId) ? "active" : ""}`}>
                        <Link to={`/categories/${cat.id}`}>{cat.category_name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Sidebar End */}

              {/* Products Area */}
              <div className="col-lg-9 col-12 order-1 order-lg-2">

                {/* Shop Toolbar */}
                <div className="shop-toolbar-wrapper ms-lg-4 mb-3">
                  <div className="page_amount">
                    <p>{loading ? "Loading..." : `Showing ${products.length} result${products.length !== 1 ? "s" : ""}`}</p>
                  </div>
                </div>
                {/* Shop Toolbar End */}

                {/* Products Grid */}
                {loading ? (
                  <div className="text-center py-5">
                    <span className="spinner-border" style={{ color: "#0e606c" }} />
                  </div>
                ) : error ? (
                  <div className="text-center text-danger py-5">{error}</div>
                ) : products.length === 0 ? (
                  <div className="text-center text-muted py-5">No products found in this category.</div>
                ) : (
                  <div className="shop-product-wrapper ms-lg-4 border-top border-start row gx-0 archive-products">
                    {products.map(p => (
                      <div key={p.id} className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                        <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <ProductCard name={p.name} price={getPrice(p)} image={getImage(p)} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                {/* Products Grid End */}

              </div>
              {/* Products Area End */}

            </div>
          </div>
        </section>
        {/* inner Page End */}

        {/* Contact Banner */}
      <ContactBanner />

      {/* Newsletter */}
      <Newsletter />

      {/* Features */}
      <FeatureIcons />

      </main>

    </>
  )
}

export default Categories
