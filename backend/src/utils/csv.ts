import { Response } from 'express';
import { format } from '@fast-csv/format';

interface TransactionData {
  date: Date;
  description: string | null;
  categoryName: string | null;
  cardName: string | null;
  amount: number;
}

interface Period {
  start: string;
  end: string;
}

export const buildMonthlyReportCsv = (res: Response, period: Period, transactions: TransactionData[]): void => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="relatorio_${period.start}_a_${period.end}.csv"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  transactions.forEach(t => {
    csvStream.write({
      date: new Date(t.date).toISOString().slice(0, 10),
      description: t.description || '',
      category: t.categoryName || '',
      card: t.cardName || '',
      amount: t.amount,
    });
  });

  csvStream.end();
};
