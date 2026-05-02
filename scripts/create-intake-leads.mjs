/**
 * Targeted migration: create intake_leads table only
 * Run with: node scripts/create-intake-leads.mjs
 */
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS \`intake_leads\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`fullName\` varchar(255) NOT NULL,
  \`email\` varchar(320) NOT NULL,
  \`phone\` varchar(100),
  \`socialHandle\` varchar(255),
  \`situationPreview\` text,
  \`fullSituation\` longtext,
  \`source\` varchar(50) NOT NULL DEFAULT 'intake',
  \`status\` enum('new_lead','reviewing','follow_up','converted') NOT NULL DEFAULT 'new_lead',
  \`adminNotes\` longtext,
  \`submittedAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`intake_leads_id\` PRIMARY KEY(\`id\`)
);
`;

const conn = await mysql.createConnection(DATABASE_URL);
try {
  await conn.execute(sql);
  console.log("✅ intake_leads table created (or already exists)");
} catch (err) {
  console.error("❌ Error:", err.message);
} finally {
  await conn.end();
}
