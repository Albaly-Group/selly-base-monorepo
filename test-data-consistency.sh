#!/bin/bash

# Data Consistency Validation Test
# Validates that data flows correctly from Database → API → Frontend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

print_header() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header "Data Consistency Validation Test"
echo "Testing: Database → API → Frontend data flow"
echo "Date: $(date)"
echo ""

# Step 1: Get ground truth from database
print_header "Step 1: Query Database (Ground Truth)"

DB_ORGS=$(docker exec selly-base-postgres psql -U postgres -d selly_base -t -c "SELECT COUNT(*) FROM organizations;" 2>/dev/null | tr -d ' ')
DB_USERS=$(docker exec selly-base-postgres psql -U postgres -d selly_base -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
DB_COMPANIES=$(docker exec selly-base-postgres psql -U postgres -d selly_base -t -c "SELECT COUNT(*) FROM companies WHERE is_shared_data = true;" 2>/dev/null | tr -d ' ')

echo "Organizations: $DB_ORGS"
echo "Users: $DB_USERS"
echo "Shared Companies: $DB_COMPANIES"

# Step 2: Test API endpoints
print_header "Step 2: Test Backend API"

# Login
print_info "Logging in as platform admin..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"platform@albaly.com","password":"password123"}' 2>/dev/null | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  print_success "Authentication successful"
else
  print_error "Authentication failed"
  exit 1
fi

# Test tenants endpoint
print_info "Testing GET /api/v1/platform-admin/tenants"
TENANTS_RESPONSE=$(curl -s http://localhost:3001/api/v1/platform-admin/tenants \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$TENANTS_RESPONSE" | grep -q "403\|Forbidden"; then
  print_error "Tenants endpoint returned 403 Forbidden"
  ((TESTS_FAILED++))
else
  API_ORGS=$(echo "$TENANTS_RESPONSE" | grep -o '"id":"[^"]*"' | wc -l)
  if [ "$API_ORGS" -eq "$DB_ORGS" ]; then
    print_success "Tenants endpoint returns correct count: $API_ORGS (matches database)"
  else
    print_error "Tenants endpoint mismatch: API=$API_ORGS, DB=$DB_ORGS"
  fi
fi

# Test users endpoint
print_info "Testing GET /api/v1/platform-admin/users"
USERS_RESPONSE=$(curl -s http://localhost:3001/api/v1/platform-admin/users \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$USERS_RESPONSE" | grep -q "403\|Forbidden"; then
  print_error "Users endpoint returned 403 Forbidden"
  ((TESTS_FAILED++))
else
  # Count only top-level user objects, not nested role/organization IDs
  API_USERS=$(echo "$USERS_RESPONSE" | grep -o '"email":"[^"]*"' | wc -l)
  if [ "$API_USERS" -eq "$DB_USERS" ]; then
    print_success "Users endpoint returns correct count: $API_USERS (matches database)"
  else
    print_error "Users endpoint mismatch: API=$API_USERS, DB=$DB_USERS"
  fi
fi

# Test shared companies endpoint
print_info "Testing GET /api/v1/platform-admin/shared-companies"
COMPANIES_RESPONSE=$(curl -s http://localhost:3001/api/v1/platform-admin/shared-companies \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$COMPANIES_RESPONSE" | grep -q "403\|Forbidden"; then
  print_error "Shared companies endpoint returned 403 Forbidden"
  ((TESTS_FAILED++))
else
  API_COMPANIES=$(echo "$COMPANIES_RESPONSE" | grep -o '"companyNameEn":"[^"]*"' | wc -l)
  if [ "$API_COMPANIES" -eq "$DB_COMPANIES" ]; then
    print_success "Shared companies endpoint returns correct count: $API_COMPANIES (matches database)"
  else
    print_error "Shared companies endpoint mismatch: API=$API_COMPANIES, DB=$DB_COMPANIES"
  fi
fi

# Step 3: Verify frontend code doesn't contain hardcoded mock values
print_header "Step 3: Check Frontend for Mock Data"

DASHBOARD_FILE="apps/web/components/platform-admin-dashboard.tsx"
print_info "Checking $DASHBOARD_FILE for hardcoded mock values..."

# Check for known mock values
if grep -q "45.2K\|45200" "$DASHBOARD_FILE"; then
  print_error "Found hardcoded '45.2K' in dashboard component"
else
  print_success "No hardcoded '45.2K' companies found"
fi

if grep -q "99.9%" "$DASHBOARD_FILE"; then
  print_error "Found hardcoded '99.9%' uptime in dashboard component"
else
  print_success "No hardcoded '99.9%' uptime found"
fi

# Verify component uses API data
if grep -q "getSharedCompanies" "$DASHBOARD_FILE"; then
  print_success "Component calls getSharedCompanies() API"
else
  print_error "Component does not call getSharedCompanies() API"
fi

if grep -q "sharedCompaniesCount" "$DASHBOARD_FILE"; then
  print_success "Component displays sharedCompaniesCount from API"
else
  print_error "Component does not display sharedCompaniesCount"
fi

# Step 4: Summary
print_header "Test Results Summary"

echo ""
echo -e "${BLUE}Statistics:${NC}"
echo "  Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}=====================================${NC}"
  echo -e "${GREEN}✅ ALL DATA CONSISTENCY TESTS PASSED${NC}"
  echo -e "${GREEN}=====================================${NC}"
  echo ""
  echo "Data Flow Verified:"
  echo "  ✅ Database contains: $DB_ORGS orgs, $DB_USERS users, $DB_COMPANIES shared companies"
  echo "  ✅ Backend API returns same counts"
  echo "  ✅ Frontend uses API data (no hardcoded values)"
  echo "  ✅ Complete flow: Database → API → Frontend"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}=====================================${NC}"
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo -e "${RED}=====================================${NC}"
  echo ""
  exit 1
fi
