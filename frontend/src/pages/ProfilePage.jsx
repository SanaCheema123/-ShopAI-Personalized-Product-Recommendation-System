import { useQuery } from '@tanstack/react-query'
import { User, ShoppingBag, Star, Clock } from 'lucide-react'
import { interactionsAPI } from '../services/api'
import { useAuthStore } from '../store'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: history } = useQuery({
    queryKey: ['interaction-history'],
    queryFn: () => interactionsAPI.history().then(r => r.data),
  })

  const eventColors = { view: 'badge-blue', click: 'badge-green', cart: 'badge-amber', purchase: 'badge-red', wishlist: 'badge-green' }

  return (
    <div className="page-container animate-fade-in max-w-3xl">
      <h1 className="section-title mb-8">My Profile</h1>

      <div className="card p-6 mb-6 flex items-center gap-5">
        <img src={user?.avatar_url} className="w-20 h-20 rounded-2xl border-2 border-green-500/30" alt="avatar" />
        <div>
          <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
          <p className="text-slate-400">@{user?.username}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-400" /> Recent Activity
        </h3>
        {history?.length ? (
          <div className="space-y-2">
            {history.slice(0, 20).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={eventColors[item.event_type] || 'badge-blue'}>{item.event_type}</span>
                  <span className="text-slate-400 text-sm">Product #{item.product_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="text-xs text-green-400 font-mono">score: {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No activity yet. Start browsing products!</p>
        )}
      </div>
    </div>
  )
}
