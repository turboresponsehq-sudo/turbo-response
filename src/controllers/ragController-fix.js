// Replace query() with getSupabaseDB() helper
const { getSupabaseDB } = require('../services/supabase/client');

async function supabaseQuery(sql, params) {
  // This is a wrapper to convert PostgreSQL-style queries to Supabase
  // For now, we'll use Supabase client directly in each function
  throw new Error('Use Supabase client directly');
}

module.exports = { supabaseQuery };
