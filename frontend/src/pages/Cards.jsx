import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { useNotification } from '../context/NotificationContext'

export default function Cards() {
  const [items, setItems] = useState([])
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const { addNotification } = useNotification()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cards')
      setItems(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const submit = async (data) => {
    setLoading(true)
    const payload = {
      ...data,
      limit: Number(data.limit),
      closeDay: Number(data.closeDay),
      dueDay: Number(data.dueDay),
    }
    try {
      if (editing) {
        await api.put(`/cards/${editing.id}`, payload)
      } else {
        await api.post('/cards', payload)
      }
      reset({ name: '', limit: '', closeDay: '', dueDay: '' })
      setEditing(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const edit = (it) => {
    setEditing(it)
    setValue('name', it.name)
    setValue('limit', it.limit)
    setValue('closeDay', it.closeDay)
    setValue('dueDay', it.dueDay)
  }

  const del = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/cards/${id}`)
      addNotification('Cartão excluído com sucesso!', 'success')
      await load()
    } catch (error) {
      addNotification('Erro ao excluir cartão.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleIconUpload = async (id, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('icon', file);

    try {
      await api.post(`/cards/${id}/upload-icon`, formData);
      await load();
    } catch (error) {
      console.error('Error uploading icon:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <Input placeholder="Nome do Cartão" {...register('name', { required: 'Nome é obrigatório' })} />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limite</label>
            <Input placeholder="Limite" type="number" {...register('limit', { required: 'Limite é obrigatório' })} />
            {errors.limit && <p className="text-red-400 text-sm mt-1">{errors.limit.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Fechamento</label>
            <Input placeholder="Dia do Fechamento" type="number" {...register('closeDay', { required: 'Dia de fechamento é obrigatório' })} />
            {errors.closeDay && <p className="text-red-400 text-sm mt-1">{errors.closeDay.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Vencimento</label>
            <Input placeholder="Dia do Vencimento" type="number" {...register('dueDay', { required: 'Dia de vencimento é obrigatório' })} />
            {errors.dueDay && <p className="text-red-400 text-sm mt-1">{errors.dueDay.message}</p>}
          </div>
          <div className="md:col-span-4">
            <Button isLoading={loading}>{editing ? 'Atualizar' : 'Adicionar'}</Button>
            {editing && <Button className="ml-2 bg-slate-600 hover:bg-slate-700" onClick={()=>{ setEditing(null); reset({ name:'', limit:'', closeDay:'', dueDay:'' }) }} type="button">Cancelar</Button>}
          </div>
        </form>
      </Card>

      <Card title="Meus Cartões">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 dark:text-white/60">
              <tr>
                <th className="text-left font-semibold px-4 py-2">Ícone</th>
                <th className="text-left font-semibold px-4 py-2">Nome</th>
                <th className="text-center font-semibold px-4 py-2">Limite</th>
                <th className="text-center font-semibold px-4 py-2">Fech.</th>
                <th className="text-center font-semibold px-4 py-2">Venc.</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({length:3}).map((_, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-white/10 animate-pulse">
                  <td className="px-4 py-2"><div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"></td>
                </tr>
              ))}
              {!loading && items.map(it => (
                <tr key={it.id} className="border-t border-gray-200 dark:border-white/10">
                  <td className="px-4 py-2">
                    {it.iconUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL}${it.iconUrl}`} alt={it.name} className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full" />
                    )}
                  </td>
                  <td className="px-4 py-2">{it.name}</td>
                  <td className="text-center px-4 py-2">{it.limit}</td>
                  <td className="text-center px-4 py-2">{it.closeDay}</td>
                  <td className="text-center px-4 py-2">{it.dueDay}</td>
                  <td className="text-right px-4 py-2 whitespace-nowrap">
                    <label className="cursor-pointer">
                      <span className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs">Enviar Ícone</span>
                      <input type="file" className="hidden" onChange={(e) => handleIconUpload(it.id, e.target.files[0])} />
                    </label>
                    <Button className="bg-slate-600 hover:bg-slate-700 ml-2" onClick={()=>edit(it)}>Editar</Button>
                    <Button className="bg-red-600 hover:bg-red-700 ml-2" onClick={()=>del(it.id)} isLoading={deletingId === it.id}>Excluir</Button>
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
