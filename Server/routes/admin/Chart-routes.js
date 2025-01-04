const express = require('express');
const { getChartData, addChartData, getUrlData } = require('../../controllers/admin/Chart-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

// router.post('/add-chartdata', addChartData);
router.get('/chart-data', getChartData);
router.get('/get-url-chart', getUrlData)

module.exports = router;