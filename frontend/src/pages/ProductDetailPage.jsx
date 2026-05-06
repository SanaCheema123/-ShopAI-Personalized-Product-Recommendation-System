import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Heart, ArrowLeft, Package, Shield, Truck, Star, Zap, Eye, RotateCcw, Lock, Share2, Check } from 'lucide-react'
import { productsAPI, interactionsAPI, usersAPI } from '../services/api'
import { useAuthStore, useCartStore, useWishlistStore, useActivityStore } from '../store'
import ProductCard from '../components/product/ProductCard'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

function Stars({ rating, large }) {
  return <span style={{ color: '#f59e0b', fontSize: large ? '16px' : '13px', letterSpacing: '-1px' }}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5-Math.floor(rating))}</span>
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { addViewed, addClick } = useActivityStore()
  const [qty, setQty] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const { data: product, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => productsAPI.get(id).then(r => r.data) })
  const { data: similar } = useQuery({ queryKey: ['similar', id], queryFn: () => productsAPI.similar(id).then(r => r.data), enabled: !!id })

  useEffect(() => {
    if (product && isAuthenticated) {
      interactionsAPI.log(parseInt(id), 'view').catch(() => {})
      addViewed({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category_name: product.category_name })
    }
  }, [product, isAuthenticated])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    try {
      await usersAPI.addToCart(product.id, qty)
      await interactionsAPI.log(product.id, 'cart')
      addItem({ cart_item_id: Date.now(), product, quantity: qty })
      setAddedToCart(true)
      toast.success('Added to cart! 🛒')
      setTimeout(() => setAddedToCart(false), 3000)
    } catch { toast.error('Failed to add to cart') }
  }

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return }
    toggle(product)
    toast.success(has(product?.id) ? 'Removed from wishlist' : '❤️ Wishlisted!')
  }

  if (isLoading) return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: '20px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[60,40,80,30,50].map((w,i) => <div key={i} className="skeleton" style={{ height: i===2?'40px':'16px', width: `${w}%`, borderRadius: '8px' }} />)}
      </div>
    </div>
  )
  if (!product) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Product not found</div>

  const discount = product.original_price > product.price ? Math.round((1-product.price/product.original_price)*100) : 0
  const isWishlisted = has(product.id)

  const aiReasons = [
    `Recommended because you viewed ${product.category_name} products`,
    `Popular among users with similar taste`,
    `Top-rated in ${product.category_name} category`,
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '100%' }}>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={15} /> Back to Products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        {/* Image */}
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', aspectRatio: '1/1' }}>
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {discount > 0 && <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px' }}>-{discount}% OFF</span>}
        </div>

        {/* Details */}
        <div>
          <div style={{ fontSize: '12px', color: '#00d084', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {product.category_name} · {product.brand}
          </div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '14px' }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Stars rating={product.rating} large />
            <span style={{ fontWeight: 700, color: 'white' }}>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>({(product.review_count||0).toLocaleString()} reviews)</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00d084', marginLeft: '4px' }}>5K+ sold</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '34px', fontWeight: 800, color: 'white' }}>${product.price}</span>
            {product.original_price > product.price && <span style={{ fontSize: '20px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${product.original_price}</span>}
            {discount > 0 && <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>-{discount}%</span>}
          </div>

          {/* Features / tags */}
          {product.features && Object.keys(product.features).length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Advanced Noise Cancelling', '30-hour battery life', 'Quick charge (3 min = 3 hours)', 'Multipoint connection'].slice(0,3).map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Check size={13} style={{ color: '#00d084', flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {product.tags?.map(tag => (
              <span key={tag} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>#{tag}</span>
            ))}
          </div>

          {/* Qty + actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px 10px' }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>−</button>
              <span style={{ fontWeight: 700, color: 'white', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>+</button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              {addedToCart ? <><Check size={16}/> Added!</> : <><ShoppingCart size={16}/> Add to Cart</>}
            </button>
            <button onClick={handleWishlist} style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--border)', background: isWishlisted ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)', color: isWishlisted ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' }}>
            {[[Truck,'Free Shipping','On orders $50+'],[Shield,'Secure Payment','256-bit SSL'],[RotateCcw,'30-Day Returns','Easy returns'],[Package,'1 Year Warranty','Warranty included']].map(([Icon,t,s]) => (
              <div key={t} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <Icon size={14} style={{ color: '#00d084', marginBottom: '4px' }} />
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'white' }}>{t}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{s}</div>
              </div>
            ))}
          </div>

          {/* AI Explanation */}
          <div style={{ background: 'rgba(0,208,132,0.04)', border: '1px solid rgba(0,208,132,0.12)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#00d084', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={11} /> WHY WE RECOMMEND THIS
            </div>
            {aiReasons.map((r,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#00d084', flexShrink: 0 }}>•</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar?.length > 0 && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 className="section-title">
              <Eye size={18} style={{ color: '#00d084' }} /> Similar Products
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Because you viewed this item</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
            {similar.map(p => <ProductCard key={p.id} product={p} badge="Similar" />)}
          </div>
        </div>
      )}
    </div>
  )
}
