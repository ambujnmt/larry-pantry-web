// src/customer/pages/SearchResults.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ContactBanner from "../components/ContactBanner";
import Newsletter from "../components/Newsletter";
import FeatureIcons from "../components/FeatureIcons";
import { searchProducts } from "../../utils/websiteApi";

function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  useEffect(() => {
    if (!query.trim()) { setProducts([]); setLoading(false); return }

    const load = async () => {
      setLoading(true); setError("")
      try {
        const res = await searchProducts(query)
        setProducts(res.data || [])
      } catch (err) {
        setError(err.message || "Search failed.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [query])

  const getPrice = (p) => {
    const v = p.variants?.[0]
    return v ? `$${parseFloat(v.selling_price).toFixed(2)}` : "—"
  }
  const getImage = (p) => p.primary_image?.image_url || "/assets/img/no-image.jpg"

  return (
    <main>
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb-content">
            <h1 className="page-title">Search Results</h1>
            <ul className="breadcrumb-page-list">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item">Search</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-secton-wrapper section-space-pb">
        <div className="container">
          <p className="mb-4">
            {loading ? "Searching..." : `${products.length} result${products.length !== 1 ? "s" : ""} for "${query}"`}
          </p>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border" style={{ color: "#0e606c" }} />
            </div>
          ) : error ? (
            <div className="text-center text-danger py-5">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted py-5">
              No products found for "{query}". Try a different keyword.
            </div>
          ) : (
            <div className="row g-4">
              {products.map(p => (
                <div key={p.id} className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                  <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <ProductCard name={p.name} price={getPrice(p)} image={getImage(p)} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactBanner />
      <Newsletter />
      <FeatureIcons />
    </main>
  )
}

export default SearchResults