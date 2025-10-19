const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { parse } = require('fast-csv');
const { Readable } = require('stream');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

function parseFilters(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '50', 10)));
  const where = { userId: query.userId };
  if (query.cardId) where.cardId = Number(query.cardId);
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = new Date(query.startDate);
    if (query.endDate) {
      const d = new Date(query.endDate);
      d.setHours(23,59,59,999);
      where.date.lte = d;
    }
  }
  return { page, pageSize, where };
}

router.get('/transactions', async (req, res, next) => {
  try {
    const { page, pageSize, where } = parseFilters({ ...req.query, userId: req.user.id });
    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { category: true, card: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);
    res.json({
      page, pageSize, total,
      items: items.map(t => ({
        id: t.id,
        date: t.date,
        amount: t.amount,
        description: t.description,
        categoryId: t.categoryId,
        categoryName: t.category?.name,
        cardId: t.cardId,
        cardName: t.card?.name,
        installments: t.installments,
        installmentIndex: t.installmentIndex
      }))
    });
  } catch (e) { next(e); }
});

router.post('/transactions',
  body('date').isISO8601().toDate(),
  body('amount').isFloat(),
  body('description').optional().isString(),
  body('categoryId').optional().isInt(),
  body('cardId').optional().isInt(),
  body('installments').optional().isInt({ min: 1 }),
  body('installmentIndex').optional().isInt({ min: 1 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const data = { ...req.body, userId: req.user.id, amount: Number(req.body.amount) };
      const created = await prisma.transaction.create({ data });
      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

router.put('/transactions/:id',
  body('date').optional().isISO8601().toDate(),
  body('amount').optional().isFloat(),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const tx = await prisma.transaction.findFirst({ where: { id, userId: req.user.id } });
      if (!tx) return res.status(404).json({ error: 'Transação não encontrada' });
      const data = { ...req.body };
      if (data.amount != null) data.amount = Number(data.amount);
      const updated = await prisma.transaction.update({ where: { id }, data });
      res.json(updated);
    } catch (e) { next(e); }
  }
);

router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const tx = await prisma.transaction.findFirst({ where: { id, userId: req.user.id } });
    if (!tx) return res.status(404).json({ error: 'Transação não encontrada' });
    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

/**
 * Import CSV
 * Expects CSV with headers: date, amount, description, card_name, category
 * Optionally send a 'mapping' field (JSON) to map these keys to your CSV headers.
 */
router.post('/transactions/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo CSV ausente (campo: file)' });
    const buf = req.file.buffer;
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const headers = {
      date: mapping.date || 'date',
      amount: mapping.amount || 'amount',
      description: mapping.description || 'description',
      cardName: mapping.card_name || mapping.cardName || 'card_name',
      category: mapping.category || 'category'
    };

    const rows = [];
    await new Promise((resolve, reject) => {
      Readable.from(buf.toString()).pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', reject)
        .on('data', row => rows.push(row))
        .on('end', resolve);
    });

    let imported = 0;
    for (const r of rows) {
      const dateStr = r[headers.date];
      const amountStr = r[headers.amount];
      if (!dateStr || !amountStr) continue;
      const date = new Date(dateStr);
      const amount = Number(String(amountStr).replace(',','.'));
      const description = r[headers.description] || null;
      const cardName = r[headers.cardName] || null;
      const categoryName = r[headers.category] || null;

      let cardId = null;
      if (cardName) {
        let card = await prisma.card.findFirst({ where: { userId: req.user.id, name: cardName } });
        if (!card) {
          card = await prisma.card.create({ data: { userId: req.user.id, name: cardName, limit: 0, closeDay: 1, dueDay: 10 } });
        }
        cardId = card.id;
      }

      let categoryId = null;
      if (categoryName) {
        let cat = await prisma.category.findFirst({ where: { userId: req.user.id, name: categoryName } });
        if (!cat) {
          cat = await prisma.category.create({ data: { userId: req.user.id, name: categoryName } });
        }
        categoryId = cat.id;
      }

      await prisma.transaction.create({
        data: { userId: req.user.id, cardId, categoryId, date, amount, description }
      });
      imported++;
    }

    res.json({ imported });
  } catch (e) { next(e); }
});

module.exports = router;
