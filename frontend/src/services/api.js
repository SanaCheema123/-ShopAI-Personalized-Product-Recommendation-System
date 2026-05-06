import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', new URLSearchParams({ username: email, password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
  me: () => api.get('/auth/me'),
}

// Products
export const productsAPI = {
  list: (params) => api.get('/products/', { params }),
  get: (id) => api.get(`/products/${id}`),
  featured: () => api.get('/products/featured'),
  categories: () => api.get('/products/categories'),
  similar: (id) => api.get(`/products/${id}/similar`),
}

// Recommendations
export const recommendAPI = {
  forYou: (params) => api.get('/recommendations/for-you', { params }),
  trending: () => api.get('/recommendations/trending'),
  newArrivals: () => api.get('/recommendations/new-arrivals'),
  bestSellers: () => api.get('/recommendations/best-sellers'),
  retrain: () => api.post('/recommendations/retrain'),
}

// Interactions
export const interactionsAPI = {
  log: (product_id, event_type, rating) => api.post('/interactions/', { product_id, event_type, rating }),
  history: () => api.get('/interactions/history'),
}

// Users
export const usersAPI = {
  profile: () => api.get('/users/profile'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getCart: () => api.get('/users/cart'),
  addToCart: (product_id, quantity = 1) => api.post('/users/cart', { product_id, quantity }),
  removeFromCart: (item_id) => api.delete(`/users/cart/${item_id}`),
}

export default api
