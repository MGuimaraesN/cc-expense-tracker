import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();
router.use(auth);

// GET /budgets
router.get('/budgets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const where: any = { userId: req.user!.id };
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    const items = await prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json(items.map(b => ({ ...b, categoryName: b.category.name })));
  } catch (e) {
    next(e);
  }
});

// POST /budgets
router.post('/budgets',
  body('categoryId').isInt(),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2000 }),
  body('amount').isFloat({ min: 0 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { categoryId, month, year, amount } = req.body;
      const data = {
        userId: req.user!.id,
        categoryId: Number(categoryId),
        month: Number(month),
        year: Number(year),
        amount: Number(amount),
      };
      const created = await prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId: data.userId,
            categoryId: data.categoryId,
            month: data.month,
            year: data.year,
          },
        },
        update: { amount: data.amount },
        create: data,
      });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /budgets/:id
router.delete('/budgets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.budget.findFirst({ where: { id, userId: req.user!.id } });
    if (!item) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    await prisma.budget.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
