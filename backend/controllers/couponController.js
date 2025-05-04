const Coupon = require('../models/couponModel');

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    }

    // Check if coupon is expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Check if coupon has usage limit and if it's exceeded
    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    // Check minimum spend requirement
    if (subtotal < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum spend of ৳${coupon.minSpend.toLocaleString()}`,
      });
    }

    // Calculate discount value
    let discountValue = 0;
    let discountType = coupon.type;

    if (coupon.type === 'percentage') {
      discountValue = (subtotal * coupon.value) / 100;
      
      // Check if there's a maximum discount cap
      if (coupon.maxDiscount !== null && discountValue > coupon.maxDiscount) {
        discountValue = coupon.maxDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discountValue = coupon.value;
    } else if (coupon.type === 'shipping') {
      discountType = 'shipping';
      discountValue = 0; // Shipping discount is handled differently
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: discountType,
        value: coupon.value,
        discountValue: Math.round(discountValue),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply a coupon (increment usage count)
// @route   POST /api/coupons/apply
// @access  Public
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    // Increment the timesUsed field
    coupon.timesUsed += 1;
    await coupon.save();

    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.remove();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateCoupon,
  applyCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
}; 