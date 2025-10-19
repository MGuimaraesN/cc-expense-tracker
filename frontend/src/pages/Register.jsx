import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'

export default function Register() {
  const { register, loading } = useAuth()
  const [name, setName] = useState('Novo Usuário')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await register(name, email, password)
    if (res.ok) nav('/app')
    else setError(res.message)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-slate-900 border border-white/10 rounded p-6 w-[95%] max-w-md">
        <h1 className="text-white text-xl font-semibold mb-4">Criar conta</h1>
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <label className="block text-white/70 text-sm mb-1">Nome</label>
        <input className="w-full mb-3 px-3 py-2 rounded bg-white/5 border border-white/10 text-white" value={name} onChange={e=>setName(e.target.value)} />
        <label className="block text-white/70 text-sm mb-1">Email</label>
        <input className="w-full mb-3 px-3 py-2 rounded bg-white/5 border border-white/10 text-white" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block text-white/70 text-sm mb-1">Senha</label>
        <input type="password" className="w-full mb-4 px-3 py-2 rounded bg-white/5 border border-white/10 text-white" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button disabled={loading} className="w-full">{loading ? 'Criando...' : 'Criar conta'}</Button>
        <div className="text-white/60 text-sm mt-3">
          Já tem conta? <Link to="/login" className="text-blue-400">Entrar</Link>
        </div>
      </form>
    </div>
  )
}
