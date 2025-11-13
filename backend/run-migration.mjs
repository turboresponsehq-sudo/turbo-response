import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  try {
    // Use DATABASE_URI (Render) or DATABASE_URL (fallback)
    const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('No database connection string found');
    }
    
    console.log('🔗 Connecting to database...');
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('🔄 Running category constraint migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'fix_category_constraint.sql'),
      'utf8'
    );
    
    console.log('📝 SQL:', migrationSQL);
    
    // Run the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the constraint
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname = 'cases_category_check';
    `);
    
    console.log('✅ New constraint:', result.rows[0]);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
