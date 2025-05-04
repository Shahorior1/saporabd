const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrdersByEmail,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
router.post('/', createOrder);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', getOrders);

// @route   GET /api/orders/user/:email
// @desc    Get orders by user email
// @access  Public
router.get('/user/:email', getOrdersByEmail);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Public
router.put('/:id/pay', updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', updateOrderStatus);

module.exports = router; 