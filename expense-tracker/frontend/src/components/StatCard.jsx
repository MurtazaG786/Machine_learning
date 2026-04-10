export default function StatCard({ icon, title, value, subtitle, trend, color = 'purple', className = '' }) {
  const colors = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
  }
  const iconColors = { purple: 'from-purple-500 to-purple-600', cyan: 'from-cyan-500 to-cyan-600', green: 'from-green-400 to-green-500', red: 'from-red-500 to-red-600', yellow: 'from-yellow-400 to-yellow-500' }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-md border rounded-2xl p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColors[color]} flex items-center justify-center text-xl`}>{icon}</div>
        {trend !== undefined && <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <p className="text-white/60 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
