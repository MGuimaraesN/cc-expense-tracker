import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setDark(saved === 'dark')
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    setDark(!dark)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/app" className="font-semibold">💳 Controle de Gastos</Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-white/80 hover:text-white">{dark ? '🌙' : '☀️'}</button>
            {user && <span className="text-white/70">{user.name}</span>}
            <Button onClick={() => { logout(); nav('/login'); }} className="bg-red-600 hover:bg-red-700">Sair</Button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 flex">
        <aside className="w-56 shrink-0 py-4 pr-4 border-r border-white/10">
          <nav className="flex flex-col gap-1 text-white/80">
            <NavLink to="/app" end className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}>Dashboard</NavLink>
            <NavLink to="/app/transactions" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}>Transações</NavLink>
            <NavLink to="/app/cards" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}>Cartões</NavLink>
            <NavLink to="/app/categories" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}>Categorias</NavLink>
            <NavLink to="/app/budgets" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}>Orçamentos</NavLink>
          </nav>
        </aside>
        <main className="flex-1 py-4 pl-4">
          {children}
        </main>
      </div>
    </div>
  )
}
