const express = require('express');
const router = express.Router();
const { getSupabasePool, getSupabaseStatus } = require('../config/supabase');

router.get('/', async (req, res) => {
  try {
    const status = getSupabaseStatus();
    if (!status.connected) {
      return res.status(503).json({
        success: false,
        message: 'Supabase Postgres is not connected',
        supabase: status,
      });
    }

    const pool = getSupabasePool();
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const result = await pool.query(
      'select id, title, content, created_at from public.notes order by created_at desc limit $1',
      [limit]
    );

    return res.json({ success: true, count: result.rows.length, notes: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const status = getSupabaseStatus();
    if (!status.connected) {
      return res.status(503).json({
        success: false,
        message: 'Supabase Postgres is not connected',
        supabase: status,
      });
    }

    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const pool = getSupabasePool();
    const result = await pool.query(
      `insert into public.notes (title, content)
       values ($1, $2)
       returning id, title, content, created_at`,
      [title, content]
    );

    return res.status(201).json({ success: true, note: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
