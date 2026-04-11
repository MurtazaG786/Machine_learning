import { format } from 'date-fns'

const categoryIcons = { Food: '🍕', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬', Health: '💊', Bills: '📱', Education: '📚', Travel: '✈️', Other: '💸' }
const categoryColors = { Food: 'from-orange-500/20 to-red-500/10 border-orange-500/20', Transport: 'from-blue-500/20 to-blue-600/10 border-blue-500/20', Shopping: 'from-pink-500/20 to-pink-600/10 border-pink-500/20', Entertainment: 'from-purple-500/20 to-purple-600/10 border-purple-500/20', Health: 'from-green-500/20 to-green-600/10 border-green-500/20', Bills: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20', Education: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20', Travel: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20', Other: 'from-gray-500/20 to-gray-600/10 border-gray-500/20' }

export default function ExpenseCard({ expense, currency = '$', onDelete }) {
  return (
    <div className={`bg-gradient-to-r ${categoryColors[expense.category] || categoryColors.Other} backdrop-blur-sm border rounded-xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform`}>
      <div className="text-2xl w-10 text-center">{categoryIcons[expense.category] || '💸'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/40 text-xs">{expense.category}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40 text-xs">{format(new Date(expense.date), 'MMM d, yyyy')}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40 text-xs">{expense.paymentMethod}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-bold">{currency}{expense.amount.toFixed(2)}</p>
        {onDelete && <button onClick={() => onDelete(expense._id)} className="text-white/30 hover:text-red-400 text-xs mt-1 transition-colors">Delete</button>}
      </div>
    </div>
  )
}
