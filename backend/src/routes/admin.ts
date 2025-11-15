import express, { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();
router.use(auth);

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/admin/users', adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get('/admin/transactions', adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await prisma.transaction.findMany();
    res.json(transactions);
  } catch (e) {
    next(e);
  }
});

router.get('/admin/categories', adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
