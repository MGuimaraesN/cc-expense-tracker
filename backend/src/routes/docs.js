const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(__dirname, '..', 'swagger.json');
const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));

module.exports = router;
