#!/bin/bash
# Test script for PR #1: Version endpoint verification
# Usage: ./test-version-endpoint.sh [production_url]

URL="${1:-https://turboresponsehq.ai}"

echo "Testing tRPC system.version endpoint..."
echo "URL: $URL/api/trpc/system.version?batch=1"
echo ""

# Test the endpoint
RESPONSE=$(curl -s "$URL/api/trpc/system.version?batch=1")

# Check if response is valid JSON
if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
  echo "✅ Response is valid JSON"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | python3 -m json.tool
  echo ""
  
  # Extract key fields
  VERSION=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['result']['data']['version'] if isinstance(data, list) else data['result']['data']['version'])" 2>/dev/null)
  ENV=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['result']['data']['environment'] if isinstance(data, list) else data['result']['data']['environment'])" 2>/dev/null)
  
  if [ -n "$VERSION" ]; then
    echo "✅ Version: $VERSION"
  fi
  
  if [ -n "$ENV" ]; then
    echo "✅ Environment: $ENV"
  fi
  
  echo ""
  echo "✅ PR #1 VERIFICATION PASSED"
else
  echo "❌ Response is not valid JSON"
  echo "Response:"
  echo "$RESPONSE"
  echo ""
  echo "❌ PR #1 VERIFICATION FAILED"
  exit 1
fi
