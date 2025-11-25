import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('ERROR:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor' });
};

module.exports = errorHandler;
