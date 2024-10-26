const express = require('express');
const { addWebsite, getAllWebsites,getWebsiteById, updateWebsite, deleteWebsite,getUrls,getWebsiteId } = require('../../controllers/admin/Website-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-website', authMiddleware, addWebsite);
router.get('/websites', authMiddleware, getAllWebsites);
router.get('/website-url' , authMiddleware,getUrls)
router.get('/website-urls-id/:website_id',authMiddleware,getWebsiteId)
router.get('/websites/:id', authMiddleware, getWebsiteById);
router.put('/website/update/:id', authMiddleware, updateWebsite)
router.delete('/website/delete/:id', authMiddleware, deleteWebsite)

module.exports = router;