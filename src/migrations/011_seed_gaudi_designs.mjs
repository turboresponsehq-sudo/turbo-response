/**
 * Migration: Seed Gaudi Designs business case
 * Date: 2025-01-26
 * Purpose: Emergency fix - manually insert lost business case data
 * This case was submitted before business_intakes table existed
 */

export async function up(client) {
  console.log('📝 Seeding Gaudi Designs business case...');

  // Check if case already exists
  const existing = await client.query(
    `SELECT id FROM business_intakes WHERE business_name = $1 OR email = $2`,
    ['Gaudi Designs', 'vinkelty@nowthatsgaudi.com']
  );

  if (existing.rows.length > 0) {
    console.log('⏭️  Gaudi Designs case already exists, skipping...');
    return;
  }

  // Insert Gaudi Designs case
  await client.query(`
    INSERT INTO business_intakes (
      business_name,
      website_url,
      full_name,
      email,
      phone,
      what_you_sell,
      ideal_customer,
      biggest_struggle,
      short_term_goal,
      long_term_vision,
      status,
      portal_enabled,
      unread_messages_count,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    )
  `, [
    'Gaudi Designs',
    'https://www.Nowthatsgaudi.com',
    'Gaudi Designs',
    'vinkelty@nowthatsgaudi.com',
    '4046628185',
    'Carpentry services',
    'Homeowners and businesses', // ideal_customer - placeholder
    'Growing client base', // biggest_struggle - placeholder
    'Increase bookings', // short_term_goal - placeholder
    'Become top carpentry service in area', // long_term_vision - placeholder
    'pending',
    true, // portal_enabled
    0 // unread_messages_count
  ]);

  console.log('✅ Gaudi Designs case seeded successfully');
}

export async function down(client) {
  console.log('🗑️ Removing Gaudi Designs seed data...');
  
  await client.query(`
    DELETE FROM business_intakes 
    WHERE business_name = $1 OR email = $2
  `, ['Gaudi Designs', 'vinkelty@nowthatsgaudi.com']);
  
  console.log('✅ Seed data removed');
}
