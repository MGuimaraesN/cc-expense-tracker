import React from 'react';
import { format } from 'date-fns';
import { fmtCurrency } from '../../utils/format';
import Card from '../Card';
import { FaReceipt } from 'react-icons/fa';

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-500">
    <p>{message || 'Erro ao carregar.'}</p>
  </div>
);

const TransactionList = ({ transactions, loading, error }) => (
  <Card>
    <div className="flex items-center mb-4">
      <FaReceipt className="text-indigo-500" size={20} />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 ml-2">Últimas Transações</h3>
    </div>
    <div className="space-y-3 overflow-y-auto max-h-[300px]">
      {loading ? Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      )) : error ? <ErrorDisplay /> :
        transactions && transactions.length > 0 ? (
          transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center pr-2 hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-md">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tx.category?.name || 'Sem Categoria'} - {format(new Date(tx.date), 'dd/MM/yyyy')}
                </p>
              </div>
              <span className="text-sm font-semibold text-red-500">-{fmtCurrency(tx.amount)}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma transação no período.</p>
        )}
    </div>
  </Card>
);

export default TransactionList;
