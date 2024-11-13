const express = require('express');
const { addError400Website,getError400website,deleteError400website } = require('../../controllers/admin/error400Website-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-error400website', authMiddleware, addError400Website);
router.get('/get-error400website', authMiddleware, getError400website);
router.delete('/error400website/delete/:id', authMiddleware, deleteError400website);

module.exports = router;