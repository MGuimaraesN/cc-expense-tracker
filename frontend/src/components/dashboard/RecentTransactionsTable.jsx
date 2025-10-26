import React from 'react';
import { format } from 'date-fns';
import { fmtCurrency } from '../../utils/format';
import { FaArrowUp } from 'react-icons/fa';

const RecentTransactionsTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm font-semibold text-text-secondary border-b border-border-color">
            <th className="py-3 px-4">Descrição</th>
            <th className="py-3 px-4">Categoria</th>
            <th className="py-3 px-4">Data</th>
            <th className="py-3 px-4">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map((tx) => (
            <tr key={tx.id} className="border-b border-border-color hover:bg-gray-50">
              <td className="py-3 px-4 text-text-primary font-medium">{tx.description}</td>
              <td className="py-3 px-4 text-text-secondary">{tx.category?.name || 'N/A'}</td>
              <td className="py-3 px-4 text-text-secondary">{format(new Date(tx.date), 'dd/MM/yyyy')}</td>
              <td className="py-3 px-4 text-red-500 font-semibold">{fmtCurrency(tx.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsTable;
