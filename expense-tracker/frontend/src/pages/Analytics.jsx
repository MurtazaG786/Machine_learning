import { useState, useEffect } from 'react'
import api from '../api/axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#3b82f6', '#ec4899', '#6b7280']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => <p key={i} className="text-white font-bold">${p.value?.toFixed(2)}</p>)}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { user } = useAuth()
  const currency = user?.currency === 'USD' ? '$' : user?.currency === 'INR' ? '₹' : '$'
  const [monthly, setMonthly] = useState([])
  const [categories, setCategories] = useState([])
  const [weekly, setWeekly] = useState([])
  const [topCats, setTopCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/monthly'),
      api.get('/analytics/categories'),
      api.get('/analytics/weekly'),
      api.get('/analytics/top-categories')
    ]).then(([m, c, w, t]) => {
      setMonthly(m.data)
      setCategories(c.data)
      setWeekly(w.data)
      setTopCats(t.data)
    }).finally(() => setLoading(false))
  }, [])

  const totalMonth = categories.reduce((s, c) => s + c.total, 0)
  const avgDaily = weekly.length ? (weekly.reduce((s, d) => s + d.total, 0) / weekly.length) : 0
  const highestDay = weekly.reduce((max, d) => d.total > max.total ? d : max, { total: 0, day: 'N/A' })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-5 text-center">
          <p className="text-white/50 text-sm mb-1">Avg Daily Spend</p>
          <p className="text-2xl font-bold text-white">{currency}{avgDaily.toFixed(2)}</p>
        </div>
        <div className="glass p-5 text-center">
          <p className="text-white/50 text-sm mb-1">Highest Day</p>
          <p className="text-2xl font-bold text-white">{highestDay.day}</p>
          <p className="text-white/40 text-xs">{currency}{highestDay.total?.toFixed(2)}</p>
        </div>
        <div className="glass p-5 text-center">
          <p className="text-white/50 text-sm mb-1">Top Category</p>
          <p className="text-2xl font-bold text-white">{topCats[0]?.category || 'N/A'}</p>
          <p className="text-white/40 text-xs">{currency}{(topCats[0]?.total || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="glass p-6">
        <h3 className="text-white font-bold text-lg mb-4">Monthly Spending (This Year)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="url(#purpleGrad)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie */}
        <div className="glass p-6">
          <h3 className="text-white font-bold text-lg mb-4">Category Breakdown (This Month)</h3>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-white/40">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${currency}${v.toFixed(2)}`, '']} contentStyle={{ background: 'rgba(48,43,99,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categories.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/70 text-sm">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.total / totalMonth) * 100}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-white text-sm font-medium w-16 text-right">{currency}{c.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Weekly Line Chart */}
        <div className="glass p-6">
          <h3 className="text-white font-bold text-lg mb-4">Weekly Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-7 gap-1 mt-4">
            {weekly.map((d, i) => (
              <div key={i} className="text-center">
                <div className="h-8 flex items-end justify-center">
                  <div className="w-4 rounded-t" style={{ height: `${weekly.length ? (d.total / Math.max(...weekly.map(w => w.total), 1)) * 32 : 0}px`, background: 'linear-gradient(180deg, #06b6d4, #0891b2)', minHeight: d.total > 0 ? '4px' : '0' }} />
                </div>
                <p className="text-white/40 text-xs mt-1">{d.day}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Categories Horizontal Bar */}
      {topCats.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-white font-bold text-lg mb-4">Top Spending Categories</h3>
          <div className="space-y-4">
            {topCats.map((c, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-28 text-white/70 text-sm text-right truncate">{c.category}</div>
                <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center px-3 transition-all duration-1000" style={{ width: `${(c.total / (topCats[0]?.total || 1)) * 100}%`, background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[(i + 1) % COLORS.length]})`, minWidth: '40px' }}>
                    <span className="text-white text-xs font-bold whitespace-nowrap">{currency}{c.total.toFixed(0)}</span>
                  </div>
                </div>
                <div className="w-12 text-white/40 text-xs text-right">{c.count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
