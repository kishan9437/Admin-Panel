const express = require('express');
const { addActivity,getActivity,deleteActivity } = require('../../controllers/admin/Activity-controller')
const authMiddleware = require('../../middleware/auth-middleware')
const router = express.Router();

router.post('/add-activity', authMiddleware, addActivity);
router.get('/activities', authMiddleware, getActivity);
router.delete('/activities/delete/:id', authMiddleware, deleteActivity);

module.exports = router;