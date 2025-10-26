import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { fmtCurrency } from '../utils/format'
import { useNotification } from '../context/NotificationContext'

export default function Budgets() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const { addNotification } = useNotification()
  const now = new Date()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: 0,
      categoryId: ''
    }
  })
  const watchMonth = watch('month')
  const watchYear = watch('year')

  const load = async () => {
    setLoading(true)
    try {
      const [cats, budgets] = await Promise.all([
        api.get('/categories'),
        api.get('/budgets', { params: { month: watchMonth, year: watchYear } })
      ])
      setCategories(cats.data)
      setItems(budgets.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [watchMonth, watchYear])

  const submit = async (data) => {
    setLoading(true)
    try {
      await api.post('/budgets', { ...data, categoryId: Number(data.categoryId), amount: Number(data.amount) })
      reset({ ...data, amount: 0, categoryId: '' })
      await load()
    } finally {
      setLoading(false)
    }
  }

  const del = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/budgets/${id}`)
      addNotification('Orçamento excluído com sucesso!', 'success')
      await load()
    } catch(e) {
      addNotification('Erro ao excluir orçamento.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Novo Orçamento" className="relative z-20">
        <form onSubmit={handleSubmit(submit)} className="grid md:grid-cols-5 gap-2 items-start">
          <div>
            <Select {...register('categoryId', { required: 'Categoria é obrigatória' })}>
              <option value="">Categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            {errors.categoryId && <p className="text-red-400 text-sm mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <Input type="number" placeholder="Valor" {...register('amount', { required: 'Valor é obrigatório', min: 0.01 })} />
            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          <Input type="number" {...register('month', { required: true, min: 1, max: 12 })} />
          <Input type="number" {...register('year', { required: true })} />
          <Button isLoading={loading}>Salvar</Button>
        </form>
      </Card>

      <Card title="Orçamentos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 dark:text-white/60">
              <tr>
                <th className="text-left font-semibold px-4 py-2">Categoria</th>
                <th className="text-center font-semibold px-4 py-2">Mês</th>
                <th className="text-center font-semibold px-4 py-2">Ano</th>
                <th className="text-right font-semibold px-4 py-2">Valor</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({length:3}).map((_, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-white/10 animate-pulse">
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"><div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div></td>
                  <td className="px-4 py-2"></td>
                </tr>
              ))}
              {!loading && items.map(b => (
                <tr key={b.id} className="border-t border-gray-200 dark:border-white/10">
                  <td className="px-4 py-2">{b.categoryName}</td>
                  <td className="text-center px-4 py-2">{String(b.month).padStart(2,'0')}</td>
                  <td className="text-center px-4 py-2">{b.year}</td>
                  <td className="text-right px-4 py-2">{fmtCurrency(b.amount)}</td>
                  <td className="text-right px-4 py-2">
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={()=>del(b.id)}
                      isLoading={deletingId === b.id}
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
