# Brain Administration Access

## Supported Access Model

Brain document administration uses the Turbo Response Manus OAuth session. The administrative browser page and the compatible Brain REST routes require an authenticated user with the `admin` role. Browser-supplied static access tokens are retired and must not be used.

## Operating Procedure

1. Sign in to Turbo Response through the supported OAuth flow.
2. Open `/admin/brain` from the Command Center.
3. Upload, review, index, or remove Brain documents through the protected interface.
4. Investigate authorization failures by verifying the OAuth session and user role rather than adding client-side tokens.

## Service Configuration

The server continues to require the Supabase service configuration for Brain document storage and metadata access. Those credentials belong only in Render environment settings and must never be committed to the repository.
