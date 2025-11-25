import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { buildMonthlyReportPdf } from '../utils/pdf';
import { buildMonthlyReportCsv } from '../utils/csv';

const router: Router = express.Router();
router.use(auth);

router.get('/reports/monthly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query as { startDate: string, endDate: string, format: string };

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Informe startDate e endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [user, txs] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user!.id } }),
      prisma.transaction.findMany({
        where: { userId: req.user!.id, date: { gte: start, lte: end } },
        include: { category: true, card: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const normalized = txs.map(t => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      description: t.description,
      categoryName: t.category?.name || null,
      cardName: t.card?.name || null,
    }));

    const total = txs.reduce((sum, t) => sum + t.amount, 0);

    const byCategory: { [key: string]: number } = {};
    txs.forEach(t => {
      const key = t.category?.name || 'Sem categoria';
      byCategory[key] = (byCategory[key] || 0) + t.amount;
    });

    const byCard: { [key: string]: number } = {};
    txs.forEach(t => {
      const key = t.card?.name || 'Sem cartão';
      byCard[key] = (byCard[key] || 0) + t.amount;
    });

    const summary = {
      total,
      byCategory: Object.entries(byCategory).map(([name, amount]) => ({ name, amount })),
      byCard: Object.entries(byCard).map(([name, amount]) => ({ name, amount })),
    };

    const period = {
      start: start.toLocaleDateString('pt-BR'),
      end: end.toLocaleDateString('pt-BR'),
    };

    if (format.toLowerCase() === 'pdf') {
      buildMonthlyReportPdf(res, user, period, normalized, summary);
    } else {
      buildMonthlyReportCsv(res, period, normalized);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
