'use strict';
const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const guard = [authMiddleware, requireRole('organizer', 'admin')];

router.get('/events', ...guard, eventsController.getMyEvents);
router.post('/events', ...guard, eventsController.createEvent);
router.put('/events/:id', ...guard, eventsController.updateEvent);
router.delete('/events/:id', ...guard, eventsController.deleteEvent);

module.exports = router;
