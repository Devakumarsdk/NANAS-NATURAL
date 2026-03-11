// wishlist.js
const express = require('express');
const router = express.Router();
const { Wishlist } = require('../models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name images price discountPrice ratings slug brand');
    res.json({ success: true, wishlist: wishlist || { products: [] } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
    const idx = wishlist.products.indexOf(req.params.productId);
    if (idx > -1) { wishlist.products.splice(idx, 1); }
    else { wishlist.products.push(req.params.productId); }
    await wishlist.save();
    res.json({ success: true, inWishlist: idx === -1 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
