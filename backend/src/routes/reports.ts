import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { buildMonthlyReportPdf } from '../utils/pdf';
import { buildMonthlyReportCsv } from '../utils/csv';
import { query, validationResult } from 'express-validator';
import { TransactionType } from '@prisma/client';

const router: Router = express.Router();
router.use(auth);

router.get('/monthly',
  query('startDate').isISO8601().toDate().withMessage('Data de início inválida'),
  query('endDate').isISO8601().toDate().withMessage('Data de fim inválida'),
  query('format').isIn(['csv', 'pdf']).default('csv'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate, format } = req.query as unknown as { startDate: Date, endDate: Date, format: string };
      const userId = req.user!.id;

      const [user, transactions] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.transaction.findMany({
          where: { userId, date: { gte: startDate, lte: endDate } },
          include: { category: true, card: true },
          orderBy: { date: 'asc' },
        }),
      ]);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const reportData = transactions.map(t => ({
        date: t.date,
        description: t.description,
        categoryName: t.category?.name || 'N/A',
        cardName: t.card?.name || 'N/A',
        amount: t.amount,
        type: t.type
      }));

      const period = {
        start: startDate.toLocaleDateString('pt-BR'),
        end: endDate.toLocaleDateString('pt-BR'),
      };

      if (format.toLowerCase() === 'pdf') {
        const totalExpenses = transactions
          .filter(t => t.type === TransactionType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);

        const byCategory = Object.entries(transactions
          .filter(t => t.type === TransactionType.EXPENSE && t.category)
          .reduce((acc, t) => {
            const key = t.category!.name;
            acc[key] = (acc[key] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>))
          .map(([name, amount]) => ({ name, amount }));

        const byCard = Object.entries(transactions
          .filter(t => t.type === TransactionType.EXPENSE && t.card)
          .reduce((acc, t) => {
            const key = t.card!.name;
            acc[key] = (acc[key] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>))
          .map(([name, amount]) => ({ name, amount }));

        const summary = {
            total: totalExpenses,
            byCategory,
            byCard,
        };
        buildMonthlyReportPdf(res, user, period, reportData, summary);
      } else {
        buildMonthlyReportCsv(res, period, reportData);
      }
    } catch (e) {
      next(e);
    }
  }
);

export default router;
