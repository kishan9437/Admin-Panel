const express = require('express');
const { addWebsite, getAllWebsites, updateWebsite, deleteWebsite } = require('../../controllers/admin/Website-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-website', authMiddleware, addWebsite);
router.get('/websites', authMiddleware, getAllWebsites);
router.put('/website/update/:id', authMiddleware, updateWebsite)
router.delete('/website/delete/:id', authMiddleware, deleteWebsite)

module.exports = router;