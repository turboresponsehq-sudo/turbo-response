/**
 * Run Consumer Defense Tables Migration
 * Executes add_consumer_defense_tables.sql
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  console.log('🚀 Starting Consumer Defense Tables Migration...\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'migrations', 'add_consumer_defense_tables.sql');
  console.log(`📄 Reading SQL from: ${sqlPath}`);
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`✅ SQL file loaded (${sql.length} characters)\n`);

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL\n');

    console.log('⚙️  Executing migration SQL...');
    await client.query(sql);
    console.log('✅ Migration executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('case_analyses', 'draft_letters', 'admin_notifications')
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    client.release();
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
