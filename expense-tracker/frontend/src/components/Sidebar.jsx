import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdDashboard, MdAddCircle, MdGroup, MdBarChart, MdLogout } from 'react-icons/md'

const navItems = [
  { to: '/', icon: MdDashboard, label: 'Dashboard' },
  { to: '/add-expense', icon: MdAddCircle, label: 'Add Expense' },
  { to: '/groups', icon: MdGroup, label: 'Groups' },
  { to: '/analytics', icon: MdBarChart, label: 'Analytics' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
        style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.05) 100%)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl">💰</div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">ExpenseTracker</h1>
              <p className="text-white/40 text-xs">Smart Money Manager</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-purple-600/40 to-cyan-600/20 text-white border border-purple-500/30' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                <Icon className="text-xl" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-red-400 transition-colors text-sm w-full">
            <MdLogout /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
