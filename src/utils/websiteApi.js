/*---- websiteApi.js ----*/
// ─── Config ───────────────────────────────────────────────────────────────────
/*-- For Live --*/
// const API_BASE_URL = "https://restaurantpantryla.com/api/website"

/*-- For Netlify --*/
const API_BASE_URL = "https://site2demo.in/larry-pantry-api/api/website"

/*-- For Local --*/
// const API_BASE_URL = "http://localhost/larry-pantry-api/api/website"

// ─── Base Client (POST) ───────────────────────────────────────────────────────

const post = async (endpoint, body = null) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Something went wrong")
  return data
}

// ─── Website Public APIs ──────────────────────────────────────────────────────

export const getWebsiteCategories = ()      => post("/categories")
export const getBestSellers       = (tab)   => post("/best-sellers", tab ? { tab } : null)
export const getNewArrivals       = ()      => post("/new-arrivals")
export const getFeaturedProducts  = ()      => post("/featured")

export const getWebsiteContact  = () => post("/contact")
export const getWebsiteSocial   = () => post("/social")
export const getWebsiteLogo     = () => post("/logo")
export const getWebsiteSliders  = () => post("/sliders")
export const getProductDetails = (slug) => post(`/products/${slug}`)

export const getProductsByCategory = (categoryId) => post("/products", categoryId ? { category_id: categoryId } : null)
export const searchProducts = (query) => post(`/products/search`, { q: query });

export const submitContactForm = (data) => post("/contact/submit", data);
// Newsletter subscribe
export const subscribeNewsletter = (email) => post(`/newsletter/subscribe`, { email });
export const getWebsiteBottomBanners = () => post("/bottom-banners")

// Reviews — rating summary + paginated review list for a product (public, no login needed)
export const getProductReviews = (productId, page = 1) => post(`/products/${productId}/reviews`, { page })

// Static pages — About Us, Terms & Conditions, etc. (public, no login needed)
export const getWebsitePage = (slug) => post(`/pages/${slug}`)

// FAQs — active ones only, ordered for display (public, no login needed)
export const getWebsiteFaqs = () => post("/faqs")

export const getWebsiteTestimonials = () => post("/testimonials")

export const getActivePopup = () => post("/popup")