# Shared Backend Admin Credential Remediation

## Completed in source control

The source-level administrator email/password comparison was removed from `server/_core/index.ts`. Admin login now requires `ADMIN_EMAIL` and a bcrypt `ADMIN_PASSWORD_HASH` from environment configuration. The unused `server/routes/setup-admin.ts` path was retired and returns `404`.

No credential values are documented here or committed to either Amani repository.

## Required Render completion before Amani intake is enabled

1. Generate a new administrator password in the approved password manager.
2. Generate its bcrypt hash locally or through an approved secrets workflow.
3. In the shared backend Render service, set `ADMIN_EMAIL` and replace `ADMIN_PASSWORD_HASH` with the new hash.
4. Deploy the security branch, then verify one administrator login using the new password.
5. Treat the prior hard-coded credential as retired immediately. Do not reuse it in any environment.

## Git history

The removed credential existed in prior commits of the shared repository. Do not force-rewrite a shared production repository without a coordinated maintenance window. Rotation is the immediate remediation; history rewrite can be evaluated separately after access and release coordination.
