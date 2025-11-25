import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { TransactionType } from '@prisma/client';

const router: Router = express.Router();

// Get all transactions for the logged-in user
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (e) {
    next(e);
  }
});

// Create a new transaction
router.post('/',
  auth,
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('date').isISO8601().toDate().withMessage('Invalid date format'),
  body('type').isIn([TransactionType.INCOME, TransactionType.EXPENSE]).withMessage('Invalid transaction type'),
  body('categoryId').isInt().optional(),
  body('cardId').isInt().optional(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { amount, date, description, type, categoryId, cardId } = req.body;
      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user!.id,
          amount,
          date,
          description,
          type,
          categoryId,
          cardId,
        },
      });
      res.status(201).json(transaction);
    } catch (e) {
      next(e);
    }
  }
);

// Get a single transaction by ID
router.get('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id: parseInt(id), userId: req.user!.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (e) {
    next(e);
  }
});

// Update a transaction
router.put('/:id',
  auth,
  body('amount').isFloat({ gt: 0 }).optional(),
  body('date').isISO8601().toDate().optional(),
  body('type').isIn([TransactionType.INCOME, TransactionType.EXPENSE]).optional(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const transaction = await prisma.transaction.updateMany({
        where: { id: parseInt(id), userId: req.user!.id },
        data: req.body,
      });

      if (transaction.count === 0) {
        return res.status(404).json({ error: 'Transaction not found or not owned by user' });
      }
      res.json({ message: 'Transaction updated successfully' });
    } catch (e) {
      next(e);
    }
  }
);

// Delete a transaction
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.deleteMany({
      where: { id: parseInt(id), userId: req.user!.id },
    });

    if (transaction.count === 0) {
      return res.status(404).json({ error: 'Transaction not found or not owned by user' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
