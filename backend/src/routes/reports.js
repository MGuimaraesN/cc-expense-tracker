const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { buildMonthlyReportPdf } = require('../utils/pdf');
const { buildMonthlyReportCsv } = require('../utils/csv');

const router = express.Router();
router.use(auth);

router.get('/reports/monthly', async (req, res, next) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    const format = (req.query.format || 'csv').toLowerCase();
    if (!month || !year) return res.status(400).json({ error: 'Informe month e year' });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [user, txs] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id } }),
      prisma.transaction.findMany({
        where: { userId: req.user.id, date: { gte: start, lte: end } },
        include: { category: true, card: true },
        orderBy: { date: 'asc' }
      })
    ]);

    const normalized = txs.map(t => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      description: t.description,
      categoryName: t.category?.name || null,
      cardName: t.card?.name || null
    }));

    const total = txs.reduce((sum, t) => sum + t.amount, 0);
    const byCategory = {};
    txs.forEach(t => {
      const key = t.category?.name || 'Sem categoria';
      byCategory[key] = (byCategory[key] || 0) + t.amount;
    });
    const byCard = {};
    txs.forEach(t => {
      const key = t.card?.name || 'Sem cartão';
      byCard[key] = (byCard[key] || 0) + t.amount;
    });

    const summary = {
      total,
      byCategory: Object.entries(byCategory).map(([name, amount]) => ({ name, amount })),
      byCard: Object.entries(byCard).map(([name, amount]) => ({ name, amount })),
    };

    if (format === 'pdf') {
      return buildMonthlyReportPdf(res, user, { month, year }, normalized, summary);
    } else {
      return buildMonthlyReportCsv(res, { month, year }, normalized);
    }
  } catch (e) { next(e); }
});

module.exports = router;
