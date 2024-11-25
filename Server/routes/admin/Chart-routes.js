const express = require('express');
const { getChartData, addChartData } = require('../../controllers/admin/Chart-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

// router.post('/add-chartdata', addChartData);
router.get('/chart-data', getChartData);

module.exports = router;