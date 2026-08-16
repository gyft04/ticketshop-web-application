const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, ordersController.createOrder);
router.get('/', authMiddleware, ordersController.getOrders);
router.get('/my', authMiddleware, ordersController.getOrders);
router.get('/:id', authMiddleware, ordersController.getOrderById);

module.exports = router;