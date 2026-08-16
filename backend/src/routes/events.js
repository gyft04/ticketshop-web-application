const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);
router.get('/:id/tickets', eventsController.getTicketsByEventId);
router.post('/', authMiddleware, requireRole('organizer', 'admin'), eventsController.createEvent);



module.exports = router;