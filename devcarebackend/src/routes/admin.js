const express = require('express');
const router = express.Router();
const { Order, Product, User, Review } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue,
      totalUsers, monthUsers,
      totalProducts, lowStockProducts,
      pendingOrders, pendingReviews
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lt: 10 }, isActive: true }),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed'] } }),
      Review.countDocuments({ isApproved: false }),
    ]);

    // Revenue chart (last 6 months)
    const revenueChart = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top products by sales
    const topProducts = await Product.find({ isActive: true }).sort('-soldCount').limit(5).select('name soldCount price images');

    // Recent orders
    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user', 'name email');

    res.json({
      success: true,
      stats: {
        totalOrders, monthOrders, lastMonthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        totalUsers, monthUsers,
        totalProducts, lowStockProducts,
        pendingOrders, pendingReviews
      },
      revenueChart,
      topProducts,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/analytics/sales
router.get('/analytics/sales', protect, adminOnly, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/low-stock
router.get('/low-stock', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 10 }, isActive: true })
      .select('name stock sku brand')
      .sort('stock');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
