import React, { useEffect, useState } from 'react'
import api from '../api/client'
import Card from '../components/Card'
import Button from '../components/Button'
import Select from '../components/Select'
import Input from '../components/Input'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { fmtCurrency } from '../utils/format'

const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 p-2 border border-gray-200 dark:border-white/10 rounded shadow-sm">
        <p className="label">{`${payload[0].name} : ${fmtCurrency(payload[0].value)}`}</p>
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
        <div className="w-48">
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>{`${String(index + 1).padStart(2, '0')} - ${name}`}</option>
            ))}
          </Select>
        </div>
        <div className="w-24">
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <Button onClick={load} isLoading={loading}>Atualizar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total do mês">
          {loading ? <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-3/4 animate-pulse"></div> : <div className="text-3xl">{fmtCurrency(summary?.total || 0)}</div>}
        </Card>
        <Card title="Orçamentos estourados">
          {loading ? <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/4 animate-pulse"></div> : <div className="text-xl">{budgetExceeded.length}</div>}
          <ul className="mt-2 list-disc list-inside text-sm text-red-500 dark:text-red-300">
            {loading ? <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse mt-1"></div> : budgetExceeded.map(b => <li key={b.categoryId}>{b.categoryName}: gasto {fmtCurrency(b.spent)} / orçamento {fmtCurrency(b.budget)}</li>)}
          </ul>
        </Card>
        <Card title="Ações">
          <div className="flex gap-2">
            <Button onClick={() => handleExport('csv')}>Exportar CSV</Button>
            <Button onClick={() => handleExport('pdf')}>Exportar PDF</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Gastos por Categoria">
          <div className="h-72 flex items-center justify-center">
            {loading ? <div className="text-gray-500">Carregando...</div> :
            summary?.byCategory.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="amount" nameKey="name" data={summary?.byCategory || []} cx="50%" cy="50%" outerRadius={100} labelLine={false} label={false}>
                  {
                    (summary?.byCategory || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                  }
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            : <p className="text-gray-500 dark:text-gray-400">Sem dados para este período</p>}
          </div>
        </Card>
        <Card title="Gastos por Cartão">
          <div className="h-72 flex items-center justify-center">
            {loading ? <div className="text-gray-500">Carregando...</div> :
            summary?.byCard.length > 0 ?
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.byCard || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Valor" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
            : <p className="text-gray-500 dark:text-gray-400">Sem dados para este período</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
