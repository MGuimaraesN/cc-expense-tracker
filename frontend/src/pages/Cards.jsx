import React, { useEffect, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Notification from '../components/Notification'

export default function Cards() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', limit: '', closeDay: '', dueDay: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })

  const load = async () => {
    const { data } = await api.get('/cards')
    setItems(data)
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      limit: Number(form.limit),
      closeDay: Number(form.closeDay),
      dueDay: Number(form.dueDay),
    }
    if (editing) {
      await api.put(`/cards/${editing.id}`, payload)
    } else {
      await api.post('/cards', payload)
    }
    setForm({ name: '', limit: '', closeDay: '', dueDay: '' })
    setEditing(null)
    await load()
    setLoading(false)
  }

  const edit = (it) => {
    setEditing(it)
    setForm({ name: it.name, limit: it.limit, closeDay: it.closeDay, dueDay: it.dueDay })
  }

  const del = async (id) => {
    try {
      await api.delete(`/cards/${id}`)
      setNotification({ message: 'Cartão excluído com sucesso!', type: 'success' })
      await load()
    } catch (error) {
      setNotification({ message: 'Erro ao excluir cartão.', type: 'error' })
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
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <Card title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input placeholder="Nome do Cartão" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limite</label>
            <input placeholder="Limite" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" value={form.limit} onChange={e=>setForm({...form, limit:Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Fechamento</label>
            <input placeholder="Dia do Fechamento" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" value={form.closeDay} onChange={e=>setForm({...form, closeDay:Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Vencimento</label>
            <input placeholder="Dia do Vencimento" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" value={form.dueDay} onChange={e=>setForm({...form, dueDay:Number(e.target.value)})} />
          </div>
          <div className="md:col-span-4">
            <Button disabled={loading}>{loading ? 'Salvando...' : (editing ? 'Atualizar' : 'Adicionar')}</Button>
            {editing && <Button className="ml-2 bg-slate-600 hover:bg-slate-700" onClick={()=>{ setEditing(null); setForm({ name:'', limit:'', closeDay:'', dueDay:'' }) }} type="button">Cancelar</Button>}
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
              {items.map(it => (
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
                    <Button className="bg-red-600 hover:bg-red-700 ml-2" onClick={()=>del(it.id)}>Excluir</Button>
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
