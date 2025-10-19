import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Cards from './pages/Cards'
import Categories from './pages/Categories'
import Budgets from './pages/Budgets'
import RecurringTransactions from './pages/RecurringTransactions'

function RequireAuth({ children }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/app/transactions" element={<RequireAuth><Layout><Transactions /></Layout></RequireAuth>} />
      <Route path="/app/cards" element={<RequireAuth><Layout><Cards /></Layout></RequireAuth>} />
      <Route path="/app/categories" element={<RequireAuth><Layout><Categories /></Layout></RequireAuth>} />
      <Route path="/app/budgets" element={<RequireAuth><Layout><Budgets /></Layout></RequireAuth>} />
      <Route path="/app/recurring-transactions" element={<RequireAuth><Layout><RecurringTransactions /></Layout></RequireAuth>} />
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
