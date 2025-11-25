import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import errorHandler from './middleware/error';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import docsRoutes from './routes/docs';
import cardsRoutes from './routes/cards';
import categoriesRoutes from './routes/categories';
import transactionsRoutes from './routes/transactions';
import budgetsRoutes from './routes/budgets';
import summaryRoutes from './routes/summary';
import reportsRoutes from './routes/reports';
import recurringTransactionsRoutes from './routes/recurring-transactions';
import adminRoutes from './routes/admin';

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 4000;
const ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser()); // Though not used for JWT, it's good practice to keep for other potential uses

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api', docsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/recurring-transactions', recurringTransactionsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api/docs`);
});
