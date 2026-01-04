/**
 * Script to create a case record for Katherine Martinez
 * She submitted an OFFENSE + BUSINESS intake but no case was created
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Generate unique case number
const generateCaseNumber = () => {
  const prefix = 'TR';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

async function createKatherineCase() {
  try {
    console.log('🔄 Creating case for Katherine Martinez...');

    const caseNumber = generateCaseNumber();
    const email = 'kreativemutants.studios@gmail.com';
    const fullName = 'Katherine Martinez';
    const businessName = 'Sona Flora Studios';
    const phone = '4044845798';
    const website = 'https://sonaflora.com';

    // First, check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    let userId = null;
    if (userResult.rows.length === 0) {
      console.log('📝 Creating user account...');
      const bcrypt = await import('bcrypt');
      const tempPassword = Math.random().toString(36).slice(-8);
      const password_hash = await bcrypt.default.hash(tempPassword, 10);

      const newUserResult = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role)
         VALUES ($1, $2, $3, $4, 'client')
         RETURNING id`,
        [email, password_hash, fullName, phone]
      );
      userId = newUserResult.rows[0].id;
      console.log(`✅ User created with ID: ${userId}`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`✅ User already exists with ID: ${userId}`);
    }

    // Create the case record
    console.log('📝 Creating case record...');
    const caseResult = await pool.query(
      `INSERT INTO cases (
        user_id, case_number, category, email, full_name, phone, 
        case_details, status, payment_status, funnel_stage, portal_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, case_number`,
      [
        userId,
        caseNumber,
        'consumer',  // Category (will be updated to offense/business in future)
        email,
        fullName,
        phone,
        `Business: ${businessName}\nWebsite: ${website}\nBusiness Type: Creative Studios`,
        'Pending Review',
        'unpaid',
        'Lead Submitted',
        false  // portal_enabled = false until admin approves
      ]
    );

    const caseId = caseResult.rows[0].id;
    const createdCaseNumber = caseResult.rows[0].case_number;

    console.log(`✅ Case created successfully!`);
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Case Number: ${createdCaseNumber}`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Business: ${businessName}`);
    console.log(`   Portal Access: DISABLED (awaiting admin approval)`);

    // Create timeline event
    await pool.query(
      `INSERT INTO case_timeline (case_id, event_type, description, created_at)
       VALUES ($1, 'case_created', 'Case created from business intake (OFFENSE + BUSINESS)', CURRENT_TIMESTAMP)`,
      [caseId]
    );

    console.log('\n✅ All done! Katherine Martinez now has a proper case record.');
    console.log(`\nNext steps:`);
    console.log(`1. Log in to admin portal`);
    console.log(`2. Find case ${createdCaseNumber}`);
    console.log(`3. Review and click "Mark as Paid" to activate`);
    console.log(`4. Katherine will receive login credentials`);

  } catch (error) {
    console.error('❌ Error creating case:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createKatherineCase();
