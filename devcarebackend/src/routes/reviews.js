// reviews.js
const express = require('express');
const router = express.Router();
const { Review, Product, Order } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, product });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    // Check verified purchase
    const order = await Order.findOne({ user: req.user._id, 'items.product': product, paymentStatus: 'paid' });
    const review = await Review.create({
      user: req.user._id, product, rating, title, comment,
      isVerifiedPurchase: !!order, isApproved: true,
    });
    // Update product ratings
    const reviews = await Review.find({ product, isApproved: true });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { ratings: avg.toFixed(1), numReviews: reviews.length });
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
