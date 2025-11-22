/**
 * Supabase Client Module
 * 
 * Dedicated client for Turbo Brain System
 * Uses Supabase for document storage and metadata
 * 
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

/**
 * Get or create Supabase client instance
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('[Supabase] Client initialized for Turbo Brain System');
  return supabaseClient;
}

/**
 * Get Supabase Storage bucket for Brain documents
 * @returns {import('@supabase/supabase-js').StorageFileApi}
 */
function getBrainBucket() {
  const client = getSupabaseClient();
  return client.storage.from('brain-docs');
}

/**
 * Get Supabase database client
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseDB() {
  return getSupabaseClient();
}

module.exports = {
  getSupabaseClient,
  getBrainBucket,
  getSupabaseDB
};
