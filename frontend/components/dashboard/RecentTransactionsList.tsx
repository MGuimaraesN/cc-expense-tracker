'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Transaction {
  id: number;
  description: string | null;
  amount: number;
  category: {
    name: string;
  } | null;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{transaction.category?.name[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{transaction.category?.name || 'Sem categoria'}</p>
          </div>
          <div className="ml-auto font-medium">{`R$ ${transaction.amount.toFixed(2)}`}</div>
        </div>
      ))}
    </div>
  );
}
