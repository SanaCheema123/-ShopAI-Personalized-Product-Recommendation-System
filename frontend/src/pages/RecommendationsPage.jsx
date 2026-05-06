import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, TrendingUp, Clock, Award, RefreshCw, Zap, Eye, Heart } from 'lucide-react'
import { recommendAPI } from '../services/api'
import { ScrollableRow } from '../components/product/ProductGrid'
import ProductGrid from '../components/product/ProductGrid'
import { useAuthStore, useActivityStore, useWishlistStore } from '../store'
import ProductCard from '../components/product/ProductCard'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'for-you',      label: 'For You',      icon: '🎯', desc: 'AI-personalized picks' },
  { id: 'trending',     label: 'Trending',     icon: '🔥', desc: 'Hottest right now' },
  { id: 'best-sellers', label: 'Best Sellers', icon: '🏆', desc: 'Top rated' },
  { id: 'new-arrivals', label: 'New Arrivals', icon: '🆕', desc: 'Just added' },
]

function ExplainabilityPanel({ product }) {
  if (!product) return null
  const reasons = [
    { icon: '👁️', text: `Because you viewed similar ${product.category_name} products` },
    { icon: '🤝', text: 'Users with similar taste also bought this' },
    { icon: '📊', text: `Matches your interest in ${product.brand}` },
    { icon: '⭐', text: `Highly rated: ${product.rating}/5 from ${product.review_count} reviews` },
  ]
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(0,208,132,0.15)', borderRadius: '12px', padding: '12px', marginTop: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#00d084', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why recommended?</div>
      {reasons.slice(0,2).map((r,i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>{r.icon}</span> {r.text}
        </div>
      ))}
    </div>
  )
}

function UserPreferencePanel() {
  const { user } = useAuthStore()
  const { recentlyViewed, sessionClicks } = useActivityStore()
  const { items: wishlist } = useWishlistStore()
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '16px' }}>✨</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Your Preferences</span>
        <button style={{ marginLeft: 'auto', fontSize: '11px', color: '#00d084', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {[
          ['Categories', 'Electronics, Gadgets'],
          ['Price Range', '$100 – $1,500'],
          ['Brands', 'Apple, Samsung, Sony'],
          ['Interests', 'Tech, Smart Gadgets'],
        ].map(([k,v]) => (
          <div key={k}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{k}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          ['👁️', recentlyViewed.length, 'Viewed'],
          ['❤️', wishlist.length, 'Wishlisted'],
          ['🖱️', sessionClicks.length, 'Clicks'],
        ].map(([icon, count, label]) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '8px' }}>
            <div style={{ fontSize: '14px' }}>{icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{count}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentlyViewedPanel() {
  const { recentlyViewed } = useActivityStore()
  if (!recentlyViewed.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} style={{ color: '#00d084' }} /> Recently Viewed
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentlyViewed.slice(0,3).map(p => (
          <div key={p.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <img src={p.image_url} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-elevated)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#00d084', fontWeight: 700 }}>${p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReferEarnPanel() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#1a0d2e,#0d1a2e)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>🎁</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Refer & Earn</span>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Invite your friends and earn exclusive rewards!</p>
      <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', fontSize: '12px', padding: '8px' }}>Invite Now</button>
    </div>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('for-you')
  const qc = useQueryClient()

  const { data: forYou, isLoading: fyl } = useQuery({ queryKey: ['for-you'], queryFn: () => recommendAPI.forYou({ n: 12 }).then(r => r.data) })
  const { data: trending, isLoading: tl } = useQuery({ queryKey: ['trending'], queryFn: () => recommendAPI.trending().then(r => r.data) })
  const { data: bestSellers, isLoading: bsl } = useQuery({ queryKey: ['best-sellers'], queryFn: () => recommendAPI.bestSellers().then(r => r.data) })
  const { data: newArrivals, isLoading: nal } = useQuery({ queryKey: ['new-arrivals'], queryFn: () => recommendAPI.newArrivals().then(r => r.data) })

  const retrain = useMutation({
    mutationFn: () => recommendAPI.retrain(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['for-you'] }); toast.success('✨ AI model retrained!') },
  })

  const tabData = {
    'for-you': { products: forYou, loading: fyl, showScore: true },
    'trending': { products: trending, loading: tl },
    'best-sellers': { products: bestSellers, loading: bsl },
    'new-arrivals': { products: newArrivals, loading: nal },
  }
  const current = tabData[activeTab]

  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
      {/* Main */}
      <div className="animate-fade-up">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={24} style={{ color: '#00d084' }} /> Smart Recommendations
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Welcome back, <strong style={{ color: 'white' }}>{user?.full_name}</strong>. Powered by AIVONEX hybrid AI.
            </p>
          </div>
          <button onClick={() => retrain.mutate()} disabled={retrain.isPending} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <RefreshCw size={13} style={{ animation: retrain.isPending ? 'spin 1s linear infinite' : 'none' }} />
            {retrain.isPending ? 'Retraining...' : 'Retrain AI'}
          </button>
        </div>

        {/* AI info */}
        <div style={{ background: 'linear-gradient(135deg,rgba(0,208,132,0.05),rgba(59,130,246,0.05))', border: '1px solid rgba(0,208,132,0.1)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'rgba(0,208,132,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} style={{ color: '#00d084' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>How your recommendations work</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CF (60%) + Content AI (40%) — learning from every interaction</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
            {[['60%','Collab Filter','#00d084'],['40%','Content AI','#3b82f6'],['∞','Learning','#f59e0b']].map(([v,l,c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg,#00d084,#00a866)' : 'var(--bg-elevated)',
              color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 4px 16px rgba(0,208,132,0.25)' : 'none'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Products */}
        <ProductGrid products={current.products} loading={current.loading} showScore={current.showScore || false} />
      </div>

      {/* Right sidebar panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '72px' }}>
        <UserPreferencePanel />
        <RecentlyViewedPanel />
        <ReferEarnPanel />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
