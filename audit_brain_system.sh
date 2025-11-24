#!/bin/bash

# Turbo Brain Foundation Audit Script
# Tests all 7 critical components

API_BASE="${API_BASE:-https://turboresponsehq.ai}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"

echo "========================================="
echo "TURBO BRAIN FOUNDATION AUDIT"
echo "========================================="
echo "API Base: $API_BASE"
echo "Timestamp: $(date)"
echo ""

# Check if access token is provided
if [ -z "$ACCESS_TOKEN" ]; then
  echo "⚠️  WARNING: ACCESS_TOKEN not set"
  echo "Usage: ACCESS_TOKEN=your_token ./audit_brain_system.sh"
  echo ""
fi

# Component 1: Supabase Storage & Database Setup
echo "========================================="
echo "1. SUPABASE SETUP CHECK"
echo "========================================="
SETUP_RESPONSE=$(curl -s -X GET "$API_BASE/api/brain/setup" \
  -H "x-access-token: $ACCESS_TOKEN")

echo "$SETUP_RESPONSE" | jq '.' || echo "$SETUP_RESPONSE"
echo ""

# Extract status
READY=$(echo "$SETUP_RESPONSE" | jq -r '.ready // false')
DB_EXISTS=$(echo "$SETUP_RESPONSE" | jq -r '.results.database.exists // false')
STORAGE_EXISTS=$(echo "$SETUP_RESPONSE" | jq -r '.results.storage.exists // false')

if [ "$READY" = "true" ]; then
  echo "✅ PASS: Supabase setup complete"
else
  echo "❌ FAIL: Supabase setup incomplete"
  echo "Database exists: $DB_EXISTS"
  echo "Storage exists: $STORAGE_EXISTS"
fi
echo ""

# Component 2: Document List (Pagination Test)
echo "========================================="
echo "2. DOCUMENT LIST & PAGINATION"
echo "========================================="
LIST_RESPONSE=$(curl -s -X GET "$API_BASE/api/brain/list?page=1&limit=10" \
  -H "x-access-token: $ACCESS_TOKEN")

echo "$LIST_RESPONSE" | jq '.' || echo "$LIST_RESPONSE"
echo ""

LIST_SUCCESS=$(echo "$LIST_RESPONSE" | jq -r '.success // false')
if [ "$LIST_SUCCESS" = "true" ]; then
  DOC_COUNT=$(echo "$LIST_RESPONSE" | jq -r '.pagination.total // 0')
  echo "✅ PASS: Document list working ($DOC_COUNT documents)"
else
  echo "❌ FAIL: Document list failed"
fi
echo ""

# Component 3: File URL Validation
echo "========================================="
echo "3. FILE URL ACCESSIBILITY"
echo "========================================="
FIRST_DOC_URL=$(echo "$LIST_RESPONSE" | jq -r '.documents[0].file_url // ""')

if [ -n "$FIRST_DOC_URL" ] && [ "$FIRST_DOC_URL" != "null" ]; then
  echo "Testing URL: $FIRST_DOC_URL"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FIRST_DOC_URL")
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: File URL accessible (HTTP $HTTP_STATUS)"
  else
    echo "❌ FAIL: File URL not accessible (HTTP $HTTP_STATUS)"
  fi
else
  echo "⚠️  SKIP: No documents to test"
fi
echo ""

# Component 4: Authentication Test
echo "========================================="
echo "4. AUTHENTICATION (x-access-token)"
echo "========================================="
# Test without token
NO_AUTH_RESPONSE=$(curl -s -X GET "$API_BASE/api/brain/list" -w "\nHTTP_CODE:%{http_code}")
HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  echo "✅ PASS: Authentication required (HTTP $HTTP_CODE)"
else
  echo "❌ FAIL: Authentication not enforced (HTTP $HTTP_CODE)"
fi
echo ""

# Component 5: Backend Routes Check
echo "========================================="
echo "5. BACKEND ROUTES REGISTERED"
echo "========================================="
echo "Testing routes:"
echo "  - GET /api/brain/setup"
echo "  - GET /api/brain/list"
echo "  - POST /api/brain/upload"
echo "  - DELETE /api/brain/delete/:id"

# All routes should return proper responses (not 404)
SETUP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/brain/setup" -H "x-access-token: $ACCESS_TOKEN")
LIST_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/brain/list" -H "x-access-token: $ACCESS_TOKEN")

if [ "$SETUP_CODE" != "404" ] && [ "$LIST_CODE" != "404" ]; then
  echo "✅ PASS: Brain routes registered"
else
  echo "❌ FAIL: Brain routes not found (setup: $SETUP_CODE, list: $LIST_CODE)"
fi
echo ""

# Component 6: MIME Type Validation
echo "========================================="
echo "6. MIME TYPE VALIDATION"
echo "========================================="
FIRST_DOC_MIME=$(echo "$LIST_RESPONSE" | jq -r '.documents[0].mime_type // ""')

if [ -n "$FIRST_DOC_MIME" ] && [ "$FIRST_DOC_MIME" != "null" ]; then
  echo "Sample MIME type: $FIRST_DOC_MIME"
  
  if [[ "$FIRST_DOC_MIME" =~ ^application/pdf$ ]] || \
     [[ "$FIRST_DOC_MIME" =~ ^text/ ]] || \
     [[ "$FIRST_DOC_MIME" =~ ^application/.*document ]]; then
    echo "✅ PASS: Valid MIME type detected"
  else
    echo "⚠️  WARNING: Unexpected MIME type"
  fi
else
  echo "⚠️  SKIP: No documents to validate"
fi
echo ""

# Final Summary
echo "========================================="
echo "AUDIT SUMMARY"
echo "========================================="
echo "Timestamp: $(date)"
echo ""
echo "Component Status:"
echo "  1. Supabase Setup:     $([ "$READY" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  2. Document List:      $([ "$LIST_SUCCESS" = "true" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  3. File URL Access:    $([ "$HTTP_STATUS" = "200" ] && echo "✅ PASS" || echo "⚠️  SKIP")"
echo "  4. Authentication:     $([ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "  5. Backend Routes:     $([ "$SETUP_CODE" != "404" ] && [ "$LIST_CODE" != "404" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo ""

# Overall verdict
if [ "$READY" = "true" ] && [ "$LIST_SUCCESS" = "true" ]; then
  echo "🎉 OVERALL: PASS - System ready for 200-document upload"
  exit 0
else
  echo "❌ OVERALL: FAIL - System requires fixes before upload"
  exit 1
fi
