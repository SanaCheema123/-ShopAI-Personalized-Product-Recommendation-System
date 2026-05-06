import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to ShopAI 🎉')
      navigate('/recommendations')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">ShopAI</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400">Join and get personalized AI recommendations</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Sana Arif' },
              { key: 'username',  label: 'Username',  type: 'text', placeholder: 'sana_aivonex' },
              { key: 'email',     label: 'Email',     type: 'email', placeholder: 'sana@aivonex.com' },
              { key: 'password',  label: 'Password',  type: 'password', placeholder: 'Min 8 characters' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm text-slate-400 block mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="input" required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creating account...' : '🚀 Create Account'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-green-400 hover:text-green-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
