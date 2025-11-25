import express, { Request, Response, Router } from 'express';
const router: Router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

module.exports = router;
