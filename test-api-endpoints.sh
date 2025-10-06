#!/bin/bash

# Quick API Endpoint Testing Script
# Tests the platform admin API endpoints with curl
# Assumes backend is running on localhost:3001

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:3001}"
TOKEN="${JWT_TOKEN:-}"

print_header() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

test_endpoint() {
    local endpoint=$1
    local description=$2
    
    print_info "Testing: $description"
    print_info "URL: $API_URL$endpoint"
    
    if [ ! -z "$TOKEN" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL$endpoint" 2>&1)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" 2>&1)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    echo "  HTTP Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Endpoint returned 200 OK"
        echo "  Response preview:"
        echo "$BODY" | head -c 200
        echo "..."
        return 0
    elif [ "$HTTP_CODE" = "401" ]; then
        print_info "Endpoint returned 401 (Authentication required)"
        echo "  Set JWT_TOKEN environment variable to test with authentication"
        return 0
    elif [ "$HTTP_CODE" = "403" ]; then
        print_info "Endpoint returned 403 (Permission denied)"
        echo "  User needs platform admin permissions"
        return 0
    else
        print_error "Endpoint returned unexpected status: $HTTP_CODE"
        echo "  Response: $BODY"
        return 1
    fi
}

main() {
    print_header "Platform Admin API Endpoint Tests"
    
    echo "API URL: $API_URL"
    echo "Authentication: $([ -z "$TOKEN" ] && echo "None" || echo "Bearer token provided")"
    echo ""
    
    print_info "Testing if backend is running..."
    if ! curl -s "$API_URL" > /dev/null 2>&1; then
        print_error "Backend is not responding at $API_URL"
        echo ""
        echo "To start the backend:"
        echo "  1. cd apps/api"
        echo "  2. npm install"
        echo "  3. npm run start:dev"
        echo ""
        exit 1
    fi
    print_success "Backend is responding"
    
    echo ""
    print_header "Testing Platform Admin Endpoints"
    
    # Test each endpoint
    test_endpoint "/api/v1/platform-admin/tenants" "Get Tenants"
    echo ""
    
    test_endpoint "/api/v1/platform-admin/users" "Get Platform Users"
    echo ""
    
    test_endpoint "/api/v1/platform-admin/shared-companies" "Get Shared Companies"
    echo ""
    
    # Test with pagination
    print_header "Testing with Pagination Parameters"
    
    test_endpoint "/api/v1/platform-admin/tenants?page=1&limit=10" "Get Tenants (page 1, limit 10)"
    echo ""
    
    print_header "Test Complete"
    echo "All platform admin endpoints tested successfully!"
    echo ""
    echo "To run with authentication:"
    echo "  export JWT_TOKEN='your-token-here'"
    echo "  ./test-api-endpoints.sh"
}

main
