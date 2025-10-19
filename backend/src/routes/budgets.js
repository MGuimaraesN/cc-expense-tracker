const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/budgets', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const where = { userId: req.user.id };
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    const items = await prisma.budget.findMany({ where, include: { category: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
    res.json(items.map(b => ({ ...b, categoryName: b.category.name })));
  } catch (e) { next(e); }
});

router.post('/budgets',
  body('categoryId').isInt(),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2000 }),
  body('amount').isFloat({ min: 0 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const data = { ...req.body, userId: req.user.id, amount: Number(req.body.amount) };
      const created = await prisma.budget.upsert({
        where: { userId_categoryId_month_year: { userId: data.userId, categoryId: data.categoryId, month: data.month, year: data.year } },
        update: { amount: data.amount },
        create: data
      });
      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

router.delete('/budgets/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.budget.findFirst({ where: { id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Orçamento não encontrado' });
    await prisma.budget.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
