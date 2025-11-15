'use client';

import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { BudgetsStatusList } from "@/components/dashboard/BudgetsStatusList";
import { NewTransactionModal } from "@/components/dashboard/NewTransactionModal";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { data: summary, error, mutate } = useSWR('/api/summary', fetcher);

  if (error) return <div className="text-red-500">Falha ao carregar os dados.</div>;
  if (!summary) return <div>Carregando...</div>;

  const chartData = summary.byCategory.map((item: any) => ({
    name: item.name,
    total: item.amount,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <NewTransactionModal onSave={mutate} />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Balanço"
          value={`R$ ${summary.balance.toFixed(2)}`}
          icon={Wallet}
          description="Saldo atual"
        />
        <StatCard
          title="Receitas"
          value={`+ R$ ${summary.totalIncomes.toFixed(2)}`}
          icon={TrendingUp}
          description="no último mês"
        />
        <StatCard
          title="Despesas"
          value={`- R$ ${summary.totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          description="no último mês"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Despesas */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <CategoryChart data={chartData} />
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Suas últimas {summary.recentTransactions.length} transações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsList transactions={summary.recentTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Status dos Orçamentos */}
       <Card>
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
            <CardDescription>
              Acompanhe seus limites de gastos mensais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetsStatusList budgets={summary.budgetStatus} />
          </CardContent>
        </Card>
    </div>
  );
}
