import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { startOfMonth, endOfMonth, startOfToday, endOfToday, subDays, startOfWeek, endOfWeek, startOfYesterday, endOfYesterday, min } from 'date-fns';
import client from '../api/client';
import Button from '../components/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Input from '../components/Input';
import { fmtCurrency } from '../utils/format';
import { FaCalendar, FaChartBar, FaChartLine, FaChartPie, FaFileCsv, FaFilePdf, FaMoneyBillWave, FaCalendarAlt, FaClock } from 'react-icons/fa';
import StatCard from '../components/dashboard/StatCard';
import ChartWrapper from '../components/dashboard/ChartWrapper';
import TransactionList from '../components/dashboard/TransactionList';
import BudgetStatus from '../components/dashboard/BudgetStatus';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, ArcElement, BarElement);

export default function Dashboard() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const { theme } = useTheme();

  const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useQuery(
    ['summary', startDate, endDate],
    () => client.get('/summary', { params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } }).then(res => res.data),
    { keepPreviousData: true }
  );

  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useQuery(
    ['trends', startDate, endDate],
    () => client.get('/trends', { params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } }).then(res => res.data),
    { keepPreviousData: true }
  );

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event, chartElement) => {
      const chartArea = event.native.target;
      if (chartElement.length) {
        chartArea.style.cursor = 'pointer';
      } else {
        chartArea.style.cursor = 'default';
      }
    },
    plugins: {
      legend: { position: 'bottom', labels: { color: theme === 'dark' ? '#E2E8F0' : '#475569' } },
      title: { display: false }
    },
    scales: {
      y: { ticks: { color: theme === 'dark' ? '#94A3B8' : '#64748B' } },
      x: { ticks: { color: theme === 'dark' ? '#94A3B8' : '#64748B' } }
    }
  });

  const lineChartData = {
    labels: trendsData?.labels || [],
    datasets: [{
      label: 'Gastos por Dia',
      data: trendsData?.data || [],
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3B82F6',
      tension: 0.3,
      hoverRadius: 8,
    }],
  };

  const pieChartData = {
    labels: summaryData?.byCategory?.map(c => c.name) || [],
    datasets: [{
      data: summaryData?.byCategory?.map(c => c.amount) || [],
      backgroundColor: COLORS,
      hoverBorderColor: theme === 'dark' ? '#FFF' : '#475569',
      hoverBorderWidth: 2,
    }],
  };

  const barChartData = {
    labels: summaryData?.byCard?.map(c => c.name) || [],
    datasets: [{
      label: 'Gasto',
      data: summaryData?.byCard?.map(c => c.amount) || [],
      backgroundColor: COLORS[1],
      hoverBackgroundColor: '#059669'
    }],
  };

  const handleExport = async (format) => {
    const url = `/reports/monthly?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
    try {
      const response = await client.get(url, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = fileURL;
      const startStr = startDate.toLocaleDateString('pt-BR');
      const endStr = endDate.toLocaleDateString('pt-BR');
      link.download = `relatorio_${startStr}_a_${endStr}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Período:</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setStartDate(startOfToday()); setEndDate(endOfToday()); }}><FaClock className="mr-2" /> Hoje</Button>
              <Button size="sm" variant="outline" onClick={() => { setStartDate(startOfYesterday()); setEndDate(endOfYesterday()); }}><FaCalendarAlt className="mr-2" /> Ontem</Button>
              <Button size="sm" variant="outline" onClick={() => { setStartDate(subDays(new Date(), 6)); setEndDate(endOfToday()); }}><FaCalendarAlt className="mr-2" /> Últimos 7 Dias</Button>
              <Button size="sm" variant="outline" onClick={() => { setStartDate(startOfMonth(new Date())); setEndDate(endOfMonth(new Date())); }}><FaCalendarAlt className="mr-2" /> Este Mês</Button>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Data Inicial</label>
              <FaCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 mt-2.5 pointer-events-none" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                customInput={<Input className="pl-10 pr-4 py-2" />}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Data Final</label>
              <FaCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 mt-2.5 pointer-events-none" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                customInput={<Input className="pl-10 pr-4 py-2" />}
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')}><FaFileCsv className="mr-2" /> Exportar CSV</Button>
          <Button onClick={() => handleExport('pdf')}><FaFilePdf className="mr-2" /> Exportar PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Total de Despesas" value={fmtCurrency(summaryData?.totalExpenses || 0)} loading={summaryLoading} error={summaryError} icon={<FaMoneyBillWave className="text-green-500" size={24} />} />
            <StatCard title="Total de Receitas" value={fmtCurrency(summaryData?.totalIncomes || 0)} loading={summaryLoading} error={summaryError} icon={<FaMoneyBillWave className="text-blue-500" size={24} />} />
          </div>
          <ChartWrapper title="Evolução dos Gastos" loading={trendsLoading} data={trendsData?.data} error={trendsError} icon={<FaChartLine className="text-blue-500" size={24} />}>
            <div className="h-80">
              <Line options={chartOptions('Evolução dos Gastos')} data={lineChartData} />
            </div>
          </ChartWrapper>
          <TransactionList transactions={summaryData?.recentTransactions} loading={summaryLoading} error={summaryError} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <BudgetStatus budgets={summaryData?.budgetStatus} loading={summaryLoading} error={summaryError} />
          <ChartWrapper title="Gastos por Categoria" loading={summaryLoading} data={summaryData?.byCategory} error={summaryError} icon={<FaChartPie className="text-yellow-500" size={24} />}>
            <div className="h-80">
              <Pie options={chartOptions('Gastos por Categoria')} data={pieChartData} />
            </div>
          </ChartWrapper>
          <ChartWrapper title="Gastos por Cartão" loading={summaryLoading} data={summaryData?.byCard} error={summaryError} icon={<FaChartBar className="text-teal-500" size={24} />}>
            <div className="h-80">
              <Bar options={{ ...chartOptions('Gastos por Cartão'), indexAxis: 'y' }} data={barChartData} />
            </div>
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
