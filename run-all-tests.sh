#!/bin/bash

#############################################
# Complete Test Suite Runner
# 
# This script runs all tests in the correct order:
# 1. Frontend Component Tests
# 2. Backend Unit Tests
# 3. Backend API Tests (Playwright)
# 4. Backend Integration Tests (with Docker)
# 5. End-to-End Tests (optional)
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Selly Base - Complete Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run tests and track results
run_test_suite() {
  local test_name=$1
  local test_command=$2
  local test_dir=$3
  
  echo -e "${BLUE}▶ Running: ${test_name}${NC}"
  echo "  Command: ${test_command}"
  echo "  Directory: ${test_dir}"
  echo ""
  
  if [ -n "$test_dir" ]; then
    cd "$test_dir"
  fi
  
  if eval "$test_command"; then
    echo -e "${GREEN}✓ ${test_name} PASSED${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ ${test_name} FAILED${NC}"
    ((TESTS_FAILED++))
  fi
  
  echo ""
  cd - > /dev/null 2>&1 || true
}

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}📋 Test Suite Configuration:${NC}"
echo "  Project Root: $PROJECT_ROOT"
echo "  Skip Docker: ${SKIP_DOCKER:-false}"
echo "  Skip E2E: ${SKIP_E2E:-true}"
echo ""

# 1. Frontend Component Tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  1. Frontend Component Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_test_suite \
  "Frontend Component Tests" \
  "npm test -- --passWithNoTests" \
  "apps/web"

# 2. Backend Unit Tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  2. Backend Unit Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_test_suite \
  "Backend Unit Tests" \
  "npm test -- --passWithNoTests" \
  "apps/api"

# 3. Backend API Tests (Playwright)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  3. Backend API Tests (Playwright)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_test_suite \
  "Backend API Tests" \
  "npm run test:api" \
  "apps/api"

# 4. Backend Integration Tests (with Docker)
if [ "${SKIP_DOCKER}" != "true" ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  4. Backend Integration Tests (Docker)${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo "  Setting up Docker test database..."
  cd "$PROJECT_ROOT/apps/api"
  npm run test:integration:setup
  
  run_test_suite \
    "Backend Integration Tests" \
    "npm run test:integration" \
    "apps/api"
  
  echo "  Cleaning up Docker test database..."
  cd "$PROJECT_ROOT/apps/api"
  npm run test:integration:cleanup
else
  echo -e "${YELLOW}⊘ Skipping Docker Integration Tests (SKIP_DOCKER=true)${NC}"
  echo ""
fi

# 5. End-to-End Tests (optional)
if [ "${SKIP_E2E}" != "true" ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  5. End-to-End Tests${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo -e "${YELLOW}  Note: E2E tests require frontend and backend to be running${NC}"
  echo -e "${YELLOW}  Start servers with: npm run dev${NC}"
  echo ""
  
  run_test_suite \
    "End-to-End Tests" \
    "npm run test:e2e" \
    "."
else
  echo -e "${YELLOW}⊘ Skipping E2E Tests (SKIP_E2E=true)${NC}"
  echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
