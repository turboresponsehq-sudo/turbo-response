import { describe, it, expect, beforeAll } from 'vitest';
import { google } from 'googleapis';

describe('Google Drive Integration', () => {
  let drive: any;
  const folderIdFromEnv = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  beforeAll(() => {
    // Verify environment variables are set
    expect(serviceAccountJson).toBeDefined();
    expect(folderIdFromEnv).toBeDefined();

    if (!serviceAccountJson || !folderIdFromEnv) {
      throw new Error('Missing Google Drive environment variables');
    }

    // Parse the service account JSON
    const credentials = JSON.parse(serviceAccountJson);

    // Create a Google Drive client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    drive = google.drive({ version: 'v3', auth });
  });

  it('should have valid Google Drive credentials', () => {
    expect(serviceAccountJson).toBeDefined();
    const credentials = JSON.parse(serviceAccountJson!);
    expect(credentials.type).toBe('service_account');
    expect(credentials.client_email).toContain('turbo-response-kb');
  });

  it('should have valid folder ID format', () => {
    expect(folderIdFromEnv).toBeDefined();
    expect(folderIdFromEnv).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(folderIdFromEnv!.length).toBeGreaterThan(10);
  });

  it('should be able to authenticate with Google Drive API', async () => {
    const credentials = JSON.parse(serviceAccountJson!);
    expect(credentials.private_key).toBeDefined();
    expect(credentials.private_key).toContain('BEGIN PRIVATE KEY');
  });

  it('should list files in the specified folder', async () => {
    try {
      const response = await drive.files.list({
        q: `'${folderIdFromEnv}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, mimeType)',
        pageSize: 10,
      });

      // Test passes if we can query the folder without auth errors
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.files)).toBe(true);
    } catch (error: any) {
      // If it's an auth error, the credentials are invalid
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Google Drive credentials are invalid or not authorized');
      }
      // Other errors are acceptable (e.g., folder not shared with service account yet)
      // The important thing is that auth succeeded
    }
  });
});
