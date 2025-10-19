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

    const totals = { total: normalized.reduce((s, t) => s + t.amount, 0) };

    if (format === 'pdf') {
      return buildMonthlyReportPdf(res, user, { month, year }, normalized, totals);
    } else {
      return buildMonthlyReportCsv(res, { month, year }, normalized);
    }
  } catch (e) { next(e); }
});

module.exports = router;
