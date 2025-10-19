import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { fmtCurrency, fmtDate } from '../utils/format'

export default function Transactions() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [count, setCount] = useState(0)
  const [cards, setCards] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', cardId: '', categoryId: '' })
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), amount: 0, description: '', cardId:'', categoryId:'', installments:1, installmentIndex:1 })

  const load = async () => {
    const params = { page, pageSize, ...filters }
    const { data } = await api.get('/transactions', { params })
    setItems(data.items)
    setCount(data.total)
    setTotal(data.items.reduce((s,t)=> s + t.amount, 0))
  }
  const loadMeta = async () => {
    const [cs, cats] = await Promise.all([api.get('/cards'), api.get('/categories')])
    setCards(cs.data); setCategories(cats.data)
  }
  useEffect(() => { loadMeta() }, [])
  useEffect(() => { load() }, [page, pageSize, filters])

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (payload.cardId === '') delete payload.cardId
    else payload.cardId = Number(payload.cardId)
    if (payload.categoryId === '') delete payload.categoryId
    else payload.categoryId = Number(payload.categoryId)
    payload.amount = Number(payload.amount)
    await api.post('/transactions', payload)
    setForm({ ...form, amount: 0, description:'' })
    await load()
  }

  const del = async (id) => {
    if (confirm('Excluir transação?')) {
      await api.delete(`/transactions/${id}`)
      await load()
    }
  }

  const importCsv = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/transactions/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    e.target.value = ''
    await load()
  }

  const exportCsv = () => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/reports/monthly`)
    const d = new Date(form.date)
    url.searchParams.set('month', d.getMonth()+1)
    url.searchParams.set('year', d.getFullYear())
    url.searchParams.set('format', 'csv')
    window.open(url.toString(), '_blank')
  }

  const exportPdf = () => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/reports/monthly`)
    const d = new Date(form.date)
    url.searchParams.set('month', d.getMonth()+1)
    url.searchParams.set('year', d.getFullYear())
    url.searchParams.set('format', 'pdf')
    window.open(url.toString(), '_blank')
  }

  return (
    <div className="space-y-4">
      <Card title="Nova Transação">
        <form onSubmit={submit} className="grid md:grid-cols-7 gap-2">
          <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input placeholder="Descrição" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <select value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.cardId} onChange={e=>setForm({...form, cardId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Cartão</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="1" value={form.installments} onChange={e=>setForm({...form, installments:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" title="Parcelas" />
          <input type="number" min="1" value={form.installmentIndex} onChange={e=>setForm({...form, installmentIndex:Number(e.target.value)})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" title="Parcela atual" />
          <div className="md:col-span-7">
            <Button>Adicionar</Button>
            <label className="ml-3 cursor-pointer">
              <span className="px-3 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm">Importar CSV</span>
              <input type="file" className="hidden" accept=".csv" onChange={importCsv} />
            </label>
            <Button className="ml-2 bg-slate-600 hover:bg-slate-700" type="button" onClick={exportCsv}>Exportar CSV</Button>
            <Button className="ml-2 bg-slate-600 hover:bg-slate-700" type="button" onClick={exportPdf}>Exportar PDF</Button>
          </div>
        </form>
      </Card>

      <Card title="Filtros">
        <div className="grid md:grid-cols-6 gap-2">
          <input type="date" value={filters.startDate} onChange={e=>setFilters({...filters, startDate:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <input type="date" value={filters.endDate} onChange={e=>setFilters({...filters, endDate:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1" />
          <select value={filters.categoryId} onChange={e=>setFilters({...filters, categoryId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.cardId} onChange={e=>setFilters({...filters, cardId:e.target.value})} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            <option value="">Cartão</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/página</option>)}
          </select>
          <div className="text-right text-white/70 self-center">Total na página: {fmtCurrency(total)}</div>
        </div>
      </Card>

      <Card title="Transações">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Cartão</th><th className="text-right">Valor</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id} className="border-t border-white/10">
                <td>{fmtDate(t.date)}</td>
                <td>{t.description}</td>
                <td>{t.categoryName || '-'}</td>
                <td>{t.cardName || '-'}</td>
                <td className="text-right">{fmtCurrency(t.amount)}</td>
                <td className="text-right">
                  <Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(t.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-3 text-white/70">
          <div>Mostrando {items.length} de {count}</div>
          <div className="flex gap-2">
            <Button className="bg-slate-600 hover:bg-slate-700" onClick={()=>setPage(p=>Math.max(1, p-1))}>Anterior</Button>
            <div>Página {page}</div>
            <Button className="bg-slate-600 hover:bg-slate-700" onClick={()=>setPage(p=>p+1)}>Próxima</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
