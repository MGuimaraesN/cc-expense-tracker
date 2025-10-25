import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Register() {
  const { register: authRegister } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const nav = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    const res = await authRegister(data.name, data.email, data.password)
    if (res.ok) {
      nav('/app')
    } else {
      setServerError(res.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-white/10 rounded p-6 w-[95%] max-w-md">
        <h1 className="text-white text-xl font-semibold mb-4">Criar conta</h1>
        {serverError && <div className="text-red-400 mb-2 text-sm">{serverError}</div>}

        <label className="block text-white/70 text-sm mb-1">Nome</label>
        <Input
          {...register('name', { required: 'Nome é obrigatório' })}
          className="w-full mb-1"
        />
        {errors.name && <p className="text-red-400 text-sm mb-2">{errors.name.message}</p>}

        <label className="block text-white/70 text-sm mb-1 mt-2">Email</label>
        <Input
          {...register('email', { required: 'Email é obrigatório' })}
          className="w-full mb-1"
        />
        {errors.email && <p className="text-red-400 text-sm mb-2">{errors.email.message}</p>}

        <label className="block text-white/70 text-sm mb-1 mt-2">Senha</label>
        <Input
          type="password"
          {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' } })}
          className="w-full mb-1"
        />
        {errors.password && <p className="text-red-400 text-sm mb-2">{errors.password.message}</p>}

        <Button isLoading={loading} className="w-full mt-4">Criar conta</Button>
        <div className="text-white/60 text-sm mt-3">
          Já tem conta? <Link to="/login" className="text-blue-400">Entrar</Link>
        </div>
      </form>
    </div>
  )
}
