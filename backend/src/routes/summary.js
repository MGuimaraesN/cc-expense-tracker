const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/summary', async (req, res, next) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year) return res.status(400).json({ error: 'Informe month e year' });
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [txs, cats, cards, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id, date: { gte: start, lte: end } },
        include: { category: true, card: true }
      }),
      prisma.category.findMany({ where: { userId: req.user.id } }),
      prisma.card.findMany({ where: { userId: req.user.id } }),
      prisma.budget.findMany({ where: { userId: req.user.id, month, year }, include: { category: true } })
    ]);

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

    // Budgets status
    const budgetStatus = budgets.map(b => ({
      categoryId: b.categoryId,
      categoryName: b.category.name,
      budget: b.amount,
      spent: txs.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0),
      exceeded: txs.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0) > b.amount
    }));

    res.json({
      period: { month, year },
      total,
      byCategory: Object.entries(byCategory).map(([name, amount]) => ({ name, amount })),
      byCard: Object.entries(byCard).map(([name, amount]) => ({ name, amount })),
      budgetStatus
    });
  } catch (e) { next(e); }
});

module.exports = router;
