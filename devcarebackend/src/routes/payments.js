const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const crypto = require('crypto');
const { Order } = require('../models');
const { protect } = require('../middleware/auth');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const toJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return { json: JSON.parse(text), raw: text };
  } catch {
    return { json: null, raw: text };
  }
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return false;
  const data = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return expected === razorpaySignature;
};

// @POST /api/payments/stripe/create-intent
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured on server' });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentMethod !== 'stripe') {
      return res.status(400).json({ success: false, message: 'Invalid payment method for this order' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.pricing.total * 100),
      currency: 'inr',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    });

    order.paymentDetails = { ...order.paymentDetails, stripePaymentIntentId: paymentIntent.id };
    await order.save();

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/stripe-webhook
router.post('/stripe-webhook', async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ success: false, message: 'Stripe webhook is not configured on server' });
    }
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        $push: { statusHistory: { status: 'confirmed', message: 'Payment received via Stripe' } },
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @POST /api/payments/razorpay/create-order
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json({ success: false, message: 'Invalid payment method for this order' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on server' });
    }

    const createOrderUrl = 'https://api.razorpay.com/v1/orders';

    const payload = {
      amount: Math.round(order.pricing.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    };

    const response = await fetch(createOrderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
    });

    const { json, raw } = await toJsonSafely(response);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: json?.error?.description || json?.message || 'Failed to create Razorpay order',
        upstream: raw,
      });
    }

    const razorpayOrder = json || {};
    if (!razorpayOrder.id) {
      return res.status(502).json({ success: false, message: 'Razorpay response missing order id', upstream: json || raw });
    }

    order.paymentDetails = {
      ...order.paymentDetails,
      razorpayOrderId: razorpayOrder.id,
      razorpayStatus: razorpayOrder.status || 'created',
    };
    await order.save();

    res.json({
      success: true,
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.shippingAddress?.name || req.user.name || '',
        email: req.user.email || '',
        contact: order.shippingAddress?.phone || req.user.phone || '',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/razorpay/verify
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.paymentMethod !== 'razorpay') {
      return res.status(400).json({ success: false, message: 'Invalid payment method for this order' });
    }

    const expectedRazorpayOrderId = order.paymentDetails?.razorpayOrderId;
    if (!expectedRazorpayOrderId || razorpayOrderId !== expectedRazorpayOrderId) {
      return res.status(400).json({ success: false, message: 'Razorpay order mismatch' });
    }

    if (!verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
      return res.status(400).json({ success: false, message: 'Invalid Razorpay signature' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      'paymentDetails.razorpayOrderId': razorpayOrderId,
      'paymentDetails.razorpayPaymentId': razorpayPaymentId || '',
      'paymentDetails.razorpaySignature': razorpaySignature || '',
      'paymentDetails.razorpayStatus': 'paid',
      $push: { statusHistory: { status: 'confirmed', message: 'Payment received via Razorpay' } },
    }, { new: true });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/cod/confirm
router.post('/cod/confirm', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) return res.status(404).json({ success: false, message: 'Order not found' });
    if (existingOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (existingOrder.paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Invalid payment method for this order' });
    }

    const order = await Order.findByIdAndUpdate(orderId, {
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      $push: { statusHistory: { status: 'confirmed', message: 'Cash on Delivery order confirmed' } },
    }, { new: true });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
