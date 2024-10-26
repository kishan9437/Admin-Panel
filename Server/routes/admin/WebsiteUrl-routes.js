const express = require('express');
const {addWebsiteUrl,getWebsiteUrls,deleteWebsiteUrls,getWebsiteUrlById,updateWebsiteUrl}=require('../../controllers/admin/WebsiteUrl-controller');
const authMiddleware = require('../../middleware/auth-middleware')
const router=express.Router();

router.post('/add-website-url', authMiddleware, addWebsiteUrl);
router.get('/get-website-url', authMiddleware, getWebsiteUrls);
router.delete('/delete-website-url/:id', authMiddleware, deleteWebsiteUrls);
router.get('/get-website-url/:id', authMiddleware, getWebsiteUrlById);
router.put('/update-website-url/:id', authMiddleware, updateWebsiteUrl)

module.exports=router;