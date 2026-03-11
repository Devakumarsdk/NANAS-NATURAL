// ============ CART ROUTE ============
const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models');
const { protect } = require('../middleware/auth');

// GET cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock slug brand');
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ADD to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId && i.variant === variant);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, variant, price: product.discountPrice || product.price });
    }
    await cart.save();
    await cart.populate('items.product', 'name images price discountPrice stock slug brand');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// UPDATE quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity, variant } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.find(i => i.product.toString() === productId && i.variant === variant);
    if (item) { item.quantity = quantity; }
    await cart.save();
    await cart.populate('items.product', 'name images price discountPrice stock slug brand');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// REMOVE from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
      await cart.save();
    }
    await cart.populate('items.product', 'name images price discountPrice stock slug brand');
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// CLEAR cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
