const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', auth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const whereDate = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      lte: endDate ? new Date(endDate) : new Date(),
    };

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, date: whereDate },
    });

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { userId, date: whereDate, categoryId: { not: null } },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetStatus = budgets.map(budget => {
      const categoryExpense = expensesByCategory.find(e => e.categoryId === budget.categoryId);
      const spent = categoryExpense ? categoryExpense._sum.amount : 0;
      return {
        id: budget.id,
        name: budget.category.name,
        limit: budget.amount,
        spent,
        percentage: (spent / budget.amount) * 100,
      };
    });

    const budgetsExceeded = budgetStatus.filter(b => b.spent > b.limit).length;

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: whereDate,
      },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    res.json({
      totalExpenses: totalExpenses._sum.amount || 0,
      budgetsExceeded,
      budgetStatus,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trends', auth, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const whereDate = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      lte: endDate ? new Date(endDate) : new Date(),
    };

    const trends = await prisma.transaction.groupBy({
      by: ['date'],
      where: {
        userId,
        date: whereDate,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const labels = trends.map(t => new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const data = trends.map(t => t._sum.amount);

    res.json({ labels, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
