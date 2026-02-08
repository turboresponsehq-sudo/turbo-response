/**
 * Migration: Add screenshot-to-Brain tracking columns
 * 
 * Adds columns to track which screenshots have been sent to the Brain system
 * and link them to their corresponding brain_documents entries.
 */

import pg from 'pg';
const { Pool } = pg;

export async function up() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query(`
      ALTER TABLE screenshots
      ADD COLUMN IF NOT EXISTS in_brain BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS brain_document_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sent_to_brain_at TIMESTAMP;
      
      CREATE INDEX IF NOT EXISTS idx_screenshots_in_brain ON screenshots(in_brain);
      CREATE INDEX IF NOT EXISTS idx_screenshots_brain_document_id ON screenshots(brain_document_id);
    `);
    
    console.log('[Migration 014] Added screenshot-to-Brain tracking columns');
  } finally {
    await pool.end();
  }
}

export async function down() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query(`
      DROP INDEX IF EXISTS idx_screenshots_brain_document_id;
      DROP INDEX IF EXISTS idx_screenshots_in_brain;
      
      ALTER TABLE screenshots
      DROP COLUMN IF EXISTS sent_to_brain_at,
      DROP COLUMN IF EXISTS brain_document_id,
      DROP COLUMN IF EXISTS in_brain;
    `);
    
    console.log('[Migration 014] Removed screenshot-to-Brain tracking columns');
  } finally {
    await pool.end();
  }
}
