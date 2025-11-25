import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();

// All routes in this file are protected
router.use(auth);

// GET /cards
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await prisma.card.findMany({
      where: { userId: req.user!.id },
      orderBy: { name: 'asc' }
    });
    res.json(cards);
  } catch (e) {
    next(e);
  }
});

// GET /cards/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const card = await prisma.card.findFirst({ where: { id, userId: req.user!.id } });
    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    res.json(card);
  } catch (e) {
    next(e);
  }
});

// POST /cards
router.post('/',
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('limit').isFloat({ min: 0 }).withMessage('Limite deve ser um número positivo'),
  body('closeDay').isInt({ min: 1, max: 31 }).withMessage('Dia de fechamento inválido'),
  body('dueDay').isInt({ min: 1, max: 31 }).withMessage('Dia de vencimento inválido'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, limit, closeDay, dueDay } = req.body;
      const card = await prisma.card.create({
        data: {
          userId: req.user!.id,
          name,
          limit,
          closeDay,
          dueDay,
        },
      });
      res.status(201).json(card);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /cards/:id
router.put('/:id',
  body('name').optional().notEmpty(),
  body('limit').optional().isFloat({ min: 0 }),
  body('closeDay').optional().isInt({ min: 1, max: 31 }),
  body('dueDay').optional().isInt({ min: 1, max: 31 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const id = parseInt(req.params.id);
      const card = await prisma.card.updateMany({
        where: { id, userId: req.user!.id },
        data: req.body
      });

      if (card.count === 0) {
        return res.status(404).json({ error: 'Cartão não encontrado ou não pertence ao usuário' });
      }
      res.json({ message: 'Cartão atualizado com sucesso' });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /cards/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const card = await prisma.card.deleteMany({
      where: { id, userId: req.user!.id }
    });

    if (card.count === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado ou não pertence ao usuário' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
