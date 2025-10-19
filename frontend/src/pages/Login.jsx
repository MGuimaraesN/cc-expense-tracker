import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('secret123')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const loc = useLocation()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.ok) {
      const to = loc.state?.from?.pathname || '/app'
      nav(to, { replace: true })
    } else {
      setError(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-slate-900 border border-white/10 rounded p-6 w-[95%] max-w-md">
        <h1 className="text-white text-xl font-semibold mb-4">Entrar</h1>
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <label className="block text-white/70 text-sm mb-1">Email</label>
        <input className="w-full mb-3 px-3 py-2 rounded bg-white/5 border border-white/10 text-white" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block text-white/70 text-sm mb-1">Senha</label>
        <input type="password" className="w-full mb-4 px-3 py-2 rounded bg-white/5 border border-white/10 text-white" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button disabled={loading} className="w-full">{loading ? 'Entrando...' : 'Entrar'}</Button>
        <div className="text-white/60 text-sm mt-3">
          Não tem conta? <Link to="/register" className="text-blue-400">Criar conta</Link>
        </div>
      </form>
    </div>
  )
}
