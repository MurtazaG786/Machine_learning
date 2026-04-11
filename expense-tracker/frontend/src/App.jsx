import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Groups from './pages/Groups'
import Analytics from './pages/Analytics'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="add-expense" element={<AddExpense />} />
      <Route path="groups" element={<Groups />} />
      <Route path="analytics" element={<Analytics />} />
    </Route>
  </Routes>
)

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#302b63', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}
