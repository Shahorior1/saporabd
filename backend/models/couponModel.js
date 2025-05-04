const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed', 'shipping'],
    },
    value: {
      type: Number,
      required: function() {
        return this.type !== 'shipping';
      }
    },
    minSpend: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    timesUsed: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon; 