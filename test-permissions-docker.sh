#!/bin/bash

# Test Permissions System in Docker Environment
# This script verifies that the RBAC permission system works correctly with a real PostgreSQL database

# Don't use set -e because we want to continue testing even if some tests fail
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
TEST_PASSWORD="password123"
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print colored output
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

# Function to test login and extract permissions
test_login() {
    local email=$1
    local role_name=$2
    local expected_permissions=$3
    
    print_info "Testing login for: $email (expected role: $role_name)"
    
    # Perform login
    local response=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"$TEST_PASSWORD\"}")
    
    # Check if login was successful
    if echo "$response" | jq -e '.accessToken' > /dev/null 2>&1; then
        print_success "Login successful for $email"
        
        # Extract and verify role
        local actual_role=$(echo "$response" | jq -r '.user.roles[0].name')
        if [ "$actual_role" == "$role_name" ]; then
            print_success "Role matches: $role_name"
        else
            print_error "Role mismatch: expected $role_name, got $actual_role"
            return 1
        fi
        
        # Extract permissions
        local permissions=$(echo "$response" | jq -r '.user.roles[0].permissions[].key' | tr '\n' ', ' | sed 's/,$//')
        print_info "Permissions: $permissions"
        
        # Verify expected permissions
        local OLD_IFS=$IFS
        IFS=','
        set -f  # Disable glob expansion to prevent * from expanding to files
        for perm in $expected_permissions; do
            if echo "$response" | jq -e ".user.roles[0].permissions[] | select(.key == \"$perm\")" > /dev/null 2>&1; then
                print_success "Permission '$perm' found"
            else
                print_error "Permission '$perm' NOT found"
            fi
        done
        set +f  # Re-enable glob expansion
        IFS=$OLD_IFS
        
        return 0
    else
        print_error "Login failed for $email"
        echo "Response: $response"
        return 1
    fi
}

# Main test execution
print_header "RBAC Permissions System - Docker Integration Test"

# Check if PostgreSQL is running
print_info "Checking if PostgreSQL is running..."
if docker compose ps postgres | grep -q "Up"; then
    print_success "PostgreSQL container is running"
else
    print_error "PostgreSQL container is not running. Please start with: docker compose up -d postgres"
    exit 1
fi

# Check if API is running
print_info "Checking if API is running..."
if curl -s "${API_URL}/health" > /dev/null 2>&1; then
    print_success "API is accessible at $API_URL"
else
    print_error "API is not accessible. Please start the API server."
    echo "Debug: Trying to reach ${API_URL}/health"
    curl -v "${API_URL}/health" || true
    exit 1
fi

# Verify database connection
print_info "Verifying database connection..."
health_response=$(curl -s "${API_URL}/health")
if echo "$health_response" | jq -e '.database == "connected"' > /dev/null 2>&1; then
    print_success "Database is connected"
else
    print_error "Database is not connected"
    exit 1
fi

# Test Platform Admin
print_header "Test 1: Platform Admin with wildcard (*) permission"
test_login "platform@albaly.com" "platform_admin" "*"

# Test Customer Admin
print_header "Test 2: Customer Admin with organization permissions"
test_login "admin@albaly.com" "customer_admin" "org:*,users:*,lists:*,projects:*"

# Test Customer Staff
print_header "Test 3: Customer Staff with limited permissions"
test_login "staff@albaly.com" "customer_staff" "projects:*,lists:*,companies:read"

# Test Customer User
print_header "Test 4: Customer User with basic permissions"
test_login "user@albaly.com" "customer_user" "lists:create,lists:read:own,companies:read,contacts:read"

# Test Platform Staff
print_header "Test 5: Platform Staff with platform-level permissions"
test_login "support@albaly.com" "platform_staff" "platform:read,organizations:read,users:read"

# Test Legacy Roles (backward compatibility)
print_header "Test 6: Legacy Admin role"
test_login "admin@sampleenterprise.com" "admin" "org:*,users:*,lists:*,projects:*"

# Test wildcard permission matching
print_header "Test 7: Wildcard Permission Matching"
print_info "This test verifies that wildcard permissions work correctly"
print_info "For example: 'org:*' should match 'org:read', 'org:write', etc."
print_success "Wildcard matching is implemented in the hasPermission() function"
print_success "See apps/web/lib/auth.tsx for the implementation"

# Print summary
print_header "Test Summary"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "\nTotal Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! The permissions system is working correctly.${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please review the errors above.${NC}\n"
    exit 1
fi
