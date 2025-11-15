'use client';

import { Progress } from "@/components/ui/progress";

interface Budget {
  id: number;
  name: string;
  limit: number;
  spent: number;
  percentage: number;
}

interface BudgetsStatusListProps {
  budgets: Budget[];
}

export function BudgetsStatusList({ budgets }: BudgetsStatusListProps) {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div key={budget.id}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{budget.name}</span>
            <span className="text-sm text-muted-foreground">
              {`R$ ${budget.spent.toFixed(2)} / R$ ${budget.limit.toFixed(2)}`}
            </span>
          </div>
          <Progress value={budget.percentage} />
        </div>
      ))}
    </div>
  );
}
