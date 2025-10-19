const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/categories', async (req, res, next) => {
  try {
    const items = await prisma.category.findMany({ where: { userId: req.user.id }, orderBy: { name: 'asc' } });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/categories',
  body('name').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name } = req.body;
      const item = await prisma.category.create({ data: { userId: req.user.id, name } });
      res.status(201).json(item);
    } catch (e) { next(e); }
  }
);

router.put('/categories/:id',
  body('name').notEmpty(),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existing = await prisma.category.findFirst({ where: { id, userId: req.user.id } });
      if (!existing) return res.status(404).json({ error: 'Categoria não encontrada' });
      const updated = await prisma.category.update({ where: { id }, data: { name: req.body.name } });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.category.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Categoria não encontrada' });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;
