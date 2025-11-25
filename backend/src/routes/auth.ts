import express, { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';
import auth from '../middleware/auth';

const router: Router = express.Router();

// Register
router.post('/auth/register',
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { name, email, passwordHash } });
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (e) {
      next(e);
    }
  }
);

// Change Password
router.put('/auth/change-password',
  auth,
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { oldPassword, newPassword } = req.body;
      const userRecord = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!userRecord) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      const ok = await bcrypt.compare(oldPassword, userRecord.passwordHash);
      if (!ok) {
        return res.status(400).json({ error: 'Senha antiga inválida' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (e) {
      next(e);
    }
  }
);

// Login
router.post('/auth/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Credenciais inválidas' });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(400).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET || 'supersecretjwt',
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/',
      });

      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
      next(e);
    }
  }
);

// Endpoint to get the current user from the token
router.get('/auth/me', auth, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json({ user: req.user });
});

// Endpoint to logout
router.post('/auth/logout', (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  res.status(200).json({ message: 'Logout bem-sucedido' });
});

module.exports = router;
