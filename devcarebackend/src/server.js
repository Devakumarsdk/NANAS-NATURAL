const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectSupabase, getSupabaseStatus, ensureSupabaseNotesTable } = require('./config/supabase');
require('dotenv').config({ override: true });

const app = express();

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman/curl) and configured frontend origins.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Stripe webhook needs raw body
app.use('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/supabase-notes', require('./routes/supabaseNotes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DEVCARE API is running',
    timestamp: new Date(),
    database: {
      mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      supabase: getSupabaseStatus(),
    },
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect MongoDB & Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[OK] MongoDB Connected');

    const supabase = await connectSupabase();
    if (supabase.connected) {
      console.log('[OK] Supabase Postgres Connected');
      const init = await ensureSupabaseNotesTable();
      if (init.ok) {
        console.log('[OK] Supabase notes table ready');
      }
    } else if (supabase.skipped) {
      console.log('[INFO] Supabase Postgres not configured (set SUPABASE_DB_URL, or SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD)');
    } else {
      console.log(`[WARN] Supabase Postgres connection failed: ${supabase.reason}`);
    }

    app.listen(PORT, () => {
      console.log(`[OK] DEVCARE Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[ERROR] MongoDB Connection Error:', err);
    process.exit(1);
  });

module.exports = app;

