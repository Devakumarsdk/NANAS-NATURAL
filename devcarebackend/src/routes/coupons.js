const express = require('express');
const router = express.Router();
const { Coupon } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// Validate coupon
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.validFrom > new Date()) return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
    if (coupon.validUntil < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order value is Rs. ${coupon.minOrderValue}` });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
    if (userUsage && userUsage.count >= coupon.userLimit) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }
    const discount = coupon.type === 'percentage'
      ? Math.min((cartTotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
      : coupon.value;
    res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin CRUD
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      code: req.body.code?.trim()?.toUpperCase(),
      value: Number(req.body.value),
      minOrderValue: Number(req.body.minOrderValue || 0),
      maxDiscount: req.body.maxDiscount === '' || req.body.maxDiscount === null || req.body.maxDiscount === undefined
        ? undefined
        : Number(req.body.maxDiscount),
    };

    if (!payload.code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }
    if (!payload.type || !['percentage', 'fixed'].includes(payload.type)) {
      return res.status(400).json({ success: false, message: 'Coupon type must be percentage or fixed' });
    }
    if (Number.isNaN(payload.value) || payload.value <= 0) {
      return res.status(400).json({ success: false, message: 'Coupon value must be greater than 0' });
    }
    if (payload.type === 'percentage' && payload.value > 100) {
      return res.status(400).json({ success: false, message: 'Percentage coupon value cannot exceed 100' });
    }
    if (Number.isNaN(payload.minOrderValue) || payload.minOrderValue < 0) {
      return res.status(400).json({ success: false, message: 'Minimum order value must be a non-negative number' });
    }
    if (payload.maxDiscount !== undefined && (Number.isNaN(payload.maxDiscount) || payload.maxDiscount < 0)) {
      return res.status(400).json({ success: false, message: 'Max discount must be a non-negative number' });
    }
    if (!payload.validFrom || !payload.validUntil) {
      return res.status(400).json({ success: false, message: 'validFrom and validUntil are required' });
    }
    if (new Date(payload.validFrom) > new Date(payload.validUntil)) {
      return res.status(400).json({ success: false, message: 'validFrom cannot be after validUntil' });
    }

    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    const status = err.name === 'ValidationError' || err.code === 11000 ? 400 : 500;
    res.status(status).json({ success: false, message: err.code === 11000 ? 'Coupon code already exists' : err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.code !== undefined) payload.code = payload.code.trim().toUpperCase();
    if (payload.value !== undefined) payload.value = Number(payload.value);
    if (payload.minOrderValue !== undefined) payload.minOrderValue = Number(payload.minOrderValue);
    if (payload.maxDiscount !== undefined) {
      payload.maxDiscount = payload.maxDiscount === '' || payload.maxDiscount === null
        ? undefined
        : Number(payload.maxDiscount);
    }
    if (payload.validFrom !== undefined && payload.validUntil !== undefined && new Date(payload.validFrom) > new Date(payload.validUntil)) {
      return res.status(400).json({ success: false, message: 'validFrom cannot be after validUntil' });
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (err) {
    const status = err.name === 'ValidationError' || err.code === 11000 ? 400 : 500;
    res.status(status).json({ success: false, message: err.code === 11000 ? 'Coupon code already exists' : err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/', protect, adminOnly, async (req, res) => {
  try {
    const result = await Coupon.deleteMany({});
    res.json({ success: true, message: `Deleted ${result.deletedCount} coupons` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;

