import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useNotification } from '../context/NotificationContext'

export default function Categories() {
  const [items, setItems] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const add = async (data) => {
    setLoading(true)
    try {
      await api.post('/categories', data)
      reset()
      await load()
    } finally {
      setLoading(false)
    }
  }

  const update = async (it) => {
    const newName = prompt('Novo nome', it.name)
    if (!newName) return
    await api.put(`/categories/${it.id}`, { name: newName })
    await load()
  }

  const del = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/categories/${id}`)
      addNotification('Categoria excluída com sucesso!', 'success')
      await load()
    } catch (error) {
      addNotification('Erro ao excluir categoria.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Nova Categoria">
        <form onSubmit={handleSubmit(add)} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="Nome"
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <Button isLoading={loading}>Adicionar</Button>
        </form>
      </Card>

      <Card title="Minhas Categorias">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 dark:text-white/60">
              <tr>
                <th className="text-left font-semibold px-4 py-2">Nome</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({length:3}).map((_, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-white/10 animate-pulse">
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"></td>
                </tr>
              ))}
              {!loading && items.map(it => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="px-4 py-2">{it.name}</td>
                  <td className="text-right px-4 py-2 whitespace-nowrap">
                    <Button className="bg-slate-600 hover:bg-slate-700 mr-2" onClick={()=>update(it)}>Renomear</Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={()=>del(it.id)}
                      isLoading={deletingId === it.id}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
