import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlistStore, useCartStore, useAuthStore } from '../store'
import { usersAPI, interactionsAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore()
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { toast.error('Please login'); return }
    try {
      await usersAPI.addToCart(product.id)
      await interactionsAPI.log(product.id, 'cart')
      addItem({ cart_item_id: Date.now(), product, quantity: 1 })
      toast.success('Added to cart!')
    } catch { toast.error('Failed') }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Heart size={22} style={{ color: '#ef4444' }} /> My Wishlist ({items.length})
      </h1>

      {!items.length ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Heart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>Your wishlist is empty</p>
          <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
          {items.map(product => (
            <div key={product.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={product.image_url} alt={product.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: 'var(--bg-elevated)' }} />
                <button onClick={() => toggle(product)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#00d084', marginBottom: '10px' }}>${product.price}</div>
                <button onClick={() => handleAddToCart(product)} className="btn-primary" style={{ width: '100%', fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShoppingCart size={13} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
