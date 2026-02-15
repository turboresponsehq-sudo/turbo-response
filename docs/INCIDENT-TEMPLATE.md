# Incident Report Template

**Use this template for every SEV1 incident. No exceptions.**

---

## Incident ID: INC-YYYY-MM-DD-NNN

### Severity: SEV1 / SEV2 / SEV3

### SEV1 Triggers (any one = SEV1):
- [ ] Paid client blocked from portal
- [ ] Portal route returning 404/500
- [ ] Daily email not delivered
- [ ] Payment processing failure

---

## 1. What Broke (Symptom)
_Describe the exact user-visible symptom. No jargon._

## 2. Who Is Impacted
_List specific case IDs and client names._

| Case ID | Client | Impact |
|---------|--------|--------|
| | | |

## 3. Production Proof

### /api/version output:
```json
{
  "git_sha": "",
  "build_time_utc": "",
  "env": ""
}
```

### /api/smoke-test output:
```json
{
  "overall": "",
  "checks": {}
}
```

## 4. Root Cause
_File, function, and condition that caused the failure._

| Component | File | Line | Condition |
|-----------|------|------|-----------|
| | | | |

## 5. Fix
_Commit SHA and description of the fix._

- **Commit:** 
- **Changes:**

## 6. Verification

### Before State:
| Field | Value |
|-------|-------|
| | |

### After State:
| Field | Value |
|-------|-------|
| | |

### Screenshots/curl proof:
_Attach or paste here._

## 7. Prevention Added
_What monitor, guardrail, or test was added to prevent recurrence?_

- [ ] Drift guard check added
- [ ] Smoke test updated
- [ ] Unit test added
- [ ] Alert configured

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| | Incident detected |
| | Investigation started |
| | Root cause identified |
| | Fix deployed |
| | Verification complete |
| | Incident closed |

---

## Post-Incident Checklist

- [ ] `/api/version` shows correct SHA
- [ ] `/api/smoke-test` returns PASS
- [ ] `/api/admin/drift-check` returns clean
- [ ] Affected client(s) confirmed working
- [ ] Prevention measure deployed and tested
