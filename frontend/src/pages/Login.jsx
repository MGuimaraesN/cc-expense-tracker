import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import { useNotification } from '../context/NotificationContext'

export default function Login() {
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'user@example.com',
      password: 'secret123'
    }
  })
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const nav = useNavigate()
  const loc = useLocation()
  const { addNotification } = useNotification()

  useEffect(() => {
    const message = sessionStorage.getItem('loginMessage')
    if (message) {
      addNotification(message, 'info')
      sessionStorage.removeItem('loginMessage')
    }
  }, [addNotification])

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    const res = await login(data.email, data.password)
    if (res.ok) {
      const to = loc.state?.from?.pathname || '/app'
      nav(to, { replace: true })
    } else {
      setServerError(res.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-white/10 rounded p-6 w-[95%] max-w-md">
        <h1 className="text-white text-xl font-semibold mb-4">Entrar</h1>
        {serverError && <div className="text-red-400 mb-2 text-sm">{serverError}</div>}

        <label className="block text-white/70 text-sm mb-1">Email</label>
        <Input
          {...register('email', { required: 'Email é obrigatório' })}
          className="w-full mb-1"
        />
        {errors.email && <p className="text-red-400 text-sm mb-2">{errors.email.message}</p>}

        <label className="block text-white/70 text-sm mb-1 mt-2">Senha</label>
        <Input
          type="password"
          {...register('password', { required: 'Senha é obrigatória' })}
          className="w-full mb-1"
        />
        {errors.password && <p className="text-red-400 text-sm mb-2">{errors.password.message}</p>}

        <Button isLoading={loading} className="w-full mt-4">Entrar</Button>
        <div className="text-white/60 text-sm mt-3">
          Não tem conta? <Link to="/register" className="text-blue-400">Criar conta</Link>
        </div>
      </form>
    </div>
  )
}
