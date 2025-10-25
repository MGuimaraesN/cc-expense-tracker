import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { format } from 'date-fns';
import client from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fmtCurrency } from '../utils/format';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, ArcElement, BarElement);

export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());

  const { theme } = useTheme();

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['summary', startDate, endDate],
    queryFn: () => client.get('/summary', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    }).then(res => res.data),
  });

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', startDate, endDate],
    queryFn: () => client.get('/summary/trends', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
    }).then(res => res.data),
  });

  const lineChartData = {
    labels: trendsData?.labels || [],
    datasets: [
      {
        label: 'Gastos por Dia',
        data: trendsData?.data || [],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: { color: theme === 'dark' ? 'white' : 'black' },
      },
      x: {
        ticks: { color: theme === 'dark' ? 'white' : 'black' },
      }
    }
  };

  const pieChartData = {
    labels: summaryData?.byCategory?.map(c => c.name) || [],
    datasets: [{
      data: summaryData?.byCategory?.map(c => c.amount) || [],
      backgroundColor: COLORS,
    }],
  };

  const barChartData = {
    labels: summaryData?.byCard?.map(c => c.name) || [],
    datasets: [{
      label: 'Gasto',
      data: summaryData?.byCard?.map(c => c.amount) || [],
      backgroundColor: COLORS[1],
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? 'white' : 'black',
        }
      }
    }
  };

  const handleExport = async (format) => {
    const url = `/reports/monthly?month=${startDate.getMonth() + 1}&year=${startDate.getFullYear()}&format=${format}`;
    try {
      const response = await client.get(url, { responseType: 'blob' });
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Início</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Fim</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total do mês">
          {summaryLoading ? <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-3/4 animate-pulse"></div> : <div className="text-3xl">{fmtCurrency(summaryData?.totalExpenses || 0)}</div>}
        </Card>
        {/* Card Progresso dos Orçamentos */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Progresso dos Orçamentos</h3>
          {summaryLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {summaryData?.budgetStatus?.length > 0 ? (
                summaryData.budgetStatus.map(budget => {
                  const percentage = Math.min(budget.percentage, 100); // Trava em 100%
                  const isExceeded = budget.percentage > 100;
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.name}</span>
                        <span className={`text-sm font-medium ${isExceeded ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                          {fmtCurrency(budget.spent)} / {fmtCurrency(budget.limit)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className={`h-2.5 rounded-full ${isExceeded ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${isExceeded ? 100 : percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhum orçamento definido.</p>
              )}
            </div>
          )}
        </Card>
        <Card title="Ações">
          <div className="flex gap-2">
            <Button onClick={() => handleExport('csv')}>Exportar CSV</Button>
            <Button onClick={() => handleExport('pdf')}>Exportar PDF</Button>
          </div>
        </Card>
      </div>

      {/* Grid de Dados (Gráficos e Transações) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Coluna da Esquerda: Gráfico de Linha e Últimas Transações */}
        <div className="flex flex-col gap-6">
          {/* Card Gráfico de Linha (NOVO) */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Evolução dos Gastos</h3>
            {trendsLoading ? (
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <Line options={lineOptions} data={lineChartData} />
            )}
          </Card>

          {/* Card Últimas Transações (NOVO) */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Últimas Transações</h3>
            {summaryLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {summaryData?.recentTransactions?.length > 0 ? (
                  summaryData.recentTransactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center pr-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.category?.name || 'Sem Categoria'} - {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-500">
                        -{fmtCurrency(tx.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma transação no período.</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Coluna da Direita: Gráficos de Pizza e Barras */}
        <div className="flex flex-col gap-6">
          {/* Card Gráfico de Pizza */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Gastos por Categoria</h3>
            <div className="h-72 flex items-center justify-center">
              {summaryLoading ? <div className="text-gray-500">Carregando...</div> :
                summaryData?.byCategory?.length > 0 ?
                  <Pie data={pieChartData} options={chartOptions} />
                  : <p className="text-gray-500 dark:text-gray-400">Sem dados para este período</p>}
            </div>
          </Card>

          {/* Card Gráfico de Barras */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Gastos por Cartão</h3>
            <div className="h-72 flex items-center justify-center">
              {summaryLoading ? <div className="text-gray-500">Carregando...</div> :
                summaryData?.byCard?.length > 0 ?
                  <Bar data={barChartData} options={{ ...chartOptions, indexAxis: 'y' }} />
                  : <p className="text-gray-500 dark:text-gray-400">Sem dados para este período</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
