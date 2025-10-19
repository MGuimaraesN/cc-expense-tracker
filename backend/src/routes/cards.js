const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/cards', async (req, res, next) => {
  try {
    const cards = await prisma.card.findMany({ where: { userId: req.user.id }, orderBy: { id: 'desc' } });
    res.json(cards);
  } catch (e) { next(e); }
});

router.post('/cards',
  body('name').notEmpty(),
  body('limit').isFloat({ min: 0 }),
  body('closeDay').isInt({ min: 1, max: 28 }),
  body('dueDay').isInt({ min: 1, max: 28 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, limit, closeDay, dueDay } = req.body;
      const card = await prisma.card.create({ data: { userId: req.user.id, name, limit: Number(limit), closeDay: Number(closeDay), dueDay: Number(dueDay) } });
      res.status(201).json(card);
    } catch (e) { next(e); }
  }
);

router.get('/cards/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const card = await prisma.card.findFirst({ where: { id, userId: req.user.id } });
    if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });
    res.json(card);
  } catch (e) { next(e); }
});

router.put('/cards/:id',
  body('name').optional().notEmpty(),
  body('limit').optional().isFloat({ min: 0 }),
  body('closeDay').optional().isInt({ min: 1, max: 28 }),
  body('dueDay').optional().isInt({ min: 1, max: 28 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const id = Number(req.params.id);
      const existing = await prisma.card.findFirst({ where: { id, userId: req.user.id } });
      if (!existing) return res.status(404).json({ error: 'Cartão não encontrado' });
      const updated = await prisma.card.update({ where: { id }, data: req.body });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

router.delete('/cards/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.card.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Cartão não encontrado' });
    await prisma.card.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
