import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Zap, TrendingUp, Star, Eye } from 'lucide-react'
import { usersAPI, interactionsAPI } from '../../services/api'
import { useAuthStore, useCartStore, useWishlistStore, useActivityStore } from '../../store'
import toast from 'react-hot-toast'

function Stars({ rating }) {
  return <span className="stars">{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
}

function AIBadge({ type }) {
  const styles = {
    'AI Recommended': { bg: 'rgba(0,208,132,0.18)', color: '#00d084', border: 'rgba(0,208,132,0.3)', icon: '🤖' },
    'Trending': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', icon: '🔥' },
    'Best Match': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)', icon: '✨' },
    'Top Rated': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)', icon: '⭐' },
    'Featured': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', icon: '🏆' },
  }
  const s = styles[type] || styles['AI Recommended']
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {s.icon} {type}
    </span>
  )
}

export default function ProductCard({ product, showScore = false, recommendationScore, reason, badge }) {
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { addViewed, addClick } = useActivityStore()
  const isWishlisted = has(product.id)

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login first'); return }
    try {
      await usersAPI.addToCart(product.id)
      await interactionsAPI.log(product.id, 'cart')
      addItem({ cart_item_id: Date.now(), product, quantity: 1 })
      toast.success('Added to cart! 🛒')
    } catch { toast.error('Failed to add to cart') }
  }

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login first'); return }
    toggle(product)
    toast.success(has(product.id) ? 'Removed from wishlist' : '❤️ Added to wishlist')
  }

  const handleClick = () => {
    addClick(product.id)
    addViewed({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category_name: product.category_name })
    if (isAuthenticated) interactionsAPI.log(product.id, 'click').catch(() => {})
  }

  const discount = product.original_price > product.price ? Math.round((1 - product.price / product.original_price) * 100) : 0
  const autoBadge = badge || (product.is_featured ? 'Featured' : showScore && recommendationScore > 0.7 ? 'Best Match' : showScore ? 'AI Recommended' : null)

  return (
    <Link to={`/products/${product.id}`} onClick={handleClick} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ height: '100%' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
          <img src={product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
            alt={product.name} className="product-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400' }} />

          {/* Top badges */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {discount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: '#ef4444', color: 'white' }}>-{discount}%</span>}
            {autoBadge && <AIBadge type={autoBadge} />}
          </div>

          {/* Wishlist */}
          <button onClick={handleWishlist} style={{
            position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px',
            borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isWishlisted ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.4)',
            color: isWishlisted ? '#ef4444' : 'white', transition: 'all 0.2s'
          }}>
            <Heart size={13} fill={isWishlisted ? '#ef4444' : 'none'} />
          </button>

          {/* AI reason overlay */}
          {reason && showScore && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.8))', padding: '16px 8px 6px', fontSize: '10px', color: '#00d084', fontWeight: 600 }}>
              <Zap size={10} style={{ display: 'inline', marginRight: '3px' }} />{reason}
            </div>
          )}

          {/* Cart hover button */}
          <button onClick={handleAddToCart} style={{
            position: 'absolute', bottom: '8px', right: '8px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#00d084,#00a866)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s', color: 'white'
          }} className="cart-btn">
            <ShoppingCart size={14} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <Stars rating={product.rating} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({(product.review_count || 0).toLocaleString()})</span>
          </div>

          {/* Score bar */}
          {showScore && recommendationScore > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>AI Match</span>
                <span style={{ color: '#00d084', fontWeight: 700 }}>{Math.min(Math.round(recommendationScore * 100), 99)}%</span>
              </div>
              <div style={{ height: '3px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div className="score-bar" style={{ width: `${Math.min(recommendationScore * 100, 99)}%` }} />
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>{product.tags[0]}</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>${product.price}</span>
              {product.original_price > product.price && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>${product.original_price}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`.card:hover .cart-btn { opacity: 1 !important; }`}</style>
    </Link>
  )
}
