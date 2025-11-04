import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { fmtCurrency } from '../utils/format'

const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 p-2 border border-gray-200 dark:border-white/10 rounded shadow-sm">
        <p className="label">{`${label} : ${fmtCurrency(payload[0].value)}`}</p>
      </div>
    );
  }

  return null;
};

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
        <select value={month} onChange={e=>setMonth(parseInt(e.target.value))} className="custom-select">
          {Array.from({length:12}).map((_,i)=> <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')} - {monthNames[i]}</option>)}
        </select>
        <input type="number" value={year} onChange={e=>setYear(parseInt(e.target.value)||year)} className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" />
        <Button onClick={load}>Atualizar</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total do mês">
          <div className="text-3xl">{fmtCurrency(summary?.total || 0)}</div>
        </Card>
        <Card title="Orçamentos estourados">
          <div className="text-xl">{budgetExceeded.length}</div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-500 dark:text-red-300">
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
                <Pie dataKey="amount" data={summary?.byCategory || []} cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {
                    (summary?.byCategory || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                  }
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Gastos por Cartão">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.byCard || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" name="Valor" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
