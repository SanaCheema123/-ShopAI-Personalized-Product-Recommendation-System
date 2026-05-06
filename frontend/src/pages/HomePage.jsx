import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Star, ArrowRight, Zap, Shield, Truck, RefreshCw, Eye, Clock, ChevronRight, Crown, Gift, MessageSquare, Phone, RotateCcw, Lock } from 'lucide-react'
import { productsAPI, recommendAPI } from '../services/api'
import { useAuthStore, useActivityStore } from '../store'
import ProductCard from '../components/product/ProductCard'
import { ScrollableRow } from '../components/product/ProductGrid'

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ title, icon, subtitle, children, viewAll, badge }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
            <h2 className="section-title">{title}</h2>
            {badge && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'rgba(0,208,132,0.15)', color: '#00d084', border: '1px solid rgba(0,208,132,0.25)' }}>{badge}</span>}
          </div>
          {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        {viewAll && <Link to={viewAll} style={{ fontSize: '12px', color: '#00d084', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>View all <ChevronRight size={14} /></Link>}
      </div>
      {children}
    </div>
  )
}

/* ── Hero ───────────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  return (
    <div style={{ background: 'linear-gradient(135deg,#0d1829 0%,#0a1520 50%,#0d1a12 100%)', borderRadius: '20px', padding: '36px 32px', position: 'relative', overflow: 'hidden', marginBottom: '28px', border: '1px solid var(--border)' }}>
      {/* Glow effects */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(0,208,132,0.08),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(59,130,246,0.06),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: '520px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,208,132,0.12)', color: '#00d084', border: '1px solid rgba(0,208,132,0.2)', marginBottom: '16px' }}>
          <Sparkles size={11} /> AI RECOMMENDATIONS
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '40px', fontWeight: 700, color: 'white', lineHeight: '1.15', marginBottom: '14px' }}>
          Shop Smarter with<br />
          <span className="gradient-text">Personalized AI</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
          Our AI understands your preferences and recommends products you'll love. Smarter. Faster. Better.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/products')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Start Shopping <ArrowRight size={15} />
          </button>
          {!isAuthenticated && (
            <button className="btn-secondary" onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              How It Works <Eye size={15} />
            </button>
          )}
          {isAuthenticated && (
            <button className="btn-secondary" onClick={() => navigate('/recommendations')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} style={{ color: '#00d084' }} /> My Picks
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '28px', marginTop: '28px' }}>
          {[['10K+','Happy Customers'],['50K+','Products Available'],['99%','Match Accuracy'],['24/7','AI Learning']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg,#00d084,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Category grid ──────────────────────────────────────────── */
function CategoryGrid({ categories }) {
  if (!categories) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '28px' }}>
      {categories.slice(0,8).map(cat => (
        <Link key={cat.slug} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 10px', textAlign: 'center', transition: 'all 0.25s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,208,132,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{cat.name}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ── Offer Banners ──────────────────────────────────────────── */
function OfferBanners() {
  const offers = [
    { title: 'Mega Electronics Sale', sub: 'Up to 50% OFF', color: '#00d084', bg: 'linear-gradient(135deg,#001a0f,#002a1a)' },
    { title: 'Best Deals on Laptops', sub: 'Up to 40% OFF', color: '#3b82f6', bg: 'linear-gradient(135deg,#001020,#001a35)' },
    { title: 'Smartphones Bonanza', sub: 'Up to 30% OFF', color: '#8b5cf6', bg: 'linear-gradient(135deg,#0d0020,#1a0035)' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
      {offers.map(o => (
        <div key={o.title} className="offer-card" style={{ background: o.bg }}>
          <div style={{ fontSize: '11px', color: o.color, fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{o.title}</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>{o.sub}</div>
          <button style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', background: o.color, color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Shop Now</button>
        </div>
      ))}
    </div>
  )
}

/* ── Trust Bar ──────────────────────────────────────────────── */
function TrustBar() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', padding: '16px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', marginTop: '28px' }}>
      {[
        [Truck, 'Free Shipping', 'On orders over $50'],
        [RotateCcw, 'Easy Returns', '30-day return policy'],
        [Lock, 'Secure Payments', '100% secure checkout'],
        [Phone, '24/7 Support', "We're here to help"],
      ].map(([Icon, title, sub]) => (
        <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon size={18} style={{ color: '#00d084', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>{title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Explainable AI Info Bar ─────────────────────────────────── */
function AIInfoBar() {
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(0,208,132,0.05),rgba(59,130,246,0.05))', border: '1px solid rgba(0,208,132,0.15)', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(0,208,132,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} style={{ color: '#00d084' }} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Hybrid Recommendation Engine</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Collaborative Filtering (60%) + Content-Based AI (40%)</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', flexWrap: 'wrap' }}>
        {[['🤝','Collaborative Filter'],['📊','Content-Based'],['⚡','Real-Time'],['🎯','Explainable AI']].map(([icon,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Recently Viewed mini section ───────────────────────────── */
function RecentlyViewedMini() {
  const { recentlyViewed } = useActivityStore()
  if (!recentlyViewed.length) return null
  return (
    <Section title="Recently Viewed" icon="👁️" subtitle="Pick up where you left off" viewAll="/profile">
      <div className="scroll-row">
        {recentlyViewed.slice(0,6).map(p => (
          <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none', flexShrink: 0, minWidth: '130px', maxWidth: '130px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,208,132,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              <img src={p.image_url} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#00d084', marginTop: '2px' }}>${p.price}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  const { data: featured, isLoading: fl } = useQuery({ queryKey: ['featured'], queryFn: () => productsAPI.featured().then(r => r.data) })
  const { data: trending, isLoading: tl } = useQuery({ queryKey: ['trending'], queryFn: () => recommendAPI.trending().then(r => r.data) })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => productsAPI.categories().then(r => r.data) })
  const { data: bestSellers, isLoading: bsl } = useQuery({ queryKey: ['best-sellers'], queryFn: () => recommendAPI.bestSellers().then(r => r.data) })
  const { data: newArrivals, isLoading: nal } = useQuery({ queryKey: ['new-arrivals'], queryFn: () => recommendAPI.newArrivals().then(r => r.data) })
  const { data: forYou, isLoading: fyl } = useQuery({
    queryKey: ['recommendations-home'],
    queryFn: () => recommendAPI.forYou({ n: 10 }).then(r => r.data),
    enabled: isAuthenticated,
  })

  return (
    <div style={{ padding: '20px 20px 40px', maxWidth: '100%' }} className="animate-fade-up">
      <Hero />
      <AIInfoBar />
      <RecentlyViewedMini />

      {/* Personalized For You */}
      {isAuthenticated && (
        <Section title="Recommended For You" icon="🎯" subtitle="AI picks based on your behavior" viewAll="/recommendations" badge="PERSONALIZED">
          <ScrollableRow products={forYou} loading={fyl} showScore={true} cardWidth="210px" />
        </Section>
      )}

      {/* Browse Categories */}
      <Section title="Browse Categories" icon="🗂️">
        <CategoryGrid categories={categories} />
      </Section>

      {/* Trending Now */}
      <Section title="Trending Now" icon="🔥" subtitle="Most interacted products this week" viewAll="/products?sort=popular">
        <ScrollableRow products={trending} loading={tl} cardWidth="200px" />
      </Section>

      {/* Featured Products */}
      <Section title="Featured Products" icon="⭐" subtitle="Handpicked for quality and value" viewAll="/products?featured=true">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: '16px' }}>
          {fl ? Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{ borderRadius:'16px',overflow:'hidden',background:'var(--bg-card)',border:'1px solid var(--border)' }}>
              <div className="skeleton" style={{aspectRatio:'1/1'}}/>
              <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
                <div className="skeleton" style={{height:'12px',width:'40%'}}/>
                <div className="skeleton" style={{height:'14px',width:'90%'}}/>
                <div className="skeleton" style={{height:'18px',width:'30%'}}/>
              </div>
            </div>
          )) : featured?.slice(0,6).map(p => <ProductCard key={p.id} product={p} badge="Featured" />)}
        </div>
      </Section>

      {/* Top Offers */}
      <Section title="Top Offers This Week" icon="💰" viewAll="/products">
        <OfferBanners />
      </Section>

      {/* Best Sellers */}
      <Section title="Best Sellers" icon="🏆" subtitle="Top rated by our customers" viewAll="/recommendations">
        <ScrollableRow products={bestSellers} loading={bsl} cardWidth="195px" />
      </Section>

      {/* New Arrivals */}
      <Section title="New Arrivals" icon="🆕" subtitle="Just added to store" viewAll="/products?sort=newest">
        <ScrollableRow products={newArrivals} loading={nal} cardWidth="195px" />
      </Section>

      {/* Refer & Earn */}
      {isAuthenticated && (
        <div style={{ background: 'linear-gradient(135deg,#1a0d2e,#0d1a2e)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🎁</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Refer & Earn</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Invite your friends and earn exclusive rewards!</div>
            </div>
          </div>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>Invite Now</button>
        </div>
      )}

      {/* CTA for guests */}
      {!isAuthenticated && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', marginBottom: '28px' }}>
          <Sparkles size={40} style={{ color: '#00d084', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>Get Your Personal AI Shopping Assistant</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Create a free account to unlock AI-powered recommendations tailored just for you.</p>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} /> Create Free Account
          </Link>
        </div>
      )}

      <TrustBar />
    </div>
  )
}
