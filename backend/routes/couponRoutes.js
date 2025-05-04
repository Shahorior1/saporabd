const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  applyCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
} = require('../controllers/couponController');

// @route   POST /api/coupons/validate
// @desc    Validate a coupon
// @access  Public
router.post('/validate', validateCoupon);

// @route   POST /api/coupons/apply
// @desc    Apply a coupon (increment usage count)
// @access  Public
router.post('/apply', applyCoupon);

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', getCoupons);

// @route   POST /api/coupons
// @desc    Create a coupon
// @access  Private/Admin
router.post('/', createCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete('/:id', deleteCoupon);

module.exports = router; 