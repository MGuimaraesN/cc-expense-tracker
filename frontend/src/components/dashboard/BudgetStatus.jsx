import React from 'react';
import { fmtCurrency } from '../../utils/format';
import Card from '../Card';

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-500">
    <p>{message || 'Erro ao carregar.'}</p>
  </div>
);

const BudgetStatus = ({ budgets, loading, error }) => (
  <Card>
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-4">Progresso dos Orçamentos</h3>
    {loading ? (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    ) : error ? <ErrorDisplay /> : (
      <div className="space-y-4">
        {budgets?.length > 0 ? (
          budgets.map(budget => {
            const percentage = Math.min(budget.percentage, 100);
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
);

export default BudgetStatus;
