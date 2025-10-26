import React from 'react';
import Card from '../Card';
import { FaMoneyBillWave } from 'react-icons/fa';

const StatCard = ({ title, value, loading, error, icon }) => (
  <Card>
    <div className="flex items-center">
      {icon}
      <h4 className="text-md font-medium text-gray-500 dark:text-gray-400 ml-2">{title}</h4>
    </div>
    {loading ? <div className="h-8 mt-2 bg-gray-200 rounded dark:bg-gray-700 w-3/4 animate-pulse"></div> :
      error ? <p className="text-sm text-red-500 mt-2">Erro ao carregar</p> :
        <p className="text-3xl font-semibold text-gray-800 dark:text-white/90 mt-1">{value}</p>}
  </Card>
);

export default StatCard;
