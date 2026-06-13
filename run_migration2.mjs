import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);

const sqls = [
  "ALTER TABLE `projects` ADD COLUMN `driveUrl` varchar(1000) NULL",
  `CREATE TABLE IF NOT EXISTS \`dashboard_leads\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`name\` varchar(255) NOT NULL,
    \`status\` enum('new','reviewing','follow_up','converted','closed') NOT NULL DEFAULT 'new',
    \`note\` varchar(500) NULL,
    \`hubspotUrl\` varchar(1000) NULL,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`dashboard_leads_id\` PRIMARY KEY(\`id\`)
  )`
];

for (const sql of sqls) {
  try {
    await conn.execute(sql);
    console.log('OK:', sql.slice(0, 60));
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('already exists') || e.message.includes('Duplicate column')) {
      console.log('Already exists (skipped):', sql.slice(0, 60));
    } else {
      console.error('ERROR:', e.message);
    }
  }
}
await conn.end();
console.log('Migration done!');
