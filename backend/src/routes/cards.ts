import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router: Router = express.Router();

router.use(auth);

// GET /cards
router.get('/cards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await prisma.card.findMany({ where: { userId: req.user!.id }, orderBy: { id: 'desc' } });
    res.json(cards);
  } catch (e) {
    next(e);
  }
});

// POST /cards
router.post('/cards',
  body('name').notEmpty(),
  body('limit').isFloat({ min: 0 }),
  body('closeDay').isInt({ min: 1, max: 28 }),
  body('dueDay').isInt({ min: 1, max: 28 }),
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
          limit: Number(limit),
          closeDay: Number(closeDay),
          dueDay: Number(dueDay),
        },
      });
      res.status(201).json(card);
    } catch (e) {
      next(e);
    }
  }
);

// GET /cards/:id
router.get('/cards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const card = await prisma.card.findFirst({ where: { id, userId: req.user!.id } });
    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    res.json(card);
  } catch (e) {
    next(e);
  }
});

// PUT /cards/:id
router.put('/cards/:id',
  body('name').optional().notEmpty(),
  body('limit').optional().isFloat({ min: 0 }),
  body('closeDay').optional().isInt({ min: 1, max: 28 }),
  body('dueDay').optional().isInt({ min: 1, max: 28 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const id = Number(req.params.id);
      const existing = await prisma.card.findFirst({ where: { id, userId: req.user!.id } });
      if (!existing) {
        return res.status(404).json({ error: 'Cartão não encontrado' });
      }
      const updated = await prisma.card.update({ where: { id }, data: req.body });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /cards/:id
router.delete('/cards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.card.findFirst({ where: { id, userId: req.user!.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    await prisma.card.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// POST /cards/:id/upload-icon
router.post('/cards/:id/upload-icon', upload.single('icon'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const card = await prisma.card.findFirst({ where: { id, userId: req.user!.id } });
    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const iconUrl = `/uploads/${req.file.filename}`;
    const updatedCard = await prisma.card.update({
      where: { id },
      data: { iconUrl },
    });

    res.json(updatedCard);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
