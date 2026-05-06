import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, token: null, isAuthenticated: false,
      login: async (email, password) => {
        const res = await authAPI.login(email, password)
        const { access_token, user } = res.data
        localStorage.setItem('token', access_token)
        set({ user, token: access_token, isAuthenticated: true })
        return user
      },
      register: async (data) => {
        const res = await authAPI.register(data)
        const { access_token, user } = res.data
        localStorage.setItem('token', access_token)
        set({ user, token: access_token, isAuthenticated: true })
        return user
      },
      logout: () => { localStorage.removeItem('token'); set({ user: null, token: null, isAuthenticated: false }) },
      fetchMe: async () => { try { const res = await authAPI.me(); set({ user: res.data, isAuthenticated: true }) } catch { get().logout() } },
    }),
    { name: 'auth-store', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)

export const useCartStore = create((set, get) => ({
  items: [], count: 0,
  setCart: (items) => set({ items, count: items.length }),
  addItem: (item) => {
    const exists = get().items.find(i => i.product.id === item.product.id)
    if (exists) set(s => ({ items: s.items.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i) }))
    else set(s => ({ items: [...s.items, item], count: s.count + 1 }))
  },
  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.cart_item_id !== id), count: Math.max(0, s.count - 1) })),
  clearCart: () => set({ items: [], count: 0 }),
  total: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
}))

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.find(p => p.id === product.id)
        if (exists) set(s => ({ items: s.items.filter(p => p.id !== product.id) }))
        else set(s => ({ items: [product, ...s.items] }))
      },
      has: (id) => get().items.some(p => p.id === id),
    }),
    { name: 'wishlist-store' }
  )
)

export const useActivityStore = create(
  persist(
    (set, get) => ({
      recentlyViewed: [],  // [{id, name, price, image_url, category_name}]
      sessionClicks: [],   // product ids clicked this session
      addViewed: (product) => {
        const filtered = get().recentlyViewed.filter(p => p.id !== product.id)
        set({ recentlyViewed: [product, ...filtered].slice(0, 10) })
      },
      addClick: (productId) => {
        const clicks = get().sessionClicks
        if (!clicks.includes(productId)) set({ sessionClicks: [...clicks, productId].slice(-20) })
      },
      clearSession: () => set({ sessionClicks: [] }),
    }),
    { name: 'activity-store' }
  )
)

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}))
