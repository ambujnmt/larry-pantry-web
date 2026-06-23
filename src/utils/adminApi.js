// ─── Config ───────────────────────────────────────────────────────────────────

/*-- For Live --*/
// const API_BASE_URL = "https://site2demo.in/larry-pantry-api/api"
// export const STORAGE_URL = "https://site2demo.in/larry-pantry-api/admin_images/"

/*-- For Local --*/
const API_BASE_URL = "http://localhost:8000/api"
export const STORAGE_URL = "http://localhost:8000/admin_images/"

export const dtOptions = {
  pageLength: 50,
  lengthMenu: [
    [50, 100, 200, 500, -1],
    [50, 100, 200, 500, "All"]
  ],
  language: {
    search: "Search:",
    lengthMenu: "Show _MENU_ entries",
    paginate: { previous: "Prev", next: "Next" }
  }
}

// ─── Base Client ──────────────────────────────────────────────────────────────

const client = async (endpoint, { body, method = "GET", auth = false } = {}) => {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  if (auth) {
    const token = localStorage.getItem("admin_token")
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || "Something went wrong")

  return data
}

// FormData request (for file uploads)
const formRequest = async (url, formData) => {
  const token = localStorage.getItem("admin_token")
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed")
  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const adminLogin = (email, password) =>
  client("/admin/login", { method: "POST", body: { email, password } })

export const adminLogout = () =>
  client("/admin/logout", { method: "POST", auth: true })

export const adminForgotPassword = (email) =>
  client("/admin/forgot-password", { method: "POST", body: { email } })

export const adminResetPassword = (email, token, password, password_confirmation) =>
  client("/admin/reset-password", { method: "POST", body: { email, token, password, password_confirmation } })

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getAdminProfile = () =>
  client("/admin/profile", { auth: true })

export const updateAdminProfile = (formData) =>
  formRequest("/admin/update-profile", formData)

export const changeAdminPassword = (old_password, new_password) =>
  client("/admin/change-password", { method: "POST", auth: true, body: { old_password, new_password } })

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = () => client("/admin/users", { auth: true })
export const getUser = (id) => client(`/admin/users/${id}`, { auth: true })
export const updateUserStatus = (id, status) =>
  client(`/admin/users/${id}/status`, { method: "POST", auth: true, body: { status } })
export const deleteUser = (id) => client(`/admin/users/${id}`, { method: "DELETE", auth: true })
export const getUserProducts = (id) => client(`/admin/users/${id}/products`, { auth: true })
export const assignUserProducts = (id, product_ids) =>
  client(`/admin/users/${id}/assign-products`, { method: "POST", auth: true, body: { product_ids } })

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = () => client("/admin/categories", { auth: true })
export const getCategory = (id) => client(`/admin/categories/${id}`, { auth: true })
export const createCategory = (formData) => formRequest("/admin/categories", formData)
export const updateCategory = (id, formData) => formRequest(`/admin/categories/${id}`, formData)
export const deleteCategory = (id) => client(`/admin/categories/${id}`, { method: "DELETE", auth: true })

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = () => client("/admin/products", { auth: true })
export const getProduct = (id) => client(`/admin/products/${id}`, { auth: true })
export const createProduct = (formData) => formRequest("/admin/products", formData)
export const updateProduct = (id, formData) => formRequest(`/admin/products/${id}`, formData)
export const deleteProduct = (id) => client(`/admin/products/${id}`, { method: "DELETE", auth: true })
export const deleteProductImage = (imgId) => client(`/admin/products/image/${imgId}`, { method: "DELETE", auth: true })

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getBrands = () => client("/admin/brands", { auth: true })
export const createBrand = (data) => client("/admin/brands", { method: "POST", auth: true, body: data })
export const updateBrand = (id, data) => client(`/admin/brands/${id}`, { method: "POST", auth: true, body: data })
export const deleteBrand = (id) => client(`/admin/brands/${id}`, { method: "DELETE", auth: true })

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const getSizes = () => client("/admin/sizes", { auth: true })
export const createSize = (data) => client("/admin/sizes", { method: "POST", auth: true, body: data })
export const updateSize = (id, data) => client(`/admin/sizes/${id}`, { method: "POST", auth: true, body: data })
export const deleteSize = (id) => client(`/admin/sizes/${id}`, { method: "DELETE", auth: true })

// ─── Units ────────────────────────────────────────────────────────────────────

export const getUnits = () => client("/admin/units", { auth: true })
export const createUnit = (data) => client("/admin/units", { method: "POST", auth: true, body: data })
export const updateUnit = (id, data) => client(`/admin/units/${id}`, { method: "POST", auth: true, body: data })
export const deleteUnit = (id) => client(`/admin/units/${id}`, { method: "DELETE", auth: true })

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getAdminOrders = () => client("/admin/all-orders", { method: "POST", auth: true })
