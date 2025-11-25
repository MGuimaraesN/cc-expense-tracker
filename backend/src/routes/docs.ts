import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';

const router: Router = express.Router();

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
