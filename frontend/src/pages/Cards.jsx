import React, { useEffect, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'

export default function Cards() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', limit: 0, closeDay: 1, dueDay: 10 })
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data } = await api.get('/cards')
    setItems(data)
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/cards/${editing.id}`, form)
    } else {
      await api.post('/cards', form)
    }
    setForm({ name: '', limit: 0, closeDay: 1, dueDay: 10 })
    setEditing(null)
    await load()
  }

  const edit = (it) => {
    setEditing(it)
    setForm({ name: it.name, limit: it.limit, closeDay: it.closeDay, dueDay: it.dueDay })
  }

  const del = async (id) => {
    if (confirm('Excluir cartão?')) {
      await api.delete(`/cards/${id}`)
      await load()
    }
  }

  return (
    <div className="space-y-4">
      <Card title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
        <form onSubmit={submit} className="grid grid-cols-2 gap-2">
          <input placeholder="Nome" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input placeholder="Limite" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.limit} onChange={e=>setForm({...form, limit:Number(e.target.value)})} />
          <input placeholder="Fechamento" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.closeDay} onChange={e=>setForm({...form, closeDay:Number(e.target.value)})} />
          <input placeholder="Vencimento" type="number" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" value={form.dueDay} onChange={e=>setForm({...form, dueDay:Number(e.target.value)})} />
          <div className="col-span-2">
            <Button>{editing ? 'Atualizar' : 'Adicionar'}</Button>
            {editing && <Button className="ml-2 bg-slate-600 hover:bg-slate-700" onClick={()=>{ setEditing(null); setForm({ name:'', limit:0, closeDay:1, dueDay:10 }) }} type="button">Cancelar</Button>}
          </div>
        </form>
      </Card>

      <Card title="Meus Cartões">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr><th className="text-left">Nome</th><th>Limite</th><th>Fech.</th><th>Venc.</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t border-white/10">
                <td>{it.name}</td>
                <td className="text-center">{it.limit}</td>
                <td className="text-center">{it.closeDay}</td>
                <td className="text-center">{it.dueDay}</td>
                <td className="text-right">
                  <Button className="bg-slate-600 hover:bg-slate-700 mr-2" onClick={()=>edit(it)}>Editar</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(it.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
