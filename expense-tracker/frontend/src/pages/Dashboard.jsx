import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import ExpenseCard from '../components/ExpenseCard'
import ScanBillModal from '../components/ScanBillModal'
import toast from 'react-hot-toast'
import { getCurrencySymbol } from '../utils/currency'

export default function Dashboard() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(null)
  const [todayData, setTodayData] = useState({ expenses: [], total: 0 })
  const [recentExpenses, setRecentExpenses] = useState([])
  const [scanModal, setScanModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quickForm, setQuickForm] = useState({ amount: '', category: 'Food', description: '' })

  const currency = getCurrencySymbol(user?.currency)

  const fetchData = useCallback(async () => {
    try {
      const [balRes, todayRes, expRes] = await Promise.all([
        api.get('/expenses/balance'),
        api.get('/expenses/today'),
        api.get('/expenses')
      ])
      setBalance(balRes.data)
      setTodayData(todayRes.data)
      setRecentExpenses(expRes.data.slice(0, 10))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id) => {
    try { await api.delete(`/expenses/${id}`); await fetchData(); toast.success('Deleted') } catch { toast.error('Failed to delete') }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!quickForm.amount || !quickForm.description) return toast.error('Fill all fields')
    try {
      await api.post('/expenses', { ...quickForm, amount: parseFloat(quickForm.amount) })
      toast.success('Expense added!')
      setQuickForm({ amount: '', category: 'Food', description: '' })
      fetchData()
    } catch { toast.error('Failed to add expense') }
  }

  const handleAddFromScan = async (expenseData) => {
    await api.post('/expenses', expenseData)
    fetchData()
  }

  const budgetPercent = balance ? Math.min((balance.totalExpenses / (balance.monthlyBudget || 1)) * 100, 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-white/50 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {/* Scan Bill FAB */}
        <button onClick={() => setScanModal(true)}
          className="relative group flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
          <span className="text-xl">📷</span>
          <span className="hidden sm:block">Scan Bill</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" title="Monthly Budget" value={`${currency}${(balance?.monthlyBudget || 0).toFixed(2)}`} subtitle="Total budget" color="purple" />
        <StatCard icon="📊" title="Month Expenses" value={`${currency}${(balance?.totalExpenses || 0).toFixed(2)}`} subtitle={`${balance?.expenseCount || 0} transactions`} color="red" />
        <StatCard icon="📅" title="Today's Spending" value={`${currency}${todayData.total.toFixed(2)}`} subtitle={`${todayData.expenses.length} items`} color="cyan" />
        <StatCard icon="💵" title="Balance Left" value={`${currency}${Math.max(0, (balance?.balance || 0)).toFixed(2)}`} subtitle={balance?.balance < 0 ? '⚠️ Over budget' : 'Remaining'} color={balance?.balance < 0 ? 'red' : 'green'} />
      </div>

      {/* Budget Progress */}
      {balance?.monthlyBudget > 0 && (
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Budget Progress</span>
            <span className="text-white/60 text-sm">{budgetPercent.toFixed(1)}% used</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${budgetPercent}%`, background: budgetPercent > 90 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : budgetPercent > 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Spent: {currency}{(balance?.totalExpenses || 0).toFixed(2)}</span>
            <span>Budget: {currency}{(balance?.monthlyBudget || 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Recent Transactions</h3>
            <Link to="/add-expense" className="text-purple-400 hover:text-purple-300 text-sm">+ Add New</Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💸</div>
              <p className="text-white/60">No expenses yet</p>
              <p className="text-white/30 text-sm mt-1">Add your first expense!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(exp => <ExpenseCard key={exp._id} expense={exp} currency={currency} onDelete={handleDelete} />)}
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="glass p-6">
          <h3 className="text-white font-bold text-lg mb-4">Quick Add</h3>
          <form onSubmit={handleQuickAdd} className="space-y-3">
            <input type="number" placeholder="Amount" required value={quickForm.amount} onChange={(e) => setQuickForm(p => ({ ...p, amount: e.target.value }))} className="input-field" step="0.01" min="0" />
            <select value={quickForm.category} onChange={(e) => setQuickForm(p => ({ ...p, category: e.target.value }))} className="input-field" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {['Food','Transport','Shopping','Entertainment','Health','Bills','Education','Travel','Other'].map(c => <option key={c} value={c} style={{ background: '#302b63' }}>{c}</option>)}
            </select>
            <input type="text" placeholder="Description" required value={quickForm.description} onChange={(e) => setQuickForm(p => ({ ...p, description: e.target.value }))} className="input-field" />
            <button type="submit" className="btn-primary w-full py-3">Add Expense</button>
          </form>

          {/* Today's Summary */}
          {todayData.expenses.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-white/70 font-semibold text-sm mb-3">Today&apos;s Expenses</h4>
              <div className="space-y-2">
                {todayData.expenses.slice(0, 3).map(exp => (
                  <div key={exp._id} className="flex justify-between text-sm">
                    <span className="text-white/60 truncate flex-1">{exp.description}</span>
                    <span className="text-white font-medium ml-2">{currency}{exp.amount.toFixed(2)}</span>
                  </div>
                ))}
                {todayData.expenses.length > 3 && <p className="text-white/30 text-xs">+{todayData.expenses.length - 3} more</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {scanModal && <ScanBillModal onClose={() => setScanModal(false)} onAddExpense={handleAddFromScan} />}
    </div>
  )
}
