#!/bin/bash
set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Turbo Response - Unified Build Pipeline${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Clean all output directories
echo -e "\n${YELLOW}[1/6] Cleaning output directories...${NC}"
rm -rf dist dist-frontend
echo "✓ Cleaned dist/ and dist-frontend/"

# Step 2: Build frontend with Vite
echo -e "\n${YELLOW}[2/6] Building frontend with Vite...${NC}"
pnpm run build:frontend
if [ ! -d "dist-frontend" ]; then
    echo -e "${RED}ERROR: dist-frontend/ was not created by Vite${NC}"
    exit 1
fi
if [ ! -f "dist-frontend/index.html" ]; then
    echo -e "${RED}ERROR: dist-frontend/index.html does not exist${NC}"
    exit 1
fi
echo "✓ Frontend built successfully to dist-frontend/"

# Step 3: Build backend with esbuild
echo -e "\n${YELLOW}[3/6] Building backend with esbuild...${NC}"
pnpm run build:backend
if [ ! -d "dist" ]; then
    echo -e "${RED}ERROR: dist/ was not created by esbuild${NC}"
    exit 1
fi
if [ ! -f "dist/server.js" ]; then
    echo -e "${RED}ERROR: dist/server.js does not exist${NC}"
    exit 1
fi
echo "✓ Backend built successfully to dist/"

# Step 4: Copy frontend to dist/public
echo -e "\n${YELLOW}[4/6] Copying frontend to dist/public/...${NC}"
mkdir -p dist/public
cp -r dist-frontend/* dist/public/
if [ ! -f "dist/public/index.html" ]; then
    echo -e "${RED}ERROR: dist/public/index.html does not exist after copy${NC}"
    exit 1
fi
echo "✓ Frontend copied to dist/public/"

# Step 5: Cleanup temporary directory
echo -e "\n${YELLOW}[5/6] Cleaning up temporary files...${NC}"
rm -rf dist-frontend
echo "✓ Removed dist-frontend/"

# Step 6: Validate final structure
echo -e "\n${YELLOW}[6/6] Validating build output...${NC}"

# Check required files
REQUIRED_FILES=(
    "dist/server.js"
    "dist/public/index.html"
    "dist/migrations/run-migrations.mjs"
)

ALL_VALID=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo -e "${RED}✗ $file is MISSING${NC}"
        ALL_VALID=false
    fi
done

# Check for assets directory
if [ -d "dist/public/assets" ]; then
    ASSET_COUNT=$(find dist/public/assets -type f | wc -l)
    echo "✓ dist/public/assets/ exists ($ASSET_COUNT files)"
else
    echo -e "${RED}✗ dist/public/assets/ is MISSING${NC}"
    ALL_VALID=false
fi

# Final validation
if [ "$ALL_VALID" = true ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ BUILD SUCCESSFUL${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Build output structure:"
    echo "  dist/"
    echo "  ├── server.js (backend)"
    echo "  ├── migrations/ (database)"
    echo "  └── public/ (frontend)"
    echo "      ├── index.html"
    echo "      └── assets/"
    echo ""
    echo "Ready for deployment!"
    exit 0
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}✗ BUILD FAILED - Missing required files${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
