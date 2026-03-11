require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const { connectSupabase, getSupabasePool } = require('./config/supabase');

const COLLECTIONS = [
  'users',
  'categories',
  'products',
  'reviews',
  'orders',
  'carts',
  'wishlists',
  'coupons',
];

const qIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

const ensureMirrorTable = async (pool, tableName) => {
  const sql = `
    create table if not exists public.${qIdent(tableName)} (
      id bigserial primary key,
      mongo_id text not null unique,
      document jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;
  await pool.query(sql);
};

const upsertDoc = async (pool, tableName, mongoId, document) => {
  const sql = `
    insert into public.${qIdent(tableName)} (mongo_id, document)
    values ($1, $2::jsonb)
    on conflict (mongo_id)
    do update set
      document = excluded.document,
      updated_at = now();
  `;
  await pool.query(sql, [mongoId, JSON.stringify(document)]);
};

const fetchMongoDocs = async (collectionName) => {
  return mongoose.connection.collection(collectionName).find({}).toArray();
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  console.log('[MIGRATE] Connecting MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[MIGRATE] MongoDB connected');

  const supabase = await connectSupabase();
  if (!supabase.connected) {
    throw new Error(`Supabase not connected: ${supabase.reason || 'unknown error'}`);
  }
  const pool = getSupabasePool();
  if (!pool) throw new Error('Supabase pool is not initialized');
  console.log('[MIGRATE] Supabase connected');

  const summary = [];

  for (const collectionName of COLLECTIONS) {
    const tableName = `mongo_${collectionName}`;
    await ensureMirrorTable(pool, tableName);
    const docs = await fetchMongoDocs(collectionName);

    let upserted = 0;
    for (const doc of docs) {
      const mongoId = String(doc._id);
      await upsertDoc(pool, tableName, mongoId, doc);
      upserted += 1;
    }

    summary.push({ collectionName, tableName, count: docs.length, upserted });
    console.log(`[MIGRATE] ${collectionName} -> ${tableName}: ${upserted}`);
  }

  console.log('[MIGRATE] Completed');
  console.log(JSON.stringify(summary, null, 2));
};

main()
  .catch((err) => {
    console.error('[MIGRATE] Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
