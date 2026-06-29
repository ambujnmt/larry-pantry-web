// ─── Config ───────────────────────────────────────────────────────────────────

/*-- For Live --*/
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
