import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import BudgetProgress from './BudgetProgress';
import CategorySpending from './CategorySpending';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TimeFilter = ({ filter, setFilter }) => {
  const filters = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
            filter === f ? 'bg-primary text-white shadow' : 'text-text-secondary hover:bg-gray-200'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

const Statistics = ({ trendsData, summaryData, loading }) => {
  const [filter, setFilter] = React.useState('Last 7 Days');

  const lineChartData = {
    labels: trendsData?.labels || [],
    datasets: [{
      label: 'Gastos',
      data: trendsData?.data || [],
      fill: true,
      backgroundColor: 'rgba(109, 40, 217, 0.1)',
      borderColor: '#6D28D9',
      tension: 0.4,
      pointBackgroundColor: '#6D28D9',
      pointBorderColor: '#fff',
      pointHoverRadius: 7,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: '#A0AEC0' }, grid: { display: false } },
      x: { ticks: { color: '#A0AEC0' }, grid: { display: false } },
    },
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Evolução dos Gastos</h3>
        <TimeFilter filter={filter} setFilter={setFilter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72">
          {loading ? <div className="h-full w-full bg-gray-200 rounded animate-pulse"></div> : (
            <Line data={lineChartData} options={chartOptions} />
          )}
        </div>
        <div className="space-y-4">
          <BudgetProgress budgets={summaryData?.budgetStatus} loading={loading} />
          <CategorySpending byCategory={summaryData?.byCategory} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
