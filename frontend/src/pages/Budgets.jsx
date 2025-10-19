import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { fmtCurrency } from '../utils/format'

export default function Budgets() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const now = new Date()
  const [form, setForm] = useState({ categoryId: '', month: now.getMonth()+1, year: now.getFullYear(), amount: 0 })

  const load = async () => {
    const [cats, budgets] = await Promise.all([
      api.get('/categories'),
      api.get('/budgets', { params: { month: form.month, year: form.year } })
    ])
    setCategories(cats.data)
    setItems(budgets.data)
  }
  useEffect(() => { load() }, [form.month, form.year])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/budgets', { ...form, categoryId: Number(form.categoryId), amount: Number(form.amount) })
    setForm({ ...form, amount: 0 })
    await load()
  }

  const del = async (id) => {
    if (confirm('Excluir orçamento?')) {
      await api.delete(`/budgets/${id}`)
      await load()
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Novo Orçamento">
        <form onSubmit={submit} className="grid md:grid-cols-5 gap-2">
          <select value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="Valor" className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="number" value={form.month} onChange={e=>setForm({...form, month:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="number" value={form.year} onChange={e=>setForm({...form, year:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <Button>Salvar</Button>
        </form>
      </Card>

      <Card title="Orçamentos">
        <table className="w-full text-sm">
          <thead className="text-white/60"><tr><th>Categoria</th><th>Mês</th><th>Ano</th><th>Valor</th><th></th></tr></thead>
          <tbody>
          {items.map(b => (
            <tr key={b.id} className="border-t border-white/10">
              <td>{b.categoryName}</td>
              <td className="text-center">{String(b.month).padStart(2,'0')}</td>
              <td className="text-center">{b.year}</td>
              <td className="text-center">{fmtCurrency(b.amount)}</td>
              <td className="text-right"><Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(b.id)}>Excluir</Button></td>
            </tr>
          ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
