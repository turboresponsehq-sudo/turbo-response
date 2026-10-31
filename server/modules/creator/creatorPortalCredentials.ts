/**
 * Creator-only persistent password access.
 * A one-use, 24-hour SMS/shareable invite is redeemed to set a password.
 * No consumer-case data, no plaintext passwords, no passwords in logs.
 */
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: any[] }).rows ?? [];
  }
  return [];
}
const hashInvitation = (token: string) => crypto.createHash("sha256").update(token, "utf8").digest("hex");
const makeVersion = () => crypto.randomBytes(24).toString("base64url");
const hashCost = 12;

export function validCreatorPassword(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 8 || Buffer.byteLength(value) > 72 || value.length > 72) return false;
  if (!value.trim() || ["password", "password1", "12345678", "123456789", "qwerty123", "11111111"].includes(value.toLowerCase())) return false;
  return true;
}

export async function ensureCreatorCredentialsSchema(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Creator credentials database unavailable");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS creator_portal_credentials (
      portal_id BIGINT PRIMARY KEY REFERENCES creator_portals(id) ON DELETE CASCADE,
      password_hash TEXT,
      session_version VARCHAR(64) NOT NULL,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_creator_portal_credentials_locked
    ON creator_portal_credentials (locked_until)
  `);
}

/** Invitation regeneration invalidates existing password + sessions for only that portal. */
export async function claimCreatorInvite(token: string, password: string): Promise<{ portalId: number; version: string } | null> {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token) || !validCreatorPassword(password)) return null;
  const db = await getDb();
  if (!db) throw new Error("Creator credentials database unavailable");
  const hash = await bcrypt.hash(password, hashCost);
  const version = makeVersion();
  return await db.transaction(async tx => {
    const response = await tx.execute(sql`
      UPDATE creator_portals SET status = 'active', last_access_at = NOW(), updated_at = NOW(),
        access_token_hash = NULL, token_expires_at = NULL
      WHERE access_token_hash = ${hashInvitation(token)}
        AND token_expires_at > NOW() AND status = 'invited'
      RETURNING id
    `);
    const portal = rowsOf(response)[0];
    if (!portal) return null;
    const portalId = Number(portal.id);
    await tx.execute(sql`
      INSERT INTO creator_portal_credentials (portal_id, password_hash, session_version, failed_attempts, locked_until)
      VALUES (${portalId}, ${hash}, ${version}, 0, NULL)
      ON CONFLICT (portal_id) DO UPDATE SET password_hash = EXCLUDED.password_hash,
        session_version = EXCLUDED.session_version, failed_attempts = 0,
        locked_until = NULL, updated_at = NOW()
    `);
    return { portalId, version };
  });
}

export async function invalidatePortalCredentials(portalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator credentials database unavailable");
  await db.execute(sql`
    INSERT INTO creator_portal_credentials (portal_id, password_hash, session_version, failed_attempts, locked_until)
    VALUES (${portalId}, NULL, ${makeVersion()}, 0, NULL)
    ON CONFLICT (portal_id) DO UPDATE SET password_hash = NULL,
      session_version = EXCLUDED.session_version, failed_attempts = 0,
      locked_until = NULL, updated_at = NOW()
  `);
}

export async function loginCreatorPassword(email: string, password: string): Promise<{ portalId: number; version: string } | null> {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length > 72) return null;
  const db = await getDb();
  if (!db) throw new Error("Creator credentials database unavailable");
  const result = await db.execute(sql`
    SELECT p.id, c.password_hash, c.session_version,
           c.failed_attempts, c.locked_until
    FROM creator_leads l
    JOIN creator_portals p ON p.creator_lead_id = l.id
    JOIN creator_portal_credentials c ON c.portal_id = p.id
    WHERE LOWER(l.email) = LOWER(${email.trim()}) AND p.status = 'active' AND c.password_hash IS NOT NULL
    LIMIT 2
  `);
  const candidates = rowsOf(result);
  if (candidates.length !== 1) return null;
  const record = candidates[0];
  const portalId = Number(record.id);
  if (record.locked_until && new Date(record.locked_until).getTime() > Date.now()) return null;
  const valid = await bcrypt.compare(password, String(record.password_hash));
  if (!valid) {
    await db.execute(sql`
      UPDATE creator_portal_credentials SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 5
          THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END,
        updated_at = NOW()
      WHERE portal_id = ${portalId}
    `);
    return null;
  }
  await db.execute(sql`
    UPDATE creator_portal_credentials SET failed_attempts = 0,
      locked_until = NULL, updated_at = NOW()
    WHERE portal_id = ${portalId}
  `);
  return { portalId, version: String(record.session_version) };
}

/** Null means a legacy invitation-only portal. Legacy sessions are kept intact. */
export async function checkCreatorSessionVersion(portalId: number, version: string | undefined): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.execute(sql`
    SELECT session_version FROM creator_portal_credentials WHERE portal_id = ${portalId} LIMIT 1
  `);
  const row = rowsOf(result)[0];
  if (!row) return true;
  return typeof version === "string" && version.length > 0 &&
    crypto.timingSafeEqual(Buffer.from(version.padEnd(64, "_").slice(0, 64)), Buffer.from(String(row.session_version).padEnd(64, "_").slice(0, 64)));
}
