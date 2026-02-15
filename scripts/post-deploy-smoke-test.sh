#!/bin/bash
# Post-Deploy Smoke Test — Production Stability Protocol Rule #3
# Run after every production deploy to verify system health
# Usage: ./scripts/post-deploy-smoke-test.sh [expected_sha]

set -e

BASE_URL="${PROD_URL:-https://turboresponsehq.ai}"
EXPECTED_SHA="${1:-}"
PASS=true

echo "╔══════════════════════════════════════╗"
echo "║    POST-DEPLOY SMOKE TEST            ║"
echo "╠══════════════════════════════════════╣"
echo "║ Target: $BASE_URL"
echo "║ Expected SHA: ${EXPECTED_SHA:-any}"
echo "║ Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "╚══════════════════════════════════════╝"
echo ""

# CHECK 1: Health endpoint
echo "--- CHECK 1: /api/health ---"
HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH" | grep "HTTP_CODE:" | cut -d: -f2)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS: Health endpoint returned 200"
else
  echo "❌ FAIL: Health endpoint returned $HTTP_CODE"
  PASS=false
fi
echo ""

# CHECK 2: Version beacon
echo "--- CHECK 2: /api/version ---"
VERSION=$(curl -s "$BASE_URL/api/version" 2>/dev/null)
echo "Response: $VERSION"
if [ -n "$EXPECTED_SHA" ]; then
  ACTUAL_SHA=$(echo "$VERSION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('git_sha',''))" 2>/dev/null || echo "parse_error")
  if [ "$ACTUAL_SHA" = "$EXPECTED_SHA" ]; then
    echo "✅ PASS: SHA matches expected ($EXPECTED_SHA)"
  else
    echo "❌ FAIL: SHA mismatch. Expected=$EXPECTED_SHA Actual=$ACTUAL_SHA"
    PASS=false
  fi
else
  echo "⚠️  SKIP: No expected SHA provided"
fi
echo ""

# CHECK 3: Smoke test endpoint
echo "--- CHECK 3: /api/smoke-test ---"
SMOKE=$(curl -s "$BASE_URL/api/smoke-test" 2>/dev/null)
echo "Response: $SMOKE"
OVERALL=$(echo "$SMOKE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('overall',''))" 2>/dev/null || echo "parse_error")
if [ "$OVERALL" = "PASS" ]; then
  echo "✅ PASS: All smoke test checks passed"
else
  echo "❌ FAIL: Smoke test overall=$OVERALL"
  PASS=false
fi
echo ""

# CHECK 4: Drift check
echo "--- CHECK 4: /api/admin/drift-check ---"
DRIFT=$(curl -s "$BASE_URL/api/admin/drift-check" 2>/dev/null)
echo "Response: $DRIFT"
DRIFT_STATUS=$(echo "$DRIFT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "parse_error")
if [ "$DRIFT_STATUS" = "clean" ]; then
  echo "✅ PASS: No payment drift detected"
else
  echo "⚠️  DRIFT: Auto-fix applied. Check response for details."
fi
echo ""

# FINAL RESULT
echo "╔══════════════════════════════════════╗"
if [ "$PASS" = true ]; then
  echo "║    ✅ ALL CHECKS PASSED              ║"
else
  echo "║    ❌ SOME CHECKS FAILED             ║"
fi
echo "╚══════════════════════════════════════╝"

if [ "$PASS" = false ]; then
  exit 1
fi
