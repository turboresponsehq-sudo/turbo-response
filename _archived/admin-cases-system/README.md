# Archived: Admin Cases System

**Date Archived:** 2026-02-10
**Reason:** Duplicate/unused admin system

## What was archived
This was a separate admin case management system that was NOT being used.

**Files archived:**
- `AdminCasesList.tsx` / `.css` - List view for admin_cases table
- `AdminCaseDetail.tsx` / `.css` - Detail view for admin_cases table  
- `adminCasesController.js` - Backend controller
- `adminCases.js` - Backend routes

**Database table:** `admin_cases` (still exists, can be dropped if confirmed unused)

## Active System
The ACTIVE admin system uses:
- `AdminConsumerCases.tsx` - List view
- `AdminConsumerCaseDetail.tsx` - Detail view
- `casesController.js` - Backend controller
- Database table: `cases`

## To restore
If needed, move files back from `_archived/admin-cases-system/` to their original locations.
