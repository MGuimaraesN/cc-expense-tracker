import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

const swaggerPath = path.join(__dirname, '..', 'swagger.json');
const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));

module.exports = router;
