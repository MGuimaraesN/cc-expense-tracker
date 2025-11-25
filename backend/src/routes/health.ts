import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP' });
});

export default router;
