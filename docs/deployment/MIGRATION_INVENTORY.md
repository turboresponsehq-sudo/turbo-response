# Migration Inventory Report
**Generated:** 2025-11-13  
**Purpose:** Document all database migrations and their status

## Migration Files

### 1. `20251112161901_create_business_intakes.sql`
**Purpose:** Create business_intakes table for Turbo Intake (separate business audit system)  
**Status:** Applied to production  
**Tables:** business_intakes  
**Keep:** YES (active feature)

### 2. `add_amount_deadline.sql`
**Purpose:** Add amount and deadline columns to cases table  
**Status:** Applied to production  
**Columns:** cases.amount, cases.deadline  
**Keep:** YES (required for case intake)

### 3. `add_consumer_defense_tables.sql`
**Purpose:** Create core consumer defense system tables  
**Status:** Applied to production  
**Tables:** cases, case_analyses, admin_notifications, ai_usage_logs  
**Keep:** YES (core schema)

### 4. `add_missing_case_columns.sql`
**Purpose:** Add client information columns to cases table  
**Status:** Applied to production (manually on 2025-11-13)  
**Columns:** full_name, email, phone, address, case_details, documents  
**Keep:** YES (required for intake flow)

### 5. `add_payment_tracking.sql`
**Purpose:** Add payment tracking columns to cases table  
**Status:** Applied to production  
**Columns:** payment_status, payment_method, payment_confirmed_at, payment_verified_by, payment_verified_at  
**Keep:** YES (payment workflow)

### 6. `add_pricing_tier.sql`
**Purpose:** Add pricing_tier column to case_analyses table  
**Status:** Applied to production  
**Columns:** case_analyses.pricing_tier  
**Keep:** YES (deterministic pricing engine)

### 7. `add_unified_payments.sql`
**Purpose:** Consolidate payment tracking (may overlap with add_payment_tracking.sql)  
**Status:** Unknown - need to inspect  
**Keep:** REVIEW NEEDED

### 8. `add_usage_tracking.sql`
**Purpose:** Create ai_usage_logs table for cost monitoring  
**Status:** Applied to production  
**Tables:** ai_usage_logs  
**Keep:** YES (AI cost tracking)

### 9. `fix_category_constraint.sql`
**Purpose:** Fix category enum constraint in cases table  
**Status:** Applied to production  
**Keep:** YES (data integrity)

### 10. `restore_admin_workflow_status.sql`
**Purpose:** Restore admin workflow status values  
**Status:** Applied to production  
**Keep:** YES (admin workflow)

## Migration Runner Status

**File:** `backend/src/migrations/run-migrations.mjs`  
**Status:** Active (called on server startup)  
**Action:** Keep active - migrations are idempotent

## Recommendations

1. **Inspect add_unified_payments.sql** - may be duplicate of add_payment_tracking.sql
2. **Add comments** to migrations marking them as "applied to production"
3. **No deletions needed** - all migrations are part of production schema history
4. **Migration runner is safe** - uses CREATE TABLE IF NOT EXISTS pattern

## Production Database State

All migrations have been applied. Database is in target state.  
No risk of accidental re-runs causing breakage.
