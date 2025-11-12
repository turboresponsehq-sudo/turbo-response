const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n🚀 Starting Usage Tracking Migration...\n');

  const sqlPath = path.join(__dirname, 'migrations', 'add_usage_tracking.sql');
  console.log(`📄 Reading SQL from: ${sqlPath}`);
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`✅ SQL file loaded (${sql.length} characters)\n`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔌 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL\n');

    console.log('⚙️  Executing migration SQL...');
    await pool.query(sql);
    console.log('✅ Migration executed successfully!\n');

    console.log('🔍 Verifying tables...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('ai_usage_logs', 'admin_settings')
      ORDER BY table_name
    `);

    console.log('📊 Tables created:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
