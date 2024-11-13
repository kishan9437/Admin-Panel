const express = require('express');
const { addCrawlSession,getCrawlSession,deleteCrawlSession } = require('../../controllers/admin/CrawlSession-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-crawlsession', authMiddleware, addCrawlSession);
router.get('/get-crawlsession', authMiddleware, getCrawlSession);
router.delete('/crawlsession/delete/:id', authMiddleware, deleteCrawlSession);

module.exports = router;