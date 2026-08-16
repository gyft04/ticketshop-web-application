const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', authMiddleware, requireRole('admin', 'organizer'), statsController.getStats);

module.exports = router;
