const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/admin/users', adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get('/admin/transactions', adminOnly, async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany();
    res.json(transactions);
  } catch (e) {
    next(e);
  }
});

router.get('/admin/categories', adminOnly, async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
