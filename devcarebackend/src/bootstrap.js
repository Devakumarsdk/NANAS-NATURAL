const mongoose = require('mongoose');
const { connectSupabase, ensureSupabaseNotesTable } = require('./config/supabase');

let initPromise = null;

const initializeDatabases = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[OK] MongoDB Connected');
      }

      const supabase = await connectSupabase();
      if (supabase.connected) {
        console.log('[OK] Supabase Postgres Connected');
        const init = await ensureSupabaseNotesTable();
        if (init.ok) console.log('[OK] Supabase notes table ready');
      } else if (supabase.skipped) {
        console.log('[INFO] Supabase Postgres not configured (set SUPABASE_DB_URL, or SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD)');
      } else {
        console.log(`[WARN] Supabase Postgres connection failed: ${supabase.reason}`);
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
};

module.exports = { initializeDatabases };
