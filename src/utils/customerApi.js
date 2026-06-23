// ─── Config ───────────────────────────────────────────────────────────────────

/*-- For Live --*/
const API_BASE_URL = "https://site2demo.in/larry-pantry-api/api/customer"
export const STORAGE_URL = "https://site2demo.in/larry-pantry-api/admin_images/"

/*-- For Local --*/
// const API_BASE_URL = "http://localhost/larry-pantry-api/api"
// export const STORAGE_URL = "http://localhost/larry-pantry-api/admin_images/"

// ─── Base Client ──────────────────────────────────────────────────────────────

const client = async (endpoint, { body, method = "GET", auth = false } = {}) => {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  if (auth) {
    const token = localStorage.getItem("customer_token")
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    // Laravel validation errors (422) — pehle field ka pehla message dikhao
    if (data.errors) {
      const first = Object.values(data.errors)[0]
      throw new Error(Array.isArray(first) ? first[0] : first)
    }
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const customerLogin = (email, password) =>
  client("/login", { method: "POST", body: { email, password } })

export const customerRegister = (data) =>
  client("/register", { method: "POST", body: data })

export const customerLogout = () =>
  client("/logout", { method: "POST", auth: true })

export const customerForgotPassword = (email) =>
  client("/forgot-password", { method: "POST", body: { email } })

export const customerResetPassword = (email, token, password, password_confirmation) =>
  client("/reset-password", { method: "POST", body: { email, token, password, password_confirmation } })

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = () =>
  client("/get-profile", { method: "POST", auth: true })

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("customer_token")
  const res = await fetch(`${API_BASE_URL}/update-profile`, {
    method: "POST",
    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Update failed")
  return data
}

export const changePassword = (old_password, new_password) =>
  client("/change-password", { method: "POST", auth: true, body: { old_password, new_password } })

// ─── Assigned Products ────────────────────────────────────────────────────────

export const getAssignedProducts = () =>
  client("/assigned-products", { auth: true })

export const getAssignedProduct = (productId) =>
  client(`/assigned-products/${productId}`, { auth: true })

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = (params = "") =>
  client(`/products${params ? `?${params}` : ""}`)

export const getProduct = (id) =>
  client(`/products/${id}`)

export const getProductsByCategory = (categoryId) =>
  client(`/products?category_id=${categoryId}`)

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = () =>
  client("/categories")

export const getCategory = (id) =>
  client(`/categories/${id}`)

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getBrands = () =>
  client("/brands")

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCart = () =>
  client("/cart", { auth: true })

export const addToCart = (product_id, quantity) =>
  client("/cart", { method: "POST", auth: true, body: { product_id, quantity } })

export const updateCartItem = (cartItemId, quantity) =>
  client(`/cart/${cartItemId}`, { method: "POST", auth: true, body: { quantity } })

export const removeFromCart = (cartItemId) =>
  client(`/cart/${cartItemId}`, { method: "DELETE", auth: true })

export const clearCart = () =>
  client("/cart/clear", { method: "DELETE", auth: true })

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getMyOrders = () =>
  client("/my-orders", { method: "POST", auth: true })

export const placeOrder = (data) =>
  client("/place-order", { method: "POST", auth: true, body: data })
