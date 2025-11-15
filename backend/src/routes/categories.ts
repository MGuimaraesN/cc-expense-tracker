import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();
router.use(auth);

// GET /categories
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.category.findMany({
      where: { userId: req.user!.id },
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// POST /categories
router.post('/categories',
  body('name').notEmpty(),
  body('type').isIn(['INCOME', 'EXPENSE']), // Assuming type is required from the frontend
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, type } = req.body; // Assuming type is sent
      const item = await prisma.category.create({
        data: { userId: req.user!.id, name, type },
      });
      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /categories/:id
router.put('/categories/:id',
  body('name').notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const existing = await prisma.category.findFirst({ where: { id, userId: req.user!.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      const updated = await prisma.category.update({
        where: { id },
        data: { name: req.body.name },
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /categories/:id
router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.category.findFirst({ where: { id, userId: req.user!.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
