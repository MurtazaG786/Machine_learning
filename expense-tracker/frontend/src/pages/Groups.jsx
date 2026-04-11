import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdGroup, MdClose, MdPerson, MdAttachMoney } from 'react-icons/md'

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Travel', 'Other']

import { getCurrencySymbol } from '../utils/currency'

export default function Groups() {
  const { user } = useAuth()
  const currency = getCurrencySymbol(user?.currency)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [addExpenseModal, setAddExpenseModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food' })

  const fetchGroups = async () => {
    try { const { data } = await api.get('/groups'); setGroups(data) }
    catch { toast.error('Failed to load groups') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGroups() }, [])

  const createGroup = async (e) => {
    e.preventDefault()
    try {
      await api.post('/groups', newGroup)
      toast.success('Group created!')
      setCreateModal(false)
      setNewGroup({ name: '', description: '' })
      fetchGroups()
    } catch { toast.error('Failed to create group') }
  }

  const addExpenseToGroup = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post(`/groups/${selectedGroup._id}/expenses`, { ...newExpense, amount: parseFloat(newExpense.amount) })
      setSelectedGroup(data)
      setAddExpenseModal(false)
      setNewExpense({ description: '', amount: '', category: 'Food' })
      toast.success('Expense added to group!')
      fetchGroups()
    } catch { toast.error('Failed to add expense') }
  }

  const settleExpense = async (expenseId, memberId) => {
    try {
      const { data } = await api.post(`/groups/${selectedGroup._id}/settle`, { expenseId, memberId })
      setSelectedGroup(data)
      toast.success('Settled!')
      fetchGroups()
    } catch { toast.error('Failed to settle') }
  }

  const deleteGroup = async (id) => {
    if (!confirm('Delete this group?')) return
    try { await api.delete(`/groups/${id}`); setSelectedGroup(null); fetchGroups(); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  // Calculate who owes whom
  const calcDebts = (group) => {
    if (!group?.expenses?.length) return []
    const balances = {}
    group.members.forEach(m => { balances[m.name] = 0 })
    group.expenses.forEach(exp => {
      exp.splits?.forEach(split => {
        if (!split.settled) {
          balances[exp.paidByName] = (balances[exp.paidByName] || 0) + split.amount
          balances[split.name] = (balances[split.name] || 0) - split.amount
        }
      })
    })
    const debts = []
    const creditors = Object.entries(balances).filter(([, v]) => v > 0).map(([name, amt]) => ({ name, amt }))
    const debtors = Object.entries(balances).filter(([, v]) => v < 0).map(([name, amt]) => ({ name, amt: -amt }))
    for (let d of debtors) {
      for (let c of creditors) {
        if (d.amt <= 0 || c.amt <= 0) continue
        const amount = Math.min(d.amt, c.amt)
        debts.push({ from: d.name, to: c.name, amount: amount.toFixed(2) })
        d.amt -= amount; c.amt -= amount
      }
    }
    return debts
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Group Expenses</h2>
          <p className="text-white/50 text-sm mt-1">Split expenses with friends</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2"><MdAdd className="text-lg" /> New Group</button>
      </div>

      {groups.length === 0 ? (
        <div className="glass p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-white font-bold text-lg">No groups yet</p>
          <p className="text-white/50 mt-2">Create a group to split expenses with friends</p>
          <button onClick={() => setCreateModal(true)} className="btn-primary mt-4 px-6 py-3">Create First Group</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => {
            const totalExp = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0
            return (
              <div key={group._id} onClick={() => setSelectedGroup(group)} className="glass p-5 cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"><MdGroup className="text-2xl text-white" /></div>
                  <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">{group.members?.length} members</span>
                </div>
                <h3 className="text-white font-bold text-lg">{group.name}</h3>
                {group.description && <p className="text-white/50 text-sm mt-1 truncate">{group.description}</p>}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-white/50 text-sm">Total Expenses</span>
                  <span className="text-white font-bold">{currency}{totalExp.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedGroup.name}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAddExpenseModal(true)} className="btn-primary px-3 py-2 text-sm flex items-center gap-1"><MdAttachMoney /> Add Expense</button>
                  <button onClick={() => deleteGroup(selectedGroup._id)} className="px-3 py-2 text-sm text-red-400 border border-red-400/30 rounded-xl hover:bg-red-500/10">Delete</button>
                  <button onClick={() => setSelectedGroup(null)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60"><MdClose /></button>
                </div>
              </div>

              {/* Members */}
              <div className="mb-6">
                <h3 className="text-white/70 font-semibold mb-3 flex items-center gap-2"><MdPerson /> Members ({selectedGroup.members?.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.members?.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">{(m.name || 'U').charAt(0)}</div>
                      <span className="text-white/80 text-sm">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Owes Whom */}
              {calcDebts(selectedGroup).length > 0 && (
                <div className="mb-6 glass-dark p-4 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">💸 Who Owes Whom</h3>
                  <div className="space-y-2">
                    {calcDebts(selectedGroup).map((debt, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-red-400 font-medium">{debt.from}</span>
                        <span className="text-white/40">owes</span>
                        <span className="text-green-400 font-medium">{debt.to}</span>
                        <span className="text-white font-bold ml-auto">{currency}{debt.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses List */}
              <div>
                <h3 className="text-white/70 font-semibold mb-3">Expenses ({selectedGroup.expenses?.length || 0})</h3>
                {selectedGroup.expenses?.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">No expenses yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedGroup.expenses?.map((exp, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{exp.description}</p>
                            <p className="text-white/40 text-xs">Paid by {exp.paidByName} &bull; {exp.category}</p>
                          </div>
                          <span className="text-white font-bold">{currency}{exp.amount?.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1.5 mt-3 pt-3 border-t border-white/10">
                          {exp.splits?.map((split, j) => (
                            <div key={j} className="flex items-center justify-between text-sm">
                              <span className={split.settled ? 'text-white/30 line-through' : 'text-white/70'}>{split.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={split.settled ? 'text-white/30' : 'text-white'}>{currency}{split.amount?.toFixed(2)}</span>
                                {!split.settled && split.user?.toString() !== user?._id && (
                                  <button onClick={() => settleExpense(exp._id, split.user?.toString() || split.name)} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30">Settle</button>
                                )}
                                {split.settled && <span className="text-xs text-green-400">✓</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Group</h2>
              <button onClick={() => setCreateModal(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60"><MdClose /></button>
            </div>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Group Name *</label>
                <input required value={newGroup.name} onChange={(e) => setNewGroup(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Trip to Goa" />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Description</label>
                <input value={newGroup.description} onChange={(e) => setNewGroup(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="Optional description" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Create Group</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense to Group Modal */}
      {addExpenseModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Group Expense</h2>
              <button onClick={() => setAddExpenseModal(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60"><MdClose /></button>
            </div>
            <form onSubmit={addExpenseToGroup} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Description *</label>
                <input required value={newExpense.description} onChange={(e) => setNewExpense(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="What was this for?" />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Amount *</label>
                <input required type="number" step="0.01" min="0" value={newExpense.amount} onChange={(e) => setNewExpense(p => ({ ...p, amount: e.target.value }))} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Category</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense(p => ({ ...p, category: e.target.value }))} className="input-field" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {categories.map(c => <option key={c} value={c} style={{ background: '#302b63' }}>{c}</option>)}
                </select>
              </div>
              <p className="text-white/40 text-xs">Will be split equally among {selectedGroup.members?.length} members</p>
              <button type="submit" className="btn-primary w-full py-3">Add Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
