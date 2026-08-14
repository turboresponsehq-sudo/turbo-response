import crypto from "node:crypto";
import { google } from "googleapis";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const CANONICAL_FOLDER_ID = "1DFOON2HGxRc-fWtswTpLpBlXvsBfxX4r";
const CALLBACK_PATH = "/api/integrations/google-drive/oauth/callback";

type OAuthConnectionRow = {
  refresh_token_ciphertext: string;
  scopes: string;
  folder_id: string;
};

function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || "https://turboresponsehq.ai").replace(/\/$/, "");
}

export function getGoogleDriveOAuthRedirectUri() {
  return `${getAppBaseUrl()}${CALLBACK_PATH}`;
}

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required to encrypt the Google Drive OAuth refresh token");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptGoogleDriveRefreshToken(refreshToken: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(refreshToken, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64url"), authTag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptGoogleDriveRefreshToken(payload: string) {
  const [ivValue, tagValue, ciphertextValue] = payload.split(".");
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error("Stored Google Drive OAuth token format is invalid");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google Drive OAuth client is not configured");
  return new google.auth.OAuth2(clientId, clientSecret, getGoogleDriveOAuthRedirectUri());
}

export function isGoogleDriveOAuthClientConfigured() {
  return Boolean(process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID && process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET);
}

function stateHash(state: string) {
  return crypto.createHash("sha256").update(state).digest("hex");
}

export async function beginGoogleDriveOAuth(userId: number | null | undefined) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for the Google Drive OAuth flow");
  const state = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS).toISOString();
  await db.execute(sql`
    DELETE FROM google_drive_oauth_states WHERE expires_at < NOW();
  `);
  await db.execute(sql`
    INSERT INTO google_drive_oauth_states (state_hash, initiated_by_user_id, expires_at)
    VALUES (${stateHash(state)}, ${userId ?? null}, ${expiresAt}::timestamptz)
  `);
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: [DRIVE_READONLY_SCOPE],
    state,
  });
}

async function consumeGoogleDriveOAuthState(state: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for the Google Drive OAuth callback");
  const result = await db.execute(sql`
    DELETE FROM google_drive_oauth_states
    WHERE state_hash = ${stateHash(state)} AND expires_at > NOW()
    RETURNING initiated_by_user_id
  `);
  const rows: unknown[] = (result as any).rows ?? (result as any);
  if (!rows.length) throw new Error("Google Drive OAuth state is invalid or expired");
}

async function getStoredGoogleDriveOAuthConnection(): Promise<OAuthConnectionRow | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.execute(sql`
      SELECT refresh_token_ciphertext, scopes, folder_id
      FROM google_drive_oauth_connections
      WHERE id = 1
      LIMIT 1
    `);
    const rows: OAuthConnectionRow[] = (result as any).rows ?? (result as any);
    return rows[0] ?? null;
  } catch (error: any) {
    if (error?.code === "42P01") return null;
    throw error;
  }
}

export async function completeGoogleDriveOAuth(code: string, state: string) {
  await consumeGoogleDriveOAuthState(state);
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  const existing = await getStoredGoogleDriveOAuthConnection();
  const refreshToken = tokens.refresh_token || (existing ? decryptGoogleDriveRefreshToken(existing.refresh_token_ciphertext) : null);
  if (!refreshToken) throw new Error("Google did not return a refresh token; reconnect and approve the requested consent");

  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for the Google Drive OAuth token store");
  await db.execute(sql`
    INSERT INTO google_drive_oauth_connections (id, refresh_token_ciphertext, scopes, folder_id, authorized_at, updated_at)
    VALUES (1, ${encryptGoogleDriveRefreshToken(refreshToken)}, ${tokens.scope || DRIVE_READONLY_SCOPE}, ${process.env.GOOGLE_DRIVE_FOLDER_ID || CANONICAL_FOLDER_ID}, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      refresh_token_ciphertext = EXCLUDED.refresh_token_ciphertext,
      scopes = EXCLUDED.scopes,
      folder_id = EXCLUDED.folder_id,
      updated_at = NOW()
  `);
}

export async function getGoogleDriveOAuthAuthClient() {
  const connection = await getStoredGoogleDriveOAuthConnection();
  if (!connection || !isGoogleDriveOAuthClientConfigured()) return null;
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: decryptGoogleDriveRefreshToken(connection.refresh_token_ciphertext) });
  return client;
}

export async function getGoogleDriveOAuthStatus() {
  const connection = await getStoredGoogleDriveOAuthConnection();
  return {
    clientConfigured: isGoogleDriveOAuthClientConfigured(),
    connected: Boolean(connection && isGoogleDriveOAuthClientConfigured()),
    folderId: connection?.folder_id ?? process.env.GOOGLE_DRIVE_FOLDER_ID ?? null,
  };
}

export function getGoogleDriveOAuthCallbackPath() {
  return CALLBACK_PATH;
}
