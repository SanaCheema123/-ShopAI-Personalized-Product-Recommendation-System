// CartPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { useCartStore } from '../store'
import toast from 'react-hot-toast'

export function CartPage() {
  const qc = useQueryClient()
  const { setCart, removeItem: removeFromStore } = useCartStore()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => usersAPI.getCart().then(r => { setCart(r.data.items); return r.data }),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => usersAPI.removeFromCart(id),
    onSuccess: (_, id) => {
      removeFromStore(id)
      qc.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Removed from cart')
    },
  })

  if (isLoading) return <div className="page-container text-center py-20 text-slate-500">Loading cart...</div>

  return (
    <div className="page-container animate-fade-in">
      <Link to="/products" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>
      <h1 className="section-title mb-8">Your Cart ({cart?.count || 0} items)</h1>

      {!cart?.items?.length ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-4">Your cart is empty</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map(item => (
              <div key={item.cart_item_id} className="card p-4 flex gap-4">
                <img src={item.product.image_url} className="w-20 h-20 object-cover rounded-xl bg-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">{item.product.brand}</p>
                  <p className="text-sm font-semibold text-white line-clamp-1">{item.product.name}</p>
                  <p className="text-green-400 font-bold mt-1">${item.product.price} × {item.quantity}</p>
                </div>
                <button onClick={() => removeMutation.mutate(item.cart_item_id)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="card p-6 h-fit">
            <h2 className="font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-slate-400 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>${cart.total?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-green-400">Free</span></div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white text-base">
                <span>Total</span><span>${cart.total?.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-primary w-full py-3">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
