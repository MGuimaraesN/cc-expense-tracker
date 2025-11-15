import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router: Router = express.Router();
router.use(auth);

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const userId = req.user!.id;

    const whereDate: Prisma.DateTimeFilter = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      lte: endDate ? new Date(endDate) : new Date(),
    };

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, date: whereDate, type: 'EXPENSE' },
    });

    const totalIncomes = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, date: whereDate, type: 'INCOME' },
    });

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { userId, date: whereDate, categoryId: { not: null }, type: 'EXPENSE' },
    });

    const expensesByCard = await prisma.transaction.groupBy({
      by: ['cardId'],
      _sum: { amount: true },
      where: { userId, date: whereDate, cardId: { not: null }, type: 'EXPENSE' },
    });

    const categoryIds = expensesByCategory.map(e => e.categoryId).filter((id): id is number => id !== null);
    const cardIds = expensesByCard.map(e => e.cardId).filter((id): id is number => id !== null);

    const [categories, cards] = await Promise.all([
      prisma.category.findMany({ where: { userId, id: { in: categoryIds } } }),
      prisma.card.findMany({ where: { userId, id: { in: cardIds } } }),
    ]);

    const byCategory = expensesByCategory.map(e => ({
      name: categories.find(c => c.id === e.categoryId)?.name || 'Outros',
      amount: e._sum.amount || 0,
    }));

    const byCard = expensesByCard.map(e => ({
      name: cards.find(c => c.id === e.cardId)?.name || 'Outros',
      amount: e._sum.amount || 0,
    }));

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetStatus = budgets.map(budget => {
      const categoryExpense = expensesByCategory.find(e => e.categoryId === budget.categoryId);
      const spent = categoryExpense?._sum.amount || 0;
      return {
        id: budget.id,
        name: budget.category.name,
        limit: budget.amount,
        spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });

    const budgetsExceeded = budgetStatus.filter(b => b.spent > b.limit).length;

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId, date: whereDate },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    const balance = (totalIncomes._sum.amount || 0) - (totalExpenses._sum.amount || 0);

    res.json({
      totalExpenses: totalExpenses._sum.amount || 0,
      totalIncomes: totalIncomes._sum.amount || 0,
      balance,
      budgetsExceeded,
      budgetStatus,
      recentTransactions,
      byCategory,
      byCard,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const userId = req.user!.id;

    const whereDate: Prisma.DateTimeFilter = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      lte: endDate ? new Date(endDate) : new Date(),
    };

    const trends = await prisma.transaction.groupBy({
      by: ['date'],
      where: { userId, date: whereDate, type: 'EXPENSE' },
      _sum: { amount: true },
      orderBy: { date: 'asc' },
    });

    const labels = trends.map(t => new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const data = trends.map(t => t._sum.amount || 0);

    res.json({ labels, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
