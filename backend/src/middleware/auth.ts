import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  email: string;
  name: string;
}

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwt') as DecodedToken;
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = auth;
