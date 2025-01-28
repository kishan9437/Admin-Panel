const express = require('express');
const router = express.Router();
const UrlActivity = require('../../controllers/admin/UrlActivity-controller')

router.get('/url-activity', UrlActivity);

module.exports = router;