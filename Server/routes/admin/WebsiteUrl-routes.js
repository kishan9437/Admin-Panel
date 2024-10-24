const express = require('express');
const {addWebsiteUrl,getWebsiteUrls}=require('../../controllers/admin/WebsiteUrl-controller');
const authMiddleware = require('../../middleware/auth-middleware')
const router=express.Router();

router.post('/add-website-url', authMiddleware, addWebsiteUrl);
router.get('/get-website-url', authMiddleware, getWebsiteUrls);

module.exports=router;