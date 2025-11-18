/**
 * Migration Runner
 * Automatically runs all pending migrations on server startup
 */

import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database for migrations');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of already applied migrations
    const appliedResult = await client.query(
      'SELECT migration_name FROM schema_migrations'
    );
    const appliedMigrations = new Set(
      appliedResult.rows.map(row => row.migration_name)
    );

    // Get all migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.match(/^\d{3}_.*\.mjs$/) && file !== 'run-migrations.mjs')
      .sort();

    console.log(`📋 Found ${migrationFiles.length} migration(s)`);

    // Run pending migrations
    for (const file of migrationFiles) {
      const migrationName = file.replace('.mjs', '');
      
      if (appliedMigrations.has(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already applied)`);
        continue;
      }

      console.log(`🔄 Running ${migrationName}...`);
      
      const migrationModule = await import(`./${file}`);
      await migrationModule.up(client);
      
      // Mark as applied
      await client.query(
        'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
        [migrationName]
      );
      
      console.log(`✅ Completed ${migrationName}`);
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigrations;
