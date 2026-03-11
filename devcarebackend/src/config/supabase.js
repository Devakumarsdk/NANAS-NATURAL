const { Pool } = require('pg');

let supabasePool = null;
let supabaseReady = false;
let supabaseError = null;

const buildSupabaseUrlFromParts = () => {
  const projectRef = (process.env.SUPABASE_PROJECT_REF || '').trim();
  const password = (process.env.SUPABASE_DB_PASSWORD || '').trim();
  if (!projectRef || !password) return '';

  const user = encodeURIComponent((process.env.SUPABASE_DB_USER || 'postgres').trim());
  const dbName = encodeURIComponent((process.env.SUPABASE_DB_NAME || 'postgres').trim());
  const host = (process.env.SUPABASE_DB_HOST || `db.${projectRef}.supabase.co`).trim();
  const port = Number(process.env.SUPABASE_DB_PORT || 5432);
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
};

const getSupabaseConnectionString = () => {
  return (
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    buildSupabaseUrlFromParts() ||
    ''
  );
};

const isSupabaseConfigured = () => Boolean(getSupabaseConnectionString());

const createPool = () => {
  const connectionString = getSupabaseConnectionString();
  if (!connectionString) return null;

  const shouldUseSsl = process.env.SUPABASE_POOL_SSL !== 'false';
  return new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    max: Number(process.env.SUPABASE_POOL_MAX || 10),
  });
};

const connectSupabase = async () => {
  if (!isSupabaseConfigured()) {
    supabaseReady = false;
    supabaseError = 'Set SUPABASE_DB_URL or DATABASE_URL, or set SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD';
    return { connected: false, skipped: true, reason: supabaseError };
  }

  try {
    if (!supabasePool) {
      supabasePool = createPool();
    }

    await supabasePool.query('select 1 as ok');
    supabaseReady = true;
    supabaseError = null;
    return { connected: true, skipped: false };
  } catch (err) {
    supabaseReady = false;
    supabaseError = err.message || 'Failed to connect to Supabase';
    return { connected: false, skipped: false, reason: supabaseError };
  }
};

const getSupabaseStatus = () => ({
  configured: isSupabaseConfigured(),
  connected: supabaseReady,
  error: supabaseError,
});

const ensureSupabaseNotesTable = async () => {
  if (!supabasePool) return { ok: false, skipped: true, reason: 'Supabase pool not initialized' };

  await supabasePool.query(`
    create table if not exists public.notes (
      id bigserial primary key,
      title text not null,
      content text not null default '',
      created_at timestamptz not null default now()
    );
  `);

  return { ok: true };
};

module.exports = {
  connectSupabase,
  getSupabaseStatus,
  isSupabaseConfigured,
  ensureSupabaseNotesTable,
  getSupabasePool: () => supabasePool,
};
