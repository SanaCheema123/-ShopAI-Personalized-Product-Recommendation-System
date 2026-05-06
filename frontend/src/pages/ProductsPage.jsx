import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { productsAPI } from '../services/api'
import ProductGrid from '../components/product/ProductGrid'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(1)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, sort, page, featured],
    queryFn: () => productsAPI.list({ category, search, sort, page, limit: 12, featured: featured || undefined }).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.categories().then(r => r.data),
  })

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
    setPage(1)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {search ? `Results for "${search}"` : category ? categories?.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
          </h1>
          {data && <p className="text-slate-500 text-sm mt-1">{data.total} products found</p>}
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); updateParam('sort', e.target.value) }}
          className="input w-auto text-sm">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                <button onClick={() => updateParam('category', '')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  All Categories
                </button>
                {categories?.map(cat => (
                  <button key={cat.slug} onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${category === cat.slug ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={data?.products} loading={isLoading} />

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-green-500 text-white' : 'btn-secondary'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
