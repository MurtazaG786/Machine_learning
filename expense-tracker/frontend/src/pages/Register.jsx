import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.name, form.email, form.password)
    if (result.success) { navigate('/'); toast.success('Account created!') }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>
      <div className="glass w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl mx-auto mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 mt-2">Start tracking your expenses</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Full Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} className="input-field" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Create Account
          </button>
        </form>
        <p className="text-center text-white/50 mt-6 text-sm">Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign In</Link></p>
      </div>
    </div>
  )
}
