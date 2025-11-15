import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { Frequency } from '@prisma/client';

const router: Router = express.Router();
router.use(auth);

// CRUD endpoints for RecurringTransaction
router.get('/recurring-transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.recurringTransaction.findMany({
      where: { userId: req.user!.id },
      include: { category: true, card: true },
      orderBy: { startDate: 'desc' },
    });
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.post('/recurring-transactions',
  body('startDate').isISO8601().toDate(),
  body('amount').isFloat(),
  body('description').isString(),
  body('categoryId').isInt(),
  body('cardId').optional({ nullable: true }).isInt(),
  body('frequency').isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { startDate, amount, description, categoryId, cardId, frequency, endDate } = req.body;
      const data = {
        userId: req.user!.id,
        startDate,
        amount: Number(amount),
        description,
        categoryId: Number(categoryId),
        cardId: cardId ? Number(cardId) : null,
        frequency: frequency as Frequency,
        endDate: endDate ? new Date(endDate) : null,
      };
      const created = await prisma.recurringTransaction.create({ data });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

router.put('/recurring-transactions/:id',
  body('startDate').optional().isISO8601().toDate(),
  body('amount').optional().isFloat(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const tx = await prisma.recurringTransaction.findFirst({ where: { id, userId: req.user!.id } });
      if (!tx) {
        return res.status(404).json({ error: 'Transação recorrente não encontrada' });
      }
      const data: any = { ...req.body };
      if (data.amount != null) data.amount = Number(data.amount);
      if (data.frequency) data.frequency = data.frequency as Frequency;

      const updated = await prisma.recurringTransaction.update({ where: { id }, data });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.delete('/recurring-transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const tx = await prisma.recurringTransaction.findFirst({ where: { id, userId: req.user!.id } });
    if (!tx) {
      return res.status(404).json({ error: 'Transação recorrente não encontrada' });
    }
    await prisma.recurringTransaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
