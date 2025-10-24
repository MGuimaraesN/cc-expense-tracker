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

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 text-gray-600 dark:text-white/80">
      <NavLink to="/app" end className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Dashboard</NavLink>
      <NavLink to="/app/transactions" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Transações</NavLink>
      <NavLink to="/app/cards" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Cartões</NavLink>
      <NavLink to="/app/categories" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Categorias</NavLink>
      <NavLink to="/app/budgets" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Orçamentos</NavLink>
      <NavLink to="/app/recurring-transactions" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Transações Recorrentes</NavLink>
      <NavLink to="/app/settings" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Configurações</NavLink>
      {user.role === 'ADMIN' && (
        <NavLink to="/app/admin" className={({isActive}) => `px-2 py-2 rounded ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600'}`} onClick={() => setSidebarOpen(false)}>Admin</NavLink>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-gray-200 dark:border-white/10 fixed top-0 left-0 right-0 h-14 bg-gray-100 dark:bg-slate-950 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-500 dark:text-white/80">
              ☰
            </button>
            <Link to="/app" className="font-semibold">💳 Controle de Gastos</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-gray-500 dark:text-white/80 hover:text-gray-700 dark:hover:text-white">{dark ? '🌙' : '☀️'}</button>
            {user && <span className="text-gray-600 dark:text-white/70 hidden sm:inline">{user.name}</span>}
            <Button onClick={() => { logout(); nav('/login'); }} className="bg-red-600 hover:bg-red-700">Sair</Button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 flex pt-14">
        {/* Mobile sidebar */}
        <aside className={`fixed top-14 left-0 h-full w-56 bg-white dark:bg-slate-900 z-10 p-4 border-r border-gray-200 dark:border-white/10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:hidden`}>
          <NavLinks />
        </aside>
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-0 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Desktop sidebar */}
        <aside className="w-56 shrink-0 py-4 pr-4 border-r border-gray-200 dark:border-white/10 hidden md:block">
          <NavLinks />
        </aside>
        <main className="flex-1 py-4 pl-4">
          {children}
        </main>
      </div>
    </div>
  );
}
