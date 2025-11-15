import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Keep these as ES6 imports
import errorHandler from './middleware/error';

// Use require for the routers to ensure CommonJS compatibility
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const docsRoutes = require('./routes/docs');
const cardsRoutes = require('./routes/cards');
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');
const budgetsRoutes = require('./routes/budgets');
const summaryRoutes = require('./routes/summary');
const reportsRoutes = require('./routes/reports');
const recurringTransactionsRoutes = require('./routes/recurring-transactions');
const adminRoutes = require('./routes/admin');

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 4000;
const ORIGIN: string = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', healthRoutes);
app.use('/api', docsRoutes);
app.use('/api', authRoutes);
app.use('/api', cardsRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', budgetsRoutes);
app.use('/api', summaryRoutes);
app.use('/api', reportsRoutes);
app.use('/api', recurringTransactionsRoutes);
app.use('/api', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api/docs`);
});
