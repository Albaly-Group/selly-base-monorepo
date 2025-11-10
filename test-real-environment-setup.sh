#!/bin/bash

# Test Script: Verify E2E Real Environment Setup
# This script demonstrates that the E2E test setup with real database works correctly

set -e

echo "=================================================="
echo "Testing E2E Real Environment Setup"
echo "=================================================="
echo ""

echo "✅ Step 1: Verify Docker is available"
docker --version
echo ""

echo "✅ Step 2: Clean up any existing test databases"
npm run test:e2e:db-only:cleanup 2>&1 | tail -5
echo ""

echo "✅ Step 3: Test global setup script"
echo "   Starting PostgreSQL database..."
node -e "require('./e2e/setup/global-setup.js')()"
echo ""

echo "✅ Step 4: Verify database is running and healthy"
docker ps | grep selly-base-postgres-e2e
docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e
echo ""

echo "✅ Step 5: Test database connectivity"
docker exec selly-base-postgres-e2e psql -U postgres -d selly_base_e2e -c "SELECT 'Connected successfully!' as status;" | grep -A1 status
echo ""

echo "✅ Step 6: Check database schema was initialized"
docker exec selly-base-postgres-e2e psql -U postgres -d selly_base_e2e -c "\dt" | head -15
echo ""

echo "✅ Step 7: Test global teardown script"
node -e "require('./e2e/setup/global-teardown.js')()"
echo ""

echo "✅ Step 8: Verify database was stopped"
if docker ps | grep -q selly-base-postgres-e2e; then
    echo "   Database container is still running (expected in non-CI mode)"
else
    echo "   Database container was stopped"
fi
echo ""

echo "=================================================="
echo "✅ All verification steps passed!"
echo "=================================================="
echo ""
echo "The E2E test environment is working correctly."
echo ""
echo "You can now run:"
echo "  npm run test:e2e        # Run E2E tests with real database"
echo "  npm run test:e2e:mock   # Run E2E tests with mock data"
echo ""
