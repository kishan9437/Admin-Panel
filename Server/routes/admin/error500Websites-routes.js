const express = require('express');
const { addError500Website,getError500website,deleteError500website } = require('../../controllers/admin/error500Websites-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-error500website', authMiddleware, addError500Website);
router.get('/get-error500website', authMiddleware, getError500website);
router.delete('/error500website/delete/:id', authMiddleware, deleteError500website);

module.exports = router;