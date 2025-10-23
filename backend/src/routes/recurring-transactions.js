const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// CRUD endpoints for RecurringTransaction
router.get('/recurring-transactions', async (req, res, next) => {
  try {
    const items = await prisma.recurringTransaction.findMany({
      where: { userId: req.user.id },
      include: { category: true, card: true },
      orderBy: { startDate: 'desc' },
    });
    res.json({ items });
  } catch (e) { next(e); }
});

router.post('/recurring-transactions',
  body('startDate').isISO8601().toDate(),
  body('amount').isFloat(),
  body('description').optional().isString(),
  body('categoryId').optional().isInt(),
  body('cardId').optional().isInt(),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const data = { ...req.body, userId: req.user.id, amount: Number(req.body.amount) };
      const created = await prisma.recurringTransaction.create({ data });
      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

router.put('/recurring-transactions/:id',
  body('startDate').optional().isISO8601().toDate(),
  body('amount').optional().isFloat(),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const tx = await prisma.recurringTransaction.findFirst({ where: { id, userId: req.user.id } });
      if (!tx) return res.status(404).json({ error: 'Transação recorrente não encontrada' });
      const data = { ...req.body };
      if (data.amount != null) data.amount = Number(data.amount);
      const updated = await prisma.recurringTransaction.update({ where: { id }, data });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

router.delete('/recurring-transactions/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const tx = await prisma.recurringTransaction.findFirst({ where: { id, userId: req.user.id } });
    if (!tx) return res.status(4404).json({ error: 'Transação recorrente não encontrada' });
    await prisma.recurringTransaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

// Job to create transactions from recurring transactions
router.post('/recurring-transactions/run-job', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    });

    for (const rt of recurringTransactions) {
      const lastTransaction = await prisma.transaction.findFirst({
        where: {
          userId: rt.userId,
          description: rt.description,
          amount: rt.amount,
          recurringTransactionId: rt.id,
        },
        orderBy: { date: 'desc' },
      });

      let nextTransactionDate = new Date(rt.startDate);
      if (lastTransaction) {
        nextTransactionDate = new Date(lastTransaction.date);
        if (rt.frequency === 'daily') nextTransactionDate.setDate(nextTransactionDate.getDate() + 1);
        else if (rt.frequency === 'weekly') nextTransactionDate.setDate(nextTransactionDate.getDate() + 7);
        else if (rt.frequency === 'monthly') nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
        else if (rt.frequency === 'yearly') nextTransactionDate.setFullYear(nextTransactionDate.getFullYear() + 1);
      }

      while (nextTransactionDate <= today) {
        if (rt.endDate && nextTransactionDate > rt.endDate) break;

        const transactionExists = await prisma.transaction.findFirst({
            where: {
                userId: rt.userId,
                description: rt.description,
                amount: rt.amount,
                date: nextTransactionDate
            }
        });

        if (!transactionExists) {
            await prisma.transaction.create({
                data: {
                  userId: rt.userId,
                  cardId: rt.cardId,
                  categoryId: rt.categoryId,
                  date: nextTransactionDate,
                  amount: rt.amount,
                  description: rt.description,
                  recurringTransactionId: rt.id,
                },
              });
        }

        if (rt.frequency === 'daily') nextTransactionDate.setDate(nextTransactionDate.getDate() + 1);
        else if (rt.frequency === 'weekly') nextTransactionDate.setDate(nextTransactionDate.getDate() + 7);
        else if (rt.frequency === 'monthly') nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
        else if (rt.frequency === 'yearly') nextTransactionDate.setFullYear(nextTransactionDate.getFullYear() + 1);
      }
    }

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
