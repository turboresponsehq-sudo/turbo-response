# Admin Dashboard - Database ID Display Fix

**Date:** 2026-02-07  
**Status:** ✅ RESOLVED  
**Commit:** 87f64eae

## Problem

Admin dashboard was displaying `case_number` field (TR-XXXXXXXX-XXX format) instead of database `id` field (#14, #15, etc.), making it impossible to access cases by their portal login ID.

User reported: "The last case that I uploaded with my finra report the case ID number was 14, now I can't get inside the case because the case number has been changed"

## Root Cause

The AdminDashboard component (line 262) was rendering:
```tsx
<td>{caseItem.case_number}</td>
```

But the client portal login uses the database `id` field (#14), not the `case_number` field.

## Solution

Changed AdminDashboard.tsx line 269 to display database ID:
```tsx
<td style={{ padding: '12px 16px', color: '#60a5fa', fontWeight: '600', fontSize: '14px' }}>#{caseItem.id}</td>
```

## Additional Improvements

1. **Dark Theme:** Changed background from white/light gray (#f3f4f6) to dark gray/blue (#1f2937, #374151)
2. **Text Visibility:** Changed text colors to white/light gray for better contrast on dark background
3. **Case # Highlighting:** Made Case # column blue (#60a5fa) for easy identification
4. **Font Sizes:** Increased from 12px to 14-15px for better readability
5. **Hover Effects:** Added row hover effects (background changes to #4b5563)

## Testing

Verified on production (https://turboresponsehq.ai/admin):
- ✅ Case numbers now show as #74, #72, #71, #68, #65, #63, #61, #59
- ✅ Dark theme applied
- ✅ Brain and Screenshot Upload buttons present
- ✅ Text readable on dark background

## Known Issues

- Name column shows "N/A" for all cases - `full_name` field is NULL in database
- Need to investigate why names aren't being saved during intake

## Related Files

- `client/src/pages/AdminDashboard.tsx` - Admin dashboard component
- `drizzle/schema.ts` - Database schema (cases table)
- `src/controllers/casesController.js` - Backend case queries
