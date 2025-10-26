import React from 'react';
import Card from '../Card';
import { FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-500">
    <FaExclamationTriangle size={32} />
    <p className="mt-2 text-center">{message || 'Ocorreu um erro ao buscar os dados.'}</p>
  </div>
);

const ChartWrapper = ({ title, loading, data, error, children, icon }) => (
  <Card className="flex flex-col">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 ml-2">{title}</h3>
    </div>
    <div className="flex-grow flex items-center justify-center">
      {loading ? <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div> :
        error ? <ErrorDisplay /> :
          data && data.length > 0 ? children :
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FaChartBar className="mx-auto text-4xl mb-2" />
              <p>Sem dados para o período selecionado.</p>
            </div>}
    </div>
  </Card>
);

export default ChartWrapper;
