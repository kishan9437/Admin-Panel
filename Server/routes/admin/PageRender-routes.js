const express = require('express');
const { getPageRenderData } = require('../../controllers/admin/PageRender-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

// router.post('/add-chartdata', addChartData);
router.get('/chart-data/:period', getPageRenderData);

module.exports = router;