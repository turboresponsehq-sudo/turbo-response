import pg from 'pg';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const dir = '/home/ubuntu/money-bosses-staging';
await mkdir(dir, { recursive: true, mode: 0o700 });
let secrets;
try { secrets = JSON.parse(await readFile(`${dir}/secrets.json`, 'utf8')); }
catch { secrets = { dbPassword: randomBytes(32).toString('hex'), jwtSecret: randomBytes(48).toString('hex'), adminEmail: 'mb-staging-owner@example.invalid', adminPassword: randomBytes(18).toString('base64url') }; }
await writeFile(`${dir}/secrets.json`, JSON.stringify(secrets), { mode: 0o600 });
const socket = new pg.Client({ host: `${dir}/socket`, port: 55432, database: 'money_bosses_staging', user: 'ubuntu' });
await socket.connect();
await socket.query(`ALTER ROLE ubuntu PASSWORD '${secrets.dbPassword}'`);
await socket.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL, full_name TEXT, password_hash TEXT); ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT; ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT; CREATE TABLE IF NOT EXISTS schema_migrations(migration_name TEXT PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
const password = await bcrypt.hash(secrets.adminPassword, 10);
await socket.query(`INSERT INTO users(email,role,full_name,password_hash) VALUES ($1,'admin','Money Bosses Isolated Staging',$2) ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,full_name=EXCLUDED.full_name`,[secrets.adminEmail,password]);
const url = `postgresql://ubuntu:${secrets.dbPassword}@127.0.0.1:55432/money_bosses_staging`;
await writeFile(`${dir}/runtime.env`, `export DATABASE_URL='${url}'\nexport JWT_SECRET='${secrets.jwtSecret}'\nexport MB_ARCHIVE_STORAGE_DIR='${dir}/media'\nexport PORT=3004\nexport MONEY_BOSSES_DEV_ORIGIN='https://3004-ikxczl2n4gl61dsmk7yof-a46ef21c.us5.manus.computer'\n`, {mode:0o600});
await socket.end();
console.log('Isolated staging admin fixture and runtime configuration prepared; secrets remain outside Git.');
