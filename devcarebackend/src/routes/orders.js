// ============ ORDERS ROUTE ============
// Save as: src/routes/orders.js

const express = require('express');
const router = express.Router();
const { Order, Product, Coupon } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// @POST /api/orders - Place order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, isGift, giftMessage } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id, name: product.name,
        image: product.images[0]?.url,
        price, quantity: item.quantity, variant: item.variant,
        sku: product.sku,
      });
      // Reduce stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    let discount = 0;
    let couponInfo = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.validFrom <= new Date() && coupon.validUntil > new Date() && subtotal >= coupon.minOrderValue) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }
        const userUsage = coupon.usedBy.find((entry) => entry.user.toString() === req.user._id.toString());
        if (userUsage && userUsage.count >= coupon.userLimit) {
          return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        }

        discount = coupon.type === 'percentage'
          ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
          : coupon.value;
        couponInfo = { code: coupon.code, discount };

        if (userUsage) {
          userUsage.count += 1;
          userUsage.usedAt = new Date();
          coupon.usedCount += 1;
          await coupon.save();
        } else {
          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usedCount: 1 },
            $push: { usedBy: { user: req.user._id, usedAt: new Date(), count: 1 } }
          });
        }
      }
    }

    const shipping = subtotal - discount >= 499 ? 0 : 50;
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = subtotal - discount + shipping + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, discount, shipping, tax, total },
      coupon: couponInfo,
      paymentMethod,
      isGift, giftMessage,
      statusHistory: [{ status: 'placed', message: 'Order placed successfully' }]
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/my - Get user orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order after it has been shipped' });
    }
    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', message: req.body.reason || 'Cancelled by customer' });
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: GET all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(Number.parseInt(limit, 10) || 20, 1);
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = new RegExp(search, 'i');
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);
    res.json({ success: true, total, page: parsedPage, limit: parsedLimit, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, message, trackingNumber, carrier, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    order.statusHistory.push({ status, message: message || `Order ${status}` });
    if (trackingNumber) order.tracking = { trackingNumber, carrier, trackingUrl };
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete order
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Restore stock only when not already cancelled.
    if (order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity }
        });
      }
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
