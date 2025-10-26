import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetProgress = ({ budgets, loading }) => {
  // Por enquanto, vamos pegar o primeiro orçamento como exemplo
  const budget = budgets?.[0];
  const percentage = budget ? Math.min(Math.round((budget.spent / budget.limit) * 100), 100) : 0;

  const data = {
    labels: ['Gasto', 'Restante'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ['#6D28D9', '#E2E8F0'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2,
        circumference: 180, // Metade de um círculo
        rotation: 270,      // Começa na parte inferior
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  if (loading) return <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>;

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm text-center">
      <h4 className="text-sm font-semibold text-text-secondary mb-2">Progresso Orçamentário</h4>
      <div className="relative h-24">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-text-secondary">{budget?.name || 'Nenhum orçamento'}</p>
    </div>
  );
};

export default BudgetProgress;
