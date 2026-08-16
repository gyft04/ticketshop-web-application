'use strict';
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// IMPORTANT: more specific routes BEFORE param routes
router.get('/:sessionId', cartController.getCart);
router.post('/', cartController.addItem);
router.delete('/item/:id', cartController.removeItem);
router.delete('/session/:sessionId', cartController.clearCart);

module.exports = router;
