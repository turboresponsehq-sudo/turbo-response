/**
 * Migration 015: Sync payment_verified with payment_status
 * 
 * Fixes field drift where payment_status='paid' but payment_verified=false.
 * Sets payment_verified=true for all records where payment_status='paid'.
 * This is a one-time data fix to resolve the dual-field inconsistency.
 */

export const id = '015_sync_payment_verified';

export async function up(db) {
  console.log('🔄 Syncing payment_verified with payment_status...');
  
  // First, count affected records
  const countResult = await db.query(
    `SELECT COUNT(*) as count FROM cases WHERE payment_status = 'paid' AND (payment_verified = false OR payment_verified IS NULL)`
  );
  const affectedCount = countResult.rows[0].count;
  console.log(`📊 Found ${affectedCount} records with payment_status='paid' but payment_verified!=true`);
  
  if (affectedCount > 0) {
    // Sync payment_verified for all paid cases
    const result = await db.query(
      `UPDATE cases 
       SET payment_verified = true,
           payment_verified_at = COALESCE(payment_verified_at, updated_at, NOW())
       WHERE payment_status = 'paid' AND (payment_verified = false OR payment_verified IS NULL)`
    );
    console.log(`✅ Updated ${result.rowCount} records: payment_verified synced to true`);
  } else {
    console.log('✅ No records need syncing');
  }
}
