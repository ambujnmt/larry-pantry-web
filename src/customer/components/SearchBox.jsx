// src/customer/components/SearchBox.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { searchProducts } from "../../utils/websiteApi";

function SearchBox({ variant = "desktop", onNavigate }) {
  const [query, setQuery]         = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]     = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  // Debounced live suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchProducts(q)
        setSuggestions((res.data || []).slice(0, 6))
      } catch (e) {
        console.error("Search failed:", e)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const goToResults = (q) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setShowDropdown(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    onNavigate?.()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    goToResults(query)
  }

  const handleSuggestionClick = () => {
    setShowDropdown(false)
    onNavigate?.()
  }

  const getImage = (p) => p.primary_image?.image_url || "assets/images/products/product-image-1-1.jpg"
  const getPrice = (p) => {
    const v = p.variants?.[0]
    return v ? `$${parseFloat(v.selling_price).toFixed(2)}` : "—"
  }

  return (
    <div className={`search-box position-relative ${variant === "mobile" ? "search-box-mobile" : ""}`} ref={wrapperRef}>
      <form className="search-field" onSubmit={handleSubmit} autoComplete="off">
        <input
          type="text"
          className="search-field"
          placeholder="Search product..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
        />
        <button className="search-btn" type="submit" aria-label="Search">
          <i className="icon-rt-loupe"></i>
        </button>
      </form>

      {showDropdown && query.trim().length >= 2 && (
        <div
          className="search-suggestions-dropdown bg-white shadow rounded-3"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1050,
            maxHeight: 380,
            overflowY: "auto",
            border: "1px solid #eee",
          }}
        >
          {loading ? (
            <div className="p-3 text-center text-muted small">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-center text-muted small">No products found</div>
          ) : (
            <>
              {suggestions.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug || p.id}`}
                  onClick={handleSuggestionClick}
                  className="d-flex align-items-center gap-2 p-2 text-decoration-none text-dark"
                  style={{ borderBottom: "1px solid #f2f2f2" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img
                    src={getImage(p)}
                    alt={p.name}
                    style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6 }}
                    onError={e => { e.target.onerror = null; e.target.src = "assets/images/products/product-image-1-1.jpg" }}
                  />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="small fw-semibold text-truncate">{p.name}</div>
                    <div className="small text-success">{getPrice(p)}</div>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="w-100 text-center p-2 small fw-semibold border-0 bg-white"
                style={{ color: "#0e606c" }}
              >
                View all results for "{query.trim()}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox