const Order = require('../models/orderModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      email,
      phone,
      address,
      city,
      district,
      postalCode,
      notes,
      paymentMethod,
      transactionId,
      items,
      subtotal,
      shipping,
      discount,
      total,
      couponApplied,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      orderId,
      customerName,
      email,
      phone,
      address,
      city,
      district,
      postalCode,
      notes,
      paymentMethod,
      transactionId,
      items,
      subtotal,
      shipping,
      discount,
      total,
      couponApplied,
      isPaid: paymentMethod === 'card', // Mark as paid if card payment
      paidAt: paymentMethod === 'card' ? Date.now() : null,
    });

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by email
// @route   GET /api/orders/user/:email
// @access  Public
const getOrdersByEmail = async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.transactionId = req.body.transactionId || order.transactionId;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (order) {
      order.status = req.body.status;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByEmail,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
}; 