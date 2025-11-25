import express, { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { parse } from 'fast-csv';
import { Readable } from 'stream';
import prisma from '../prisma';
import auth from '../middleware/auth';
import { Prisma, TransactionType, Category } from '@prisma/client';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for buffer

router.use(auth);

function parseFilters(query: any, userId: number) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '50', 10)));
  const where: Prisma.TransactionWhereInput = { userId };
  if (query.cardId) where.cardId = Number(query.cardId);
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = new Date(query.startDate);
    if (query.endDate) {
      const d = new Date(query.endDate);
      d.setHours(23, 59, 59, 999);
      where.date.lte = d;
    }
  }
  return { page, pageSize, where };
}

router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, where } = parseFilters(req.query, req.user!.id);
    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { category: true, card: true, splits: { include: { category: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ page, pageSize, total, items });
  } catch (e) {
    next(e);
  }
});

router.post('/transactions',
  body('date').isISO8601().toDate(),
  body('amount').optional().isFloat(),
  body('description').isString(),
  body('type').isIn(['INCOME', 'EXPENSE']),
  body('categoryId').optional({ nullable: true }).isInt(),
  body('cardId').optional({ nullable: true }).isInt(),
  body('splits').optional().isArray(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { splits, ...transactionData } = req.body;
      let totalAmount = 0;

      if (splits && splits.length > 0) {
        totalAmount = splits.reduce((sum: number, split: any) => sum + Number(split.amount), 0);
      } else {
        totalAmount = Number(req.body.amount);
      }

      const data: Prisma.TransactionCreateInput = {
        user: { connect: { id: req.user!.id } },
        date: transactionData.date,
        description: transactionData.description,
        type: transactionData.type,
        amount: totalAmount,
        card: transactionData.cardId ? { connect: { id: Number(transactionData.cardId) } } : undefined,
        category: transactionData.categoryId ? { connect: { id: Number(transactionData.categoryId) } } : undefined,
      };

      const created = await prisma.transaction.create({ data });

      if (splits && splits.length > 0) {
        for (const split of splits) {
          await prisma.splitTransaction.create({
            data: {
              transaction: { connect: { id: created.id } },
              category: { connect: { id: Number(split.categoryId) } },
              amount: Number(split.amount),
              description: split.description,
            },
          });
        }
      }

      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

router.put('/transactions/:id',
  body('date').optional().isISO8601().toDate(),
  body('amount').optional().isFloat(),
  body('splits').optional().isArray(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const tx = await prisma.transaction.findFirst({ where: { id, userId: req.user!.id } });
      if (!tx) return res.status(404).json({ error: 'Transação não encontrada' });

      const { splits, ...transactionData } = req.body;
      let totalAmount = 0;

      if (splits && splits.length > 0) {
        totalAmount = splits.reduce((sum: number, split: any) => sum + Number(split.amount), 0);
      } else if (req.body.amount) {
        totalAmount = Number(req.body.amount);
      } else {
        totalAmount = tx.amount;
      }

      const data: Prisma.TransactionUpdateInput = {
        ...transactionData,
        amount: totalAmount,
      };

      const updated = await prisma.transaction.update({ where: { id }, data });

      if (splits) {
        await prisma.splitTransaction.deleteMany({ where: { transactionId: id } });
        if (splits.length > 0) {
          for (const split of splits) {
            await prisma.splitTransaction.create({
              data: {
                transaction: { connect: { id: id } },
                category: { connect: { id: Number(split.categoryId) } },
                amount: Number(split.amount),
                description: split.description,
              },
            });
          }
        }
      }

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);


router.delete('/transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const tx = await prisma.transaction.findFirst({ where: { id, userId: req.user!.id } });
    if (!tx) return res.status(404).json({ error: 'Transação não encontrada' });
    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});


router.post('/transactions/import', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo CSV ausente (campo: file)' });
    const buf = req.file.buffer;
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const headers = {
      date: mapping.date || 'date',
      amount: mapping.amount || 'amount',
      description: mapping.description || 'description',
      cardName: mapping.card_name || mapping.cardName || 'card_name',
      category: mapping.category || 'category',
      type: mapping.type || 'type',
    };

    const rows: any[] = [];
    await new Promise((resolve, reject) => {
      Readable.from(buf.toString()).pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', reject)
        .on('data', row => rows.push(row))
        .on('end', resolve);
    });

    const successes: any[] = [];
    const errors: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const lineNumber = i + 2;
      try {
        const dateStr = r[headers.date];
        const amountStr = r[headers.amount];
        if (!dateStr || !amountStr) {
          errors.push({ line: lineNumber, error: 'Data ou valor ausentes' });
          continue;
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push({ line: lineNumber, error: `Data inválida: ${dateStr}` });
          continue;
        }
        const amount = Number(String(amountStr).replace(',', '.'));
        if (isNaN(amount)) {
          errors.push({ line: lineNumber, error: `Valor inválido: ${amountStr}` });
          continue;
        }

        const typeStr = (r[headers.type] || 'expense').toUpperCase();
        const type = typeStr === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE;

        const description = r[headers.description] || null;
        const cardName = r[headers.cardName] || null;
        const categoryName = r[headers.category] || null;

        let cardId = null;
        if (cardName) {
          let card = await prisma.card.findFirst({ where: { userId: req.user!.id, name: cardName } });
          if (!card) {
            card = await prisma.card.create({ data: { userId: req.user!.id, name: cardName, limit: 0, closeDay: 1, dueDay: 10 } });
          }
          cardId = card.id;
        }

        let categoryId = null;
        if (categoryName) {
          let cat = await prisma.category.findFirst({ where: { userId: req.user!.id, name: categoryName } });
          if (!cat) {
            cat = await prisma.category.create({ data: { userId: req.user!.id, name: categoryName, type } });
          }
          categoryId = cat.id;
        }

        const newTx = await prisma.transaction.create({
          data: { userId: req.user!.id, cardId, categoryId, date, amount, description, type }
        });
        successes.push(newTx);
      } catch (e: any) {
        errors.push({ line: lineNumber, error: e.message });
      }
    }

    res.json({ successes: successes.length, errors });
  } catch (e) {
    next(e);
  }
});


module.exports = router;
