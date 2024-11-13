const express = require('express');
const { addCrawlError, getCrawlError,deleteCrawlError} = require('../../controllers/admin/CrawlError-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-crawlError', authMiddleware, addCrawlError);
router.get('/get-crawlError', authMiddleware, getCrawlError);
router.delete('/crawlError/delete/:id', authMiddleware, deleteCrawlError);

module.exports = router;