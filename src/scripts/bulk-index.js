const { getSupabaseDB } = require('../services/supabase/client');
const { indexDocument } = require('../controllers/ragController');

async function bulkIndex() {
  const sb = getSupabaseDB();
  const { data, error } = await sb
    .from('brain_documents')
    .select('id')
    .or('indexing_status.in.(pending,failed),indexing_status.is.null');
  
  if (error) throw error;
  
  console.log(`Indexing ${data.length} documents...`);
  
  for (const doc of data) {
    try {
      console.log(`Indexing ${doc.id}...`);
      await indexDocument({ params: { id: doc.id } }, { 
        status: () => ({ json: () => {} }),
        json: () => {}
      }, () => {});
      console.log(`✓ ${doc.id}`);
    } catch (err) {
      console.error(`✗ ${doc.id}:`, err.message);
    }
  }
}

bulkIndex().catch(console.error);
