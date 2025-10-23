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
        <form onSubmit={submit} className="grid grid-cols-2 gap-2">
          <input placeholder="Nome" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input placeholder="Limite" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.limit} onChange={e=>setForm({...form, limit:Number(e.target.value)})} />
          <input placeholder="Fechamento" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.closeDay} onChange={e=>setForm({...form, closeDay:Number(e.target.value)})} />
          <input placeholder="Vencimento" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.dueDay} onChange={e=>setForm({...form, dueDay:Number(e.target.value)})} />
          <div className="col-span-2">
            <Button disabled={loading}>{loading ? 'Salvando...' : (editing ? 'Atualizar' : 'Adicionar')}</Button>
            {editing && <Button className="ml-2 bg-slate-600 hover:bg-slate-700" onClick={()=>{ setEditing(null); setForm({ name:'', limit:'', closeDay:'', dueDay:'' }) }} type="button">Cancelar</Button>}
          </div>
        </form>
      </Card>

      <Card title="Meus Cartões">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr><th className="text-left">Ícone</th><th className="text-left">Nome</th><th>Limite</th><th>Fech.</th><th>Venc.</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t border-white/10">
                <td>
                  {it.iconUrl ? (
                    <img src={`${import.meta.env.VITE_API_URL}${it.iconUrl}`} alt={it.name} className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded-full" />
                  )}
                </td>
                <td>{it.name}</td>
                <td className="text-center">{it.limit}</td>
                <td className="text-center">{it.closeDay}</td>
                <td className="text-center">{it.dueDay}</td>
                <td className="text-right">
                  <label className="cursor-pointer">
                    <span className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs">Ícone</span>
                    <input type="file" className="hidden" onChange={(e) => handleIconUpload(it.id, e.target.files[0])} />
                  </label>
                  <Button className="bg-slate-600 hover:bg-slate-700 ml-2" onClick={()=>edit(it)}>Editar</Button>
                  <Button className="bg-red-600 hover:bg-red-700 ml-2" onClick={()=>del(it.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
