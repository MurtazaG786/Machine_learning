import { useLocation } from 'react-router-dom'
import { MdMenu, MdNotifications } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const titles = { '/': 'Dashboard', '/add-expense': 'Add Expense', '/groups': 'Groups', '/analytics': 'Analytics' }

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10" style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-white/70 hover:text-white"><MdMenu className="text-2xl" /></button>
        <h2 className="text-xl font-bold text-white">{titles[pathname] || 'ExpenseTracker'}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <MdNotifications className="text-lg" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold cursor-pointer">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
