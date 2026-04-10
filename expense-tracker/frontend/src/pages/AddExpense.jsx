import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { MdCloudUpload } from 'react-icons/md'

const categories = [
  { name: 'Food', icon: '🍕', color: 'from-orange-500/30 to-red-500/20 border-orange-500/30' },
  { name: 'Transport', icon: '🚗', color: 'from-blue-500/30 to-blue-600/20 border-blue-500/30' },
  { name: 'Shopping', icon: '🛍️', color: 'from-pink-500/30 to-pink-600/20 border-pink-500/30' },
  { name: 'Entertainment', icon: '🎬', color: 'from-purple-500/30 to-purple-600/20 border-purple-500/30' },
  { name: 'Health', icon: '💊', color: 'from-green-500/30 to-green-600/20 border-green-500/30' },
  { name: 'Bills', icon: '📱', color: 'from-yellow-500/30 to-yellow-600/20 border-yellow-500/30' },
  { name: 'Education', icon: '📚', color: 'from-cyan-500/30 to-cyan-600/20 border-cyan-500/30' },
  { name: 'Travel', icon: '✈️', color: 'from-indigo-500/30 to-indigo-600/20 border-indigo-500/30' },
  { name: 'Other', icon: '💸', color: 'from-gray-500/30 to-gray-600/20 border-gray-500/30' },
]

const paymentMethods = [
  { value: 'Cash', icon: '💵' }, { value: 'Card', icon: '💳' }, { value: 'UPI', icon: '📲' }, { value: 'Bank Transfer', icon: '🏦' }
]

export default function AddExpense() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash' })
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/expenses', { ...form, amount: parseFloat(form.amount) })
      setSuccess(true)
      toast.success('Expense added successfully! 🎉')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally { setLoading(false) }
  }

  const handleReceiptChange = (e) => {
    const f = e.target.files[0]
    if (f) { setReceipt(f); setReceiptPreview(URL.createObjectURL(f)) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {success && (
        <div className="glass p-4 border-green-500/30 bg-green-500/10 text-center">
          <span className="text-2xl">✅</span>
          <p className="text-green-400 font-semibold mt-1">Expense Added Successfully!</p>
        </div>
      )}

      <div className="glass p-6">
        <h2 className="text-xl font-bold text-white mb-6">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
              <input type="number" required step="0.01" min="0" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} className="input-field pl-8 text-lg font-bold" placeholder="0.00" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-white/70 text-sm font-medium mb-3 block">Category *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map(cat => (
                <button key={cat.name} type="button" onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${form.category === cat.name ? `bg-gradient-to-br ${cat.color} scale-105` : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs text-white/70">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Description *</label>
            <input type="text" required value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="What did you spend on?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" style={{ colorScheme: 'dark' }} />
            </div>
            {/* Payment Method */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">Payment</label>
              <select value={form.paymentMethod} onChange={(e) => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className="input-field" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {paymentMethods.map(m => <option key={m.value} value={m.value} style={{ background: '#302b63' }}>{m.icon} {m.value}</option>)}
              </select>
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Receipt (Optional)</label>
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-400/50 hover:bg-white/5 transition-all">
              <MdCloudUpload className="text-2xl text-purple-400" />
              <span className="text-white/50 text-sm">{receipt ? receipt.name : 'Upload receipt image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleReceiptChange} />
            </label>
            {receiptPreview && <img src={receiptPreview} alt="Receipt" className="mt-2 w-full max-h-40 object-cover rounded-xl" />}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '💾'}
            {loading ? 'Saving...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
