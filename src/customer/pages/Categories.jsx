// src/customer/pages/Categories.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import ProductCard from "../components/ProductCard";
import { getWebsiteCategories, getProductsByCategory } from "../../utils/websiteApi";


const slugify = (str = "") =>
  str.toString().toLowerCase().trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const PAGE_SIZE = 24

function Categories() {
  const { categorySlug } = useParams()

  const [categories, setCategories]             = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [products, setProducts]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState("")
  const [visibleCount, setVisibleCount]         = useState(PAGE_SIZE)

  useEffect(() => {
    getWebsiteCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {})
      .finally(() => setCategoriesLoaded(true))
  }, [])

  // Default to the first category if categorySlug is not provided
  const activeCategory = categorySlug
    ? categories.find(c => slugify(c.category_name) === categorySlug)
    : categories[0]

  useEffect(() => {
    if (!categoriesLoaded) return

    const load = async () => {
      setLoading(true); setError("")
      try {
        // Fallback to first category ID if categorySlug is omitted
        const categoryId = categorySlug ? activeCategory?.id : categories[0]?.id
        
        if (categoryId) {
          const res = await getProductsByCategory(categoryId)
          let fetchedProducts = res.data || []

          // --- AI/Client Fix: Sort alike items together (Alphabetically by product name) ---
          fetchedProducts.sort((a, b) => {
            const nameA = (a.name || "").toLowerCase()
            const nameB = (b.name || "").toLowerCase()
            return nameA.localeCompare(nameB)
          })

          setProducts(fetchedProducts)
          setVisibleCount(PAGE_SIZE)
        } else {
          setProducts([])
        }
      } catch (err) {
        setError(err.message || "Failed to load products.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categoriesLoaded, categorySlug, activeCategory?.id, categories])

  // Returns { selling, regular } as numbers (or null) from the product's default/first variant
  const getPriceData = (product) => {
    const variants = product.variants || []
    const v = variants.find(x => x.is_default == 1) || variants[0]
    if (!v) return { selling: null, regular: null }
    const selling = v.selling_price != null ? parseFloat(v.selling_price) : null
    const regular = v.regular_price ? parseFloat(v.regular_price) : null
    return { selling, regular }
  }
  const getImage = (product) =>
    product.primary_image?.image_url || "/assets/img/no-image.jpg"

  return (
    <>
      <style>{`
        .cat-rail-wrapper {
          display: flex;
          align-items: flex-start;
        }
        .cat-rail {
          flex: 0 0 84px;
          width: 84px;
          background: #f7f8f9;
          border-right: 1px solid #ececec;
          position: sticky;
          top: 0;
          align-self: flex-start;
          max-height: calc(100vh - 20px);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .cat-rail::-webkit-scrollbar { display: none; }
        .cat-rail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 14px 6px;
          cursor: pointer;
          text-decoration: none;
          color: #444;
          border-left: 3px solid transparent;
          font-size: 11px;
          line-height: 1.2;
          transition: background .15s, border-color .15s;
        }
        .cat-rail-item:hover { background: #eef2f2; }
        .cat-rail-item.active {
          background: #ffffff;
          border-left-color: #0e606c;
          color: #0e606c;
          font-weight: 700;
        }
        .cat-rail-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
          background: #e9ecef;
        }
        .cat-rail-icon-fallback {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #dcecec;
          color: #0e606c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .cat-products-area {
          flex: 1 1 auto;
          min-width: 0;
          padding: 16px 12px;
        }
        @media (min-width: 768px) {
          .cat-rail { flex-basis: 130px; width: 130px; }
          .cat-rail-item { font-size: 12.5px; padding: 16px 8px; }
          .cat-rail-icon, .cat-rail-icon-fallback { width: 50px; height: 50px; }
          .cat-products-area { padding: 24px; }
        }
        @media (min-width: 992px) {
          .cat-rail { flex-basis: 220px; width: 220px; }
          .cat-rail-item {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
            font-size: 14px;
            padding: 12px 16px;
          }
        }
      `}</style>

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
        <section className="page-secton-wrapper">
          <div className="cat-rail-wrapper">

            {/* Category Rail */}
            <div className="cat-rail pb-2">
              {categories.map((cat, index) => {
                const slug = slugify(cat.category_name)
                const isActive = categorySlug ? slug === categorySlug : index === 0
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${slug}`}
                    className={`cat-rail-item ${isActive ? "active" : ""}`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        className="cat-rail-icon"
                        onError={e => { e.target.onerror = null; e.target.src = "/assets/img/no-image.jpg" }}
                      />
                    ) : (
                      <span className="cat-rail-icon-fallback">
                        {cat.category_name?.charAt(0)}
                      </span>
                    )}
                    <span>{cat.category_name}</span>
                  </Link>
                )
              })}
            </div>
            {/* Category Rail End */}

            {/* Products Area */}
            <div className="cat-products-area">

              <div className="d-flex align-items-center justify-content-between mb-3">
                <p className="mb-0 text-muted">
                  {loading ? "Loading..." : `Showing ${products.length} result${products.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border" style={{ color: "#0e606c" }} />
                </div>
              ) : error ? (
                <div className="text-center text-danger py-5">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center text-muted py-5">No products found in this category.</div>
              ) : (
                <>
                  <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2 g-md-3">
                    {products.slice(0, visibleCount).map(p => {
                      const { selling, regular } = getPriceData(p)
                      return (
                        <div key={p.id} className="col">
                          <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <ProductCard productId={p.id} name={p.name} price={selling} regularPrice={regular} image={getImage(p)} stickers={p.stickers || []} />
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                  {visibleCount < products.length && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                      >
                        Load More ({products.length - visibleCount} more)
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
            {/* Products Area End */}

          </div>
        </section>

        <ContactBanner />
        <Newsletter />
      </main>
    </>
  )
}

export default Categories
