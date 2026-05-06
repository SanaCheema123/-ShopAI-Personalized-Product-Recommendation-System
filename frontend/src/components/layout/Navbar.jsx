import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, Heart, Bell, Menu, LogOut, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore, useCartStore, useWishlistStore, useUIStore } from '../../store'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { count } = useCartStore()
  const { items: wishlist } = useWishlistStore()
  const { toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dropOpen, setDropOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search)}`); setSearch('') }
  }
  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  return (
    <nav className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '100%', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sidebar toggle + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
          <button onClick={toggleSidebar} className="btn-ghost" style={{ padding: '6px' }}>
            <Menu size={18} />
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#00d084,#00a866)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: 'white' }}>ShopAI</span>
            <span style={{ fontSize: '10px', background: 'rgba(0,208,132,0.12)', color: '#00d084', border: '1px solid rgba(0,208,132,0.2)', padding: '1px 6px', borderRadius: '6px', fontFamily: 'monospace' }}>powered by AIVONEX</span>
          </Link>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['/', 'Home'], ['/products', 'Shop'], ['/recommendations', 'For You']].map(([to, label]) => (
            <Link key={to} to={to} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', color: location.pathname === to ? '#00d084' : 'var(--text-secondary)', background: location.pathname === to ? 'rgba(0,208,132,0.08)' : 'transparent', transition: 'all 0.2s' }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '360px', display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 12px', gap: '8px' }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brands and more..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', padding: '8px 0' }} />
        </form>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="btn-ghost" style={{ position: 'relative', padding: '8px' }}>
                <Heart size={18} />
                {wishlist.length > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{wishlist.length}</span>}
              </Link>
              <Link to="/cart" className="btn-ghost" style={{ position: 'relative', padding: '8px' }}>
                <ShoppingCart size={18} />
                {count > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', background: '#00d084', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{count}</span>}
              </Link>
              <button className="btn-ghost" style={{ padding: '8px' }}><Bell size={18} /></button>
              <div style={{ position: 'relative' }} onMouseEnter={() => setDropOpen(true)} onMouseLeave={() => setDropOpen(false)}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <img src={user?.avatar_url} style={{ width: '26px', height: '26px', borderRadius: '50%' }} alt="av" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', lineHeight: 1 }}>Hello, {user?.full_name?.split(' ')[0]}</div>
                    <div style={{ fontSize: '10px', color: '#00d084' }}>Premium</div>
                  </div>
                </button>
                {dropOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', width: '160px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', zIndex: 100 }}>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-card)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <Settings size={14} /> Profile
                    </Link>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
