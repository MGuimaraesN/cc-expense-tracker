import React, { useState } from 'react';
import { useQuery } from 'react-query';
import client from '../api/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { FaDollarSign, FaReceipt, FaFileExport, FaCog } from 'react-icons/fa';
import MenuItem from '../components/dashboard/MenuItem';
import Statistics from '../components/dashboard/Statistics';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';

export default function Dashboard() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  // A lógica de busca de dados será mantida para uso futuro
  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    ['summary', startDate, endDate],
    () => client.get('/summary', { params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } }).then(res => res.data)
  );

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    ['trends', startDate, endDate],
    () => client.get('/summary/trends', { params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() } }).then(res => res.data)
  );

  return (
    <div className="space-y-6">

      {/* Seção "Menu" */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MenuItem icon={FaDollarSign} title="Total de Despesas" isActive />
          <MenuItem icon={FaReceipt} title="Ciclos" />
          <MenuItem icon={FaFileExport} title="Exportar" />
          <MenuItem icon={FaCog} title="Configurações" />
        </div>
      </div>

      {/* Seção "Estatísticas" */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Estatísticas</h2>
        <Statistics trendsData={trendsData} summaryData={summaryData} loading={trendsLoading || summaryLoading} />
      </div>

      {/* Seção "Transações Recentes" */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Transações Recentes</h2>
        <RecentTransactionsTable transactions={summaryData?.recentTransactions} loading={summaryLoading} />
      </div>

    </div>
  );
}
