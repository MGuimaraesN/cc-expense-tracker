import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { query, validationResult } from 'express-validator';

const router: Router = express.Router();
router.use(auth);

// Main dashboard summary endpoint
router.get('/',
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate } = req.query as { startDate?: Date; endDate?: Date };
      const userId = req.user!.id;

      const dateFilter: Prisma.DateTimeFilter = {
        gte: startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lte: endDate || new Date(),
      };

      // Aggregate totals
      const totals = await prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { userId, date: dateFilter },
      });

      const totalIncomes = totals.find(t => t.type === 'INCOME')?._sum.amount || 0;
      const totalExpenses = totals.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
      const balance = totalIncomes - totalExpenses;

      // Expenses by category
      const expensesByCategoryRaw = await prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        where: { userId, date: dateFilter, type: 'EXPENSE', categoryId: { not: null } },
      });

      const categoryIds = expensesByCategoryRaw.map(e => e.categoryId as number);
      const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
      const byCategory = expensesByCategoryRaw.map(e => ({
        name: categories.find(c => c.id === e.categoryId)?.name || 'Outros',
        amount: e._sum.amount || 0,
      }));

      // Expenses by card
      const expensesByCardRaw = await prisma.transaction.groupBy({
        by: ['cardId'],
        _sum: { amount: true },
        where: { userId, date: dateFilter, type: 'EXPENSE', cardId: { not: null } },
      });

      const cardIds = expensesByCardRaw.map(e => e.cardId as number);
      const cards = await prisma.card.findMany({ where: { id: { in: cardIds } } });
      const byCard = expensesByCardRaw.map(e => ({
        name: cards.find(c => c.id === e.cardId)?.name || 'Dinheiro',
        amount: e._sum.amount || 0,
      }));

      // Recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId, date: dateFilter },
        take: 5,
        orderBy: { date: 'desc' },
        include: { category: { select: { name: true } } },
      });

      res.json({
        totalExpenses,
        totalIncomes,
        balance,
        byCategory,
        byCard,
        recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Endpoint for expense trends over time
router.get('/trends',
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate } = req.query as { startDate?: Date; endDate?: Date };
      const userId = req.user!.id;

      const dateFilter: Prisma.DateTimeFilter = {
        gte: startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lte: endDate || new Date(),
      };

      const trends = await prisma.transaction.findMany({
        where: { userId, date: dateFilter, type: 'EXPENSE' },
        select: { date: true, amount: true },
        orderBy: { date: 'asc' },
      });

      // Simple pass-through of data for the client to process
      res.json(trends);
    } catch (error) {
      next(error);
    }
});

export default router;
