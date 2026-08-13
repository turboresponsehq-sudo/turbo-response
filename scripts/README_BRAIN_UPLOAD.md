# Brain System Administration

## Supported Access

Administrators manage Brain documents through the OAuth-protected Turbo Response interface at `/admin/brain`. The application sends the authenticated session cookie to compatible Brain REST routes; static browser access tokens are retired.

## Required Server Configuration

The Render service requires the Supabase URL and service-role credential for the Brain document store. Configure those values only in Render environment settings. Do not place service credentials or access tokens in scripts, documentation, or source code.

## Operating Procedure

1. Sign in through Manus OAuth.
2. Open the Brain administration page from Command Center.
3. Upload supported files, review indexing status, and manage documents from the authenticated page.
4. Verify that the requested document appears in the managed document list.

Use the administrative interface rather than unauthenticated command-line requests. The legacy static-token flow is intentionally removed.
