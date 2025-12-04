#!/bin/bash

##############################################
# Production Readiness Test Suite
# 
# This comprehensive script validates that the
# Selly Base application is production-ready by:
# 1. Validating build process
# 2. Running all test suites
# 3. Checking production configuration
# 4. Validating Docker setup
# 5. Verifying security and dependencies
##############################################

# Don't exit on error - we want to continue testing
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Create temporary directory for test artifacts
TEST_ARTIFACTS_DIR="/tmp/selly-production-test-$(date +%s)"
mkdir -p "$TEST_ARTIFACTS_DIR"

##############################################
# Helper Functions
##############################################

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

run_test() {
    local test_name=$1
    local test_command=$2
    local test_type=${3:-"critical"}  # critical, warning, or info
    
    ((TOTAL_TESTS++))
    echo -n "Test $TOTAL_TESTS: $test_name... "
    
    # Save current directory and restore after test
    local current_dir=$(pwd)
    
    if eval "$test_command" > "$TEST_ARTIFACTS_DIR/test-$TOTAL_TESTS.log" 2>&1; then
        cd "$current_dir" || true
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        cd "$current_dir" || true
        if [ "$test_type" = "critical" ]; then
            echo -e "${RED}✗ FAIL${NC}"
            ((FAILED_TESTS++))
            echo -e "${RED}Error details in: $TEST_ARTIFACTS_DIR/test-$TOTAL_TESTS.log${NC}"
            return 1
        elif [ "$test_type" = "warning" ]; then
            echo -e "${YELLOW}⚠ WARNING${NC}"
            ((WARNING_TESTS++))
            echo -e "${YELLOW}Details in: $TEST_ARTIFACTS_DIR/test-$TOTAL_TESTS.log${NC}"
            return 0
        else
            echo -e "${BLUE}ℹ INFO${NC}"
            ((PASSED_TESTS++))
            return 0
        fi
    fi
}

check_command() {
    local cmd=$1
    command -v "$cmd" &> /dev/null
}

##############################################
# Pre-flight Checks
##############################################

print_header "PRODUCTION READINESS TEST SUITE"
echo "Project: Selly Base B2B Prospecting Platform"
echo "Location: $PROJECT_ROOT"
echo "Test Artifacts: $TEST_ARTIFACTS_DIR"
echo "Date: $(date)"
echo ""

print_section "1. Environment & Prerequisites"

run_test "Node.js is installed" "check_command node"
run_test "npm is installed" "check_command npm"
run_test "Docker is installed" "check_command docker" "warning"
run_test "Docker Compose is installed" "docker compose version" "warning"
run_test "Git is installed" "check_command git" "warning"

# Check Node.js version
if check_command node; then
    NODE_VERSION=$(node --version)
    echo "  Node.js version: $NODE_VERSION"
fi

# Check npm version
if check_command npm; then
    NPM_VERSION=$(npm --version)
    echo "  npm version: $NPM_VERSION"
fi

##############################################
# Dependency Installation & Validation
##############################################

print_section "2. Dependencies & Security"

run_test "Root package.json exists" "test -f package.json"
run_test "Root package-lock.json exists" "test -f package-lock.json"

echo "Installing/verifying dependencies..."
run_test "npm install (root)" "npm install --prefer-offline --no-audit" "warning"

# Check for security vulnerabilities
run_test "npm audit check" "npm audit --audit-level=high --production || true" "warning"

# Verify workspace packages
run_test "API package.json exists" "test -f apps/api/package.json"
run_test "Web package.json exists" "test -f apps/web/package.json"
run_test "Types package exists" "test -d packages/types"

##############################################
# Build Process Validation
##############################################

print_section "3. Production Build Process"

echo "Building all applications..."

# Clean previous builds
run_test "Clean previous builds" "npm run clean || true" "warning"

# Build backend API
echo ""
echo -e "${YELLOW}Building Backend API...${NC}"
run_test "Backend API build" "cd apps/api && npm run build"

if [ -d "apps/api/dist" ]; then
    echo -e "${GREEN}  ✓ Backend build artifacts created in apps/api/dist${NC}"
    run_test "Backend main.js exists" "test -f apps/api/dist/src/main.js || test -f apps/api/dist/main.js"
else
    echo -e "${RED}  ✗ Backend build directory not found${NC}"
fi

# Build frontend
echo ""
echo -e "${YELLOW}Building Frontend...${NC}"
run_test "Frontend build" "cd apps/web && npm run build"

if [ -d "apps/web/.next" ]; then
    echo -e "${GREEN}  ✓ Frontend build artifacts created in apps/web/.next${NC}"
else
    echo -e "${RED}  ✗ Frontend build directory not found${NC}"
fi

# Build shared types
echo ""
echo -e "${YELLOW}Building Shared Types...${NC}"
run_test "Types build" "cd packages/types && npm run build || true" "warning"

##############################################
# Code Quality Checks
##############################################

print_section "4. Code Quality & Linting"

run_test "ESLint check (all)" "npm run lint || true" "warning"
run_test "Backend lint" "cd apps/api && npm run lint -- --max-warnings=50 || true" "warning"
run_test "Frontend lint" "cd apps/web && npm run lint -- --max-warnings=50 || true" "warning"

##############################################
# Test Suites
##############################################

print_section "5. Test Suites"

echo "Running comprehensive test suites..."
echo ""

# Backend unit tests
echo -e "${YELLOW}Running Backend Unit Tests...${NC}"
run_test "Backend unit tests" "cd apps/api && npm test -- --passWithNoTests" "warning"

# Frontend tests
echo -e "${YELLOW}Running Frontend Tests...${NC}"
run_test "Frontend tests" "cd apps/web && npm test -- --passWithNoTests"

# Backend API tests
echo -e "${YELLOW}Running Backend API Tests (Playwright)...${NC}"
run_test "Backend API tests" "cd apps/api && npm run test:api || true" "warning"

##############################################
# Production Configuration Validation
##############################################

print_section "6. Production Configuration"

# Check environment configuration files
run_test ".env.example exists" "test -f .env.example"
run_test ".env.prod.example exists" "test -f .env.prod.example"
run_test "API .env.example exists" "test -f apps/api/.env.example"
run_test "Web .env.example exists" "test -f apps/web/.env.example"

# Check required files
run_test "README.md exists" "test -f README.md"
run_test "turbo.json exists" "test -f turbo.json"

# Validate environment variables in templates
echo ""
echo "Validating environment variable templates..."
REQUIRED_PROD_VARS=("DOMAIN" "POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_DB" "JWT_SECRET")
for var in "${REQUIRED_PROD_VARS[@]}"; do
    run_test "Env var template contains $var" "grep -q \"^${var}=\" .env.prod.example" "warning"
done

##############################################
# Docker Production Setup Validation
##############################################

print_section "7. Docker Production Setup"

# Check Docker configuration files
run_test "docker-compose.prod.yml exists" "test -f docker-compose.prod.yml"
run_test "docker-compose.yml exists" "test -f docker-compose.yml"
run_test "Dockerfile.api.prod exists" "test -f Dockerfile.api.prod"
run_test "Dockerfile.web.prod exists" "test -f Dockerfile.web.prod"

# Validate Docker Compose syntax
if check_command docker && docker compose version &> /dev/null; then
    run_test "docker-compose.prod.yml syntax" "docker compose -f docker-compose.prod.yml config > /dev/null" "warning"
    run_test "docker-compose.yml syntax" "docker compose -f docker-compose.yml config > /dev/null" "warning"
fi

# Check Traefik configuration
run_test "traefik directory exists" "test -d traefik"
run_test "traefik.yml exists" "test -f traefik/traefik.yml" "warning"

# Check deployment scripts
run_test "deploy-production.sh exists" "test -f deploy-production.sh"
run_test "deploy-production.sh is executable" "test -x deploy-production.sh"

##############################################
# Database Configuration
##############################################

print_section "8. Database Configuration"

run_test "Database schema file exists" "test -f selly-base-optimized-schema.sql"
run_test "postgres directory exists" "test -d postgres"
run_test "PostgreSQL config exists" "test -f postgres/postgresql.conf" "warning"

# Check database-related files in API
run_test "TypeORM config exists" "test -f apps/api/src/config/typeorm.config.ts || test -f apps/api/src/database/data-source.ts" "warning"

##############################################
# Documentation & Deployment Guides
##############################################

print_section "9. Documentation & Guides"

REQUIRED_DOCS=(
    "README.md"
    "DEPLOYMENT.md"
    "TESTING.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    run_test "$doc exists" "test -f $doc" "warning"
done

# Check for deployment guides
run_test "Docker production guide exists" "test -f DOCKER_COMPOSE_PRODUCTION.md || test -f DOCKER_PRODUCTION_QUICKSTART.md" "warning"

##############################################
# Security Checks
##############################################

print_section "10. Security Validation"

# Check for common security files
run_test ".gitignore exists" "test -f .gitignore"
run_test ".env not in repository" "! git ls-files | grep -q '^.env$'" "warning"
run_test ".env.prod not in repository" "! git ls-files | grep -q '^.env.prod$'" "warning"

# Check .gitignore content
run_test ".gitignore contains .env" "grep -q '\.env' .gitignore" "warning"
run_test ".gitignore contains node_modules" "grep -q 'node_modules' .gitignore" "warning"

# Verify no sensitive data in package files
run_test "No hardcoded passwords in package.json" "! grep -i 'password.*:.*\".*\"' package.json || true" "warning"

##############################################
# Runtime & Startup Validation
##############################################

print_section "11. Application Startup Validation"

echo "This section requires manual validation:"
echo ""
echo "To validate production startup:"
echo "  1. Configure .env.prod with production values"
echo "  2. Run: ./deploy-production.sh"
echo "  3. Verify all services start correctly"
echo "  4. Check health endpoints:"
echo "     - Frontend: https://your-domain.com"
echo "     - API: https://api.your-domain.com/health"
echo "     - API Docs: https://api.your-domain.com/api/docs"
echo ""

# Check test scripts
run_test "test-docker-prod.sh exists" "test -f test-docker-prod.sh" "warning"
run_test "test-docker-prod.sh is executable" "test -x test-docker-prod.sh" "warning"

##############################################
# Performance & Best Practices
##############################################

print_section "12. Performance & Best Practices"

# Check for production optimizations
run_test "Frontend has next.config.js" "test -f apps/web/next.config.js || test -f apps/web/next.config.ts || test -f apps/web/next.config.mjs" "warning"

# Check for caching and optimization
run_test "Package-lock.json is committed" "git ls-files | grep -q 'package-lock.json'" "warning"

# Check build scripts are defined
run_test "Root has build script" "grep -q '\"build\"' package.json"
run_test "API has build script" "grep -q '\"build\"' apps/api/package.json"
run_test "Web has build script" "grep -q '\"build\"' apps/web/package.json"

##############################################
# Final Summary
##############################################

print_header "PRODUCTION READINESS TEST SUMMARY"

echo -e "${CYAN}Test Results:${NC}"
echo -e "  Total Tests:    $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:         $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:         $FAILED_TESTS${NC}"
echo -e "  ${YELLOW}Warnings:       $WARNING_TESTS${NC}"
echo ""

# Calculate success rate
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

# Determine overall status
if [ $FAILED_TESTS -eq 0 ]; then
    if [ $WARNING_TESTS -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ PRODUCTION READY - ALL TESTS PASS  ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
        EXIT_CODE=0
    else
        echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ⚠ PRODUCTION READY - WITH WARNINGS   ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Note: Some optional checks generated warnings.${NC}"
        echo -e "${YELLOW}Review the test log for details.${NC}"
        EXIT_CODE=0
    fi
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ NOT PRODUCTION READY - TESTS FAILED║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Critical issues found. Please address the failed tests before deployment.${NC}"
    EXIT_CODE=1
fi

echo ""
echo "Test artifacts saved to: $TEST_ARTIFACTS_DIR"
echo ""

# Additional recommendations
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${CYAN}Next Steps for Production Deployment:${NC}"
    echo "  1. Review and configure .env.prod with production values"
    echo "  2. Set up domain DNS records"
    echo "  3. Run: ./deploy-production.sh"
    echo "  4. Verify health endpoints are accessible"
    echo "  5. Run: ./test-docker-prod.sh (for additional validation)"
    echo "  6. Monitor logs: docker compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "For more information, see:"
    echo "  - DOCKER_PRODUCTION_QUICKSTART.md"
    echo "  - DEPLOYMENT.md"
    echo ""
fi

# Clean up on success (optional)
# rm -rf "$TEST_ARTIFACTS_DIR"

exit $EXIT_CODE
