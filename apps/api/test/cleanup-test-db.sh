#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Selly Base - Test Database Cleanup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../../.."

# Check if test database is running
if ! docker ps | grep -q selly-base-postgres-test; then
    echo -e "${YELLOW}⚠${NC} Test database is not running"
    echo -e "${GREEN}✓${NC} Nothing to clean up"
    exit 0
fi

echo -e "${BLUE}🧹${NC} Stopping test database..."
docker compose -f docker-compose.test.yml down

echo -e "${BLUE}🗑${NC} Removing test volumes..."
docker compose -f docker-compose.test.yml down -v

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Test Database Cleaned Up!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
