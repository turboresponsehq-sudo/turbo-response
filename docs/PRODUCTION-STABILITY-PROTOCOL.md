# TurboResponseHQ Production Stability Protocol

**Adopted:** 2026-02-15  
**Goal:** No surprises for paid clients. No silent failures. Proof every day.

---

## Rule 1: Single Source of Truth

**Truth field:** `payment_status`  
**Derived field:** `payment_verified` (auto-synced server-side, never authoritative)

**Invariant:**
- If `payment_status = 'paid'` → access allowed
- If `portal_enabled = false` → access denied
- No other condition can block a paid user

**Enforcement:**
- Server-side: `clientAuthController.js` computes `access_granted` field
- Frontend: `ClientPortal.tsx` uses OR logic as defense-in-depth
- All write endpoints sync both fields atomically

---

## Rule 2: Drift Guard

**Endpoint:** `GET /api/admin/drift-check`

**Behavior:**
1. Queries: `WHERE payment_status = 'paid' AND payment_verified != true`
2. If count > 0: auto-fixes AND returns `DRIFT_DETECTED` status
3. If count = 0: returns `clean` status

**Schedule:** Can be called manually or via cron. Auto-fixes on detection.

---

## Rule 3: Proof-First Deploy Standard

**Every production deploy must verify:**

```bash
# 1. Health check
curl https://turboresponsehq.ai/api/health
# Expected: {"status":"ok"}

# 2. Version beacon
curl https://turboresponsehq.ai/api/version
# Expected: git_sha matches deployed commit

# 3. Smoke test
curl https://turboresponsehq.ai/api/smoke-test
# Expected: {"overall":"PASS"}

# 4. Drift check
curl https://turboresponsehq.ai/api/admin/drift-check
# Expected: {"status":"clean"}
```

---

## Rule 4: Incident Mode

**SEV1 Triggers:**
- Paid client blocked
- Portal route 404/500
- Daily email not delivered

**Required report:** See `docs/INCIDENT-TEMPLATE.md`

---

## Rule 5: Daily Email Reliability

- Always send something daily (even "No updates today")
- Email includes Proof Block: SendGrid message ID, delivered status, source count
- Failure creates GitHub issue automatically

---

## Rule 6: No Guessing

If there is no proof, it is not real.

- No "should be fixed"
- No "probably caching"
- Only: logs, curl output, DB row snapshot, SendGrid events, commit SHA
