import ProductCard from './ProductCard'

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ aspectRatio: '1/1' }} />
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            <div className="skeleton" style={{ height: '14px', width: '90%' }} />
            <div className="skeleton" style={{ height: '12px', width: '60%' }} />
            <div className="skeleton" style={{ height: '18px', width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductGrid({ products, loading, showScore = false, cols = 'auto' }) {
  if (loading) return <ProductGridSkeleton />
  if (!products?.length) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛍️</div>
      <p style={{ fontSize: '16px' }}>No products found</p>
    </div>
  )
  const gridCols = cols === 'auto' ? 'repeat(auto-fill,minmax(180px,1fr))' : `repeat(${cols},1fr)`
  return (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} showScore={showScore}
          recommendationScore={p.recommendation_score} reason={p.reason} />
      ))}
    </div>
  )
}

export function ScrollableRow({ products, loading, showScore = false, cardWidth = '200px' }) {
  if (loading) return (
    <div className="scroll-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ minWidth: cardWidth, borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="skeleton" style={{ height: '180px' }} />
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ height: '10px', width: '50%' }} />
            <div className="skeleton" style={{ height: '12px', width: '85%' }} />
            <div className="skeleton" style={{ height: '16px', width: '35%' }} />
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <div className="scroll-row">
      {products?.map(p => (
        <div key={p.id} style={{ minWidth: cardWidth, maxWidth: cardWidth, flexShrink: 0 }}>
          <ProductCard product={p} showScore={showScore} recommendationScore={p.recommendation_score} reason={p.reason} />
        </div>
      ))}
    </div>
  )
}
