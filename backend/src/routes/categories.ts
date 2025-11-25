import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { TransactionType } from '@prisma/client';

const router: Router = express.Router();

// All routes in this file are protected
router.use(auth);

// GET /categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.id },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

// POST /categories
router.post('/',
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('type').isIn([TransactionType.INCOME, TransactionType.EXPENSE]).withMessage('Tipo de transação inválido'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, type } = req.body;
      const category = await prisma.category.create({
        data: { userId: req.user!.id, name, type },
      });
      res.status(201).json(category);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /categories/:id
router.put('/:id',
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('type').optional().isIn([TransactionType.INCOME, TransactionType.EXPENSE]).withMessage('Tipo de transação inválido'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const id = parseInt(req.params.id);
      const category = await prisma.category.updateMany({
        where: { id, userId: req.user!.id },
        data: req.body,
      });

      if (category.count === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada ou não pertence ao usuário' });
      }
      res.json({ message: 'Categoria atualizada com sucesso' });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /categories/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const category = await prisma.category.deleteMany({
      where: { id, userId: req.user!.id },
    });

    if (category.count === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada ou não pertence ao usuário' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
