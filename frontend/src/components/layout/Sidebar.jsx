import { Link, useLocation } from 'react-router-dom'
import { Home, Sparkles, Eye, Heart, ShoppingBag, Crown, Check } from 'lucide-react'
import { useAuthStore, useWishlistStore, useActivityStore, useUIStore } from '../../store'

const CATEGORIES = [
  { slug: 'electronics',  label: 'Electronics',   icon: '💻' },
  { slug: 'clothing',     label: 'Clothing',       icon: '👕' },
  { slug: 'home-garden',  label: 'Home & Garden',  icon: '🏡' },
  { slug: 'sports',       label: 'Sports',         icon: '⚽' },
  { slug: 'books',        label: 'Books',          icon: '📚' },
  { slug: 'beauty',       label: 'Beauty',         icon: '💄' },
  { slug: 'toys',         label: 'Toys',           icon: '🧸' },
  { slug: 'automotive',   label: 'Automotive',     icon: '🚗' },
]

export default function Sidebar() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { items: wishlist } = useWishlistStore()
  const { recentlyViewed } = useActivityStore()
  const { sidebarOpen } = useUIStore()

  if (!sidebarOpen) return null

  return (
    <aside style={{
      width: '240px', minWidth: '240px',
      height: 'calc(100vh - 56px)', position: 'sticky', top: '56px',
      overflowY: 'auto', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px'
    }}>

      {/* Main Nav */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={15} /> Home
        </button>
      </Link>

      {isAuthenticated && (
        <Link to="/recommendations" style={{ textDecoration: 'none' }}>
          <button className={`nav-item ${location.pathname === '/recommendations' ? 'active' : ''}`}>
            <Sparkles size={15} />
            <span style={{ flex: 1 }}>AI Recommendations</span>
            <span style={{ fontSize: '9px', background: '#00d084', color: '#000', padding: '1px 5px', borderRadius: '6px', fontWeight: 700 }}>NEW</span>
          </button>
        </Link>
      )}

      {/* Categories */}
      <div style={{ marginTop: '14px', marginBottom: '6px', paddingLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Categories
      </div>
      {CATEGORIES.map(cat => (
        <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
          <button className={`nav-item ${location.search.includes(cat.slug) ? 'active' : ''}`}>
            <span style={{ fontSize: '14px' }}>{cat.icon}</span>
            {cat.label}
          </button>
        </Link>
      ))}

      {/* My Activity */}
      {isAuthenticated && (
        <>
          <div style={{ marginTop: '14px', marginBottom: '6px', paddingLeft: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            My Activity
          </div>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <button className="nav-item">
              <Eye size={14} />
              <span style={{ flex: 1 }}>Recently Viewed</span>
              {recentlyViewed.length > 0 && (
                <span style={{ fontSize: '11px', color: '#00d084', fontWeight: 700 }}>{recentlyViewed.length}</span>
              )}
            </button>
          </Link>
          <Link to="/wishlist" style={{ textDecoration: 'none' }}>
            <button className="nav-item">
              <Heart size={14} />
              <span style={{ flex: 1 }}>Liked Items</span>
              {wishlist.length > 0 && (
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>{wishlist.length}</span>
              )}
            </button>
          </Link>
          <Link to="/cart" style={{ textDecoration: 'none' }}>
            <button className="nav-item">
              <ShoppingBag size={14} /> My Orders
            </button>
          </Link>
        </>
      )}

      {/* Premium Upgrade */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg,#1a1500,#2a1f00)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Crown size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>Upgrade to Premium</span>
          </div>
          {['Exclusive deals & offers', 'Early access to offers', 'Free shipping', 'Premium support'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <Check size={11} style={{ color: '#00d084', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
          <button className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '12px', background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}
