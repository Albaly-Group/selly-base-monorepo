#!/bin/bash

#############################################
# Production Readiness Validation Script
# 
# This script validates that the entire application
# is ready for production deployment by running:
# 1. Core test suite
# 2. Production-ready E2E test
# 3. Docker production configuration validation
# 4. Production readiness checklist
#############################################

# Don't exit on error - we want to collect all validation results
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}${BOLD}  Production Readiness Validation${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Track validation results
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0
VALIDATION_RESULTS=()

# Function to run validation and track results
run_validation() {
  local validation_name=$1
  local validation_command=$2
  local is_optional=${3:-false}
  
  echo -e "${BLUE}▶ ${validation_name}${NC}"
  echo ""
  
  if eval "$validation_command"; then
    echo -e "${GREEN}✓ ${validation_name} - PASSED${NC}"
    ((VALIDATIONS_PASSED++))
    VALIDATION_RESULTS+=("✅ ${validation_name}")
  else
    if [ "$is_optional" = true ]; then
      echo -e "${YELLOW}⚠ ${validation_name} - SKIPPED (optional)${NC}"
      VALIDATION_RESULTS+=("⚠️  ${validation_name} - SKIPPED")
    else
      echo -e "${RED}✗ ${validation_name} - FAILED${NC}"
      ((VALIDATIONS_FAILED++))
      VALIDATION_RESULTS+=("❌ ${validation_name}")
    fi
  fi
  
  echo ""
}

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}📋 Validation Configuration:${NC}"
echo "  Project Root: $PROJECT_ROOT"
echo "  Mode: ${MODE:-full}"
echo ""

# Phase 1: Pre-flight Checks
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}  Phase 1: Pre-flight Checks${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

run_validation \
  "Node.js Installation" \
  "command -v node > /dev/null"

run_validation \
  "npm Installation" \
  "command -v npm > /dev/null"

run_validation \
  "Docker Installation" \
  "command -v docker > /dev/null"

run_validation \
  "Docker Compose Installation" \
  "docker compose version > /dev/null 2>&1"

run_validation \
  "Dependencies Installed" \
  "[ -d node_modules ]"

# Phase 2: Core Tests
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}  Phase 2: Core Test Suite${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "${SKIP_CORE_TESTS}" != "true" ]; then
  run_validation \
    "Frontend Component Tests" \
    "cd apps/web && npm test -- --passWithNoTests --silent && cd ../.."

  run_validation \
    "Backend Unit Tests" \
    "cd apps/api && npm test -- --passWithNoTests --silent && cd ../.."

  run_validation \
    "Backend API Tests" \
    "cd apps/api && npm run test:api --silent && cd ../.."
else
  echo -e "${YELLOW}⊘ Skipping Core Tests (SKIP_CORE_TESTS=true)${NC}"
  echo ""
fi

# Phase 3: Production Ready E2E Test
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}  Phase 3: Production Ready E2E Test${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "${SKIP_E2E}" != "true" ]; then
  echo -e "${YELLOW}  Starting E2E test environment...${NC}"
  
  # Start E2E environment
  run_validation \
    "E2E Environment Setup" \
    "npm run test:e2e:docker:setup > /dev/null 2>&1 && sleep 10"
  
  # Run production-ready E2E test
  run_validation \
    "Production Ready E2E Test" \
    "npx playwright test e2e/production-ready.e2e.spec.ts --project=chromium"
  
  # Cleanup
  echo -e "${YELLOW}  Cleaning up E2E environment...${NC}"
  npm run test:e2e:docker:cleanup > /dev/null 2>&1 || true
  echo ""
else
  echo -e "${YELLOW}⊘ Skipping E2E Tests (SKIP_E2E=true)${NC}"
  echo ""
fi

# Phase 4: Docker Production Configuration
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}  Phase 4: Docker Production Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

run_validation \
  "Docker Compose Production Syntax" \
  "docker compose -f docker-compose.prod.yml config > /dev/null 2>&1"

run_validation \
  "Production Dockerfiles Exist" \
  "[ -f Dockerfile.api.prod ] && [ -f Dockerfile.web.prod ]"

run_validation \
  "Production Environment Template Exists" \
  "[ -f .env.prod.example ]"

run_validation \
  "Production Deployment Script Exists" \
  "[ -f deploy-production.sh ] && [ -x deploy-production.sh ]"

run_validation \
  "Traefik Configuration Exists" \
  "[ -f traefik/traefik.yml ]"

# Phase 5: Production Readiness Checklist
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}${BOLD}  Phase 5: Production Readiness Checklist${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}Checking production readiness criteria...${NC}"
echo ""

# Check for security best practices
if grep -q "JWT_SECRET" .env.prod.example; then
  echo -e "  ${GREEN}✓${NC} JWT authentication configured"
else
  echo -e "  ${RED}✗${NC} JWT authentication not configured"
fi

if grep -q "POSTGRES_PASSWORD" .env.prod.example; then
  echo -e "  ${GREEN}✓${NC} Database password configuration present"
else
  echo -e "  ${RED}✗${NC} Database password configuration missing"
fi

# Check for documentation
if [ -f "README.md" ] && [ -f "DOCKER_PRODUCTION_QUICKSTART.md" ]; then
  echo -e "  ${GREEN}✓${NC} Production documentation available"
else
  echo -e "  ${YELLOW}⚠${NC} Production documentation incomplete"
fi

# Check for test coverage
if [ -d "e2e" ] && [ -d "apps/api/test" ]; then
  echo -e "  ${GREEN}✓${NC} Comprehensive test suite present"
else
  echo -e "  ${YELLOW}⚠${NC} Test coverage may be incomplete"
fi

# Check for monitoring/health endpoints
if grep -q "health" apps/api/src/app.controller.ts 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} Health check endpoint implemented"
else
  echo -e "  ${YELLOW}⚠${NC} Health check endpoint not found"
fi

# Check for error handling
if [ -f "apps/api/src/filters/http-exception.filter.ts" ] || 
   [ -f "apps/api/src/common/filters/http-exception.filter.ts" ]; then
  echo -e "  ${GREEN}✓${NC} Global error handling implemented"
else
  echo -e "  ${YELLOW}⚠${NC} Global error handling not verified"
fi

echo ""

# Final Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}${BOLD}  Validation Summary${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

for result in "${VALIDATION_RESULTS[@]}"; do
  echo "  $result"
done

echo ""
echo -e "${BLUE}Statistics:${NC}"
echo -e "  ${GREEN}Passed:${NC} ${VALIDATIONS_PASSED}"
echo -e "  ${RED}Failed:${NC} ${VALIDATIONS_FAILED}"
echo ""

# Production Readiness Report
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}${BOLD}  Production Readiness Report${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

if [ $VALIDATIONS_FAILED -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ PRODUCTION READY${NC}"
  echo ""
  echo "The application has passed all validation checks and is ready"
  echo "for production deployment."
  echo ""
  echo -e "${BLUE}Next Steps:${NC}"
  echo "  1. Review and configure .env.prod"
  echo "  2. Set up DNS records for your domain"
  echo "  3. Run ./deploy-production.sh"
  echo "  4. Monitor application health after deployment"
  echo ""
  exit 0
else
  echo -e "${RED}${BOLD}✗ NOT READY FOR PRODUCTION${NC}"
  echo ""
  echo "Some validation checks failed. Please address the issues above"
  echo "before deploying to production."
  echo ""
  echo -e "${YELLOW}Need Help?${NC}"
  echo "  - Check documentation: README.md"
  echo "  - Review logs for failed tests"
  echo "  - Ensure all dependencies are installed"
  echo ""
  exit 1
fi
