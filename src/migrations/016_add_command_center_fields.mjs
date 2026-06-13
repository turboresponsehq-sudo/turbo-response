/**
 * Migration 016: Add Command Center fields to cases table
 *
 * Adds drive_folder_link, internal_notes, and priority columns
 * to support the Turbo Response Command Center dashboard.
 * Uses ADD COLUMN IF NOT EXISTS to be safe on re-runs.
 */
export const id = '016_add_command_center_fields';

export async function up(db) {
  console.log('🔄 Adding Command Center fields to cases table...');

  await db.query(`
    ALTER TABLE cases
      ADD COLUMN IF NOT EXISTS drive_folder_link TEXT,
      ADD COLUMN IF NOT EXISTS internal_notes TEXT,
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal'
  `);

  console.log('✅ Added drive_folder_link, internal_notes, priority to cases table');
}
