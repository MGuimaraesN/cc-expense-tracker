import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { fmtCurrency } from '../utils/format'

const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth()+1)
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/summary', { params: { month, year } })
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month, year])

  const budgetExceeded = (summary?.budgetStatus || []).filter(b => b.exceeded)

  const handleExport = async (format) => {
    const url = `/reports/monthly?month=${month}&year=${year}&format=${format}`;
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `relatorio_${year}_${month}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={month} onChange={e=>setMonth(parseInt(e.target.value))} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1">
          {Array.from({length:12}).map((_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')} - {monthNames[i]}</option>)}
        </select>
        <input type="number" value={year} onChange={e=>setYear(parseInt(e.target.value)||year)} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 w-24" />
        <Button onClick={load}>Atualizar</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total do mês">
          <div className="text-3xl">{fmtCurrency(summary?.total || 0)}</div>
        </Card>
        <Card title="Orçamentos estourados">
          <div className="text-xl">{budgetExceeded.length}</div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-300">
            {budgetExceeded.map(b => <li key={b.categoryId}>{b.categoryName}: gasto {fmtCurrency(b.spent)} / orçamento {fmtCurrency(b.budget)}</li>)}
          </ul>
        </Card>
        <Card title="Ações">
          <div className="flex gap-2">
            <Button onClick={() => handleExport('csv')}>Exportar CSV</Button>
            <Button onClick={() => handleExport('pdf')}>Exportar PDF</Button>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Gastos por Categoria">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="amount" data={summary?.byCategory || []} cx="50%" cy="50%" outerRadius={100} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Gastos por Cartão">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.byCard || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Valor" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
