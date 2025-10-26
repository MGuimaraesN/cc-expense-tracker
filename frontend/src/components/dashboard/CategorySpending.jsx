import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategorySpending = ({ byCategory, loading }) => {
  const data = {
    labels: byCategory?.map(c => c.name) || [],
    datasets: [
      {
        label: 'Gasto',
        data: byCategory?.map(c => c.amount) || [],
        backgroundColor: '#6D28D9',
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, grid: { display: false } },
      x: { ticks: { color: '#A0AEC0' }, grid: { display: false } },
    },
  };

  if (loading) return <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>;

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold text-text-secondary mb-2">Gastos por Categoria</h4>
      <div className="relative h-36">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CategorySpending;
