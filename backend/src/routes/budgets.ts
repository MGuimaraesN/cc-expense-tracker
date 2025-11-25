import express, { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();
router.use(auth);

// GET /budgets
router.get('/',
  query('month').isInt({ min: 1, max: 12 }).toInt().optional(),
  query('year').isInt({ min: 2000 }).toInt().optional(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { month, year } = req.query;
      const where: any = { userId: req.user!.id };
      if (month) where.month = month;
      if (year) where.year = year;

      const budgets = await prisma.budget.findMany({
        where,
        include: { category: { select: { name: true, type: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      res.json(budgets);
    } catch (e) {
      next(e);
    }
  }
);

// Upsert a budget
router.post('/',
  body('categoryId').isInt().withMessage('Categoria é obrigatória'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Mês inválido'),
  body('year').isInt({ min: 2000 }).withMessage('Ano inválido'),
  body('amount').isFloat({ gt: 0 }).withMessage('Valor deve ser positivo'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { categoryId, month, year, amount } = req.body;
      const data = {
        userId: req.user!.id,
        categoryId,
        month,
        year,
        amount,
      };

      const budget = await prisma.budget.upsert({
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
      res.status(201).json(budget);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /budgets/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const budget = await prisma.budget.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (budget.count === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado ou não pertence ao usuário' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
