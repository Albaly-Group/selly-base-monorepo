#!/bin/bash

# Production-Ready Test Script
# This script runs comprehensive production-ready validation tests
# covering security, performance, database integrity, API contracts,
# authentication, and data validation.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.e2e.yml"
WEB_URL="${WEB_BASE_URL:-http://localhost:3000}"
API_URL="${API_BASE_URL:-http://localhost:3001}"
MAX_WAIT_TIME=120
CHECK_INTERVAL=5

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Production-Ready Test Suite                 ║${NC}"
echo -e "${BLUE}║  Comprehensive Production Validation          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if service is healthy
check_service() {
    local url=$1
    local service_name=$2
    local max_attempts=$((MAX_WAIT_TIME / CHECK_INTERVAL))
    local attempt=0

    echo -n "Waiting for $service_name to be ready..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep $CHECK_INTERVAL
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}✗${NC}"
    return 1
}

# Function to check Docker container health
check_container_health() {
    local container_name=$1
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
    
    if [ "$health_status" == "healthy" ] || [ "$health_status" == "unknown" ]; then
        return 0
    fi
    return 1
}

print_section "Phase 1: Pre-flight Checks"

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command_exists docker; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker is installed"

if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker Compose is available"

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js is installed ($(node --version))"

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm is installed ($(npm --version))"

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi
echo -e "${GREEN}✓${NC} Running from project root"

print_section "Phase 2: Environment Setup"

# Check if docker-compose file exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo -e "${YELLOW}⚠ $DOCKER_COMPOSE_FILE not found${NC}"
    echo "Using docker-compose.yml instead"
    DOCKER_COMPOSE_FILE="docker-compose.yml"
fi

# Check if services are already running
echo "Checking if services are running..."
if docker ps | grep -q "selly-base"; then
    echo -e "${GREEN}✓${NC} Services are already running"
    SERVICES_WERE_RUNNING=true
else
    echo -e "${YELLOW}⚠${NC} Services are not running, starting them..."
    SERVICES_WERE_RUNNING=false
    
    # Start Docker services
    echo "Starting Docker services..."
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    echo ""
    echo "Waiting for services to be ready..."
    sleep 10
fi

# Check database
echo ""
echo "Checking database connectivity..."
if docker ps | grep -q "postgres"; then
    # Check for specific E2E postgres container first, then any postgres container
    POSTGRES_CONTAINER=$(docker ps --filter "name=selly-base-postgres-e2e" --format "{{.Names}}" | head -n 1)
    if [ -z "$POSTGRES_CONTAINER" ]; then
        POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)
    fi
    if [ -n "$POSTGRES_CONTAINER" ]; then
        if docker exec "$POSTGRES_CONTAINER" pg_isready -U postgres > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Database is ready"
        else
            echo -e "${YELLOW}⚠${NC} Database is starting..."
            sleep 5
        fi
    fi
fi

# Check services health
echo ""
echo "Verifying service health..."

if check_service "$API_URL/api/v1/health" "Backend API"; then
    echo -e "${GREEN}✓${NC} Backend API is healthy"
else
    echo -e "${RED}✗${NC} Backend API is not responding"
    echo "Please check the logs with: docker compose -f $DOCKER_COMPOSE_FILE logs"
    exit 1
fi

if check_service "$WEB_URL" "Frontend"; then
    echo -e "${GREEN}✓${NC} Frontend is healthy"
else
    echo -e "${YELLOW}⚠${NC} Frontend is not responding (may not be required for API tests)"
fi

print_section "Phase 3: Running Production-Ready Tests"

echo "Starting test execution..."
echo ""
echo -e "${CYAN}Test Categories:${NC}"
echo "  1. Security Validation (4 tests)"
echo "  2. Performance Baselines (3 tests)"
echo "  3. Database Integrity (4 tests)"
echo "  4. API Contract Validation (4 tests)"
echo "  5. Authentication & Authorization (3 tests)"
echo "  6. Data Consistency & Validation (4 tests)"
echo ""
echo -e "${CYAN}Total: 21 tests across 6 categories${NC}"
echo ""

# Set environment variables for Playwright
export WEB_BASE_URL="$WEB_URL"
export API_BASE_URL="$API_URL"

# Run the production-ready tests
if npx playwright test e2e/production-ready.e2e.spec.ts --project=chromium --reporter=list,html; then
    TEST_RESULT=0
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ All Production-Ready Tests PASSED         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
else
    TEST_RESULT=1
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ Some Production-Ready Tests FAILED        ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════╝${NC}"
fi

print_section "Phase 4: Test Report"

echo "Test report generated at: playwright-report-e2e/index.html"
echo ""
echo "To view the detailed report, run:"
echo -e "${CYAN}  npm run test:e2e:report${NC}"
echo ""

# Summary
echo -e "${CYAN}Test Summary:${NC}"
echo "  - Security tests: SQL injection, XSS, CSRF, JWT validation"
echo "  - Performance tests: Response times, concurrent requests"
echo "  - Database tests: Constraints, indexes, consistency"
echo "  - API tests: Schema validation, error handling, pagination"
echo "  - Auth tests: Protected routes, RBAC, token management"
echo "  - Validation tests: Required fields, data types, duplicates"
echo ""

# Cleanup instructions
if [ "$SERVICES_WERE_RUNNING" = false ]; then
    echo -e "${YELLOW}Note: Services were started by this script${NC}"
    echo "To stop services, run:"
    echo -e "${CYAN}  docker compose -f $DOCKER_COMPOSE_FILE down${NC}"
    echo ""
fi

print_section "Production Readiness Status"

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ System is PRODUCTION READY${NC}"
    echo ""
    echo "All critical validations passed:"
    echo "  ✓ Security measures in place"
    echo "  ✓ Performance meets baselines"
    echo "  ✓ Database integrity verified"
    echo "  ✓ API contracts validated"
    echo "  ✓ Authentication & authorization working"
    echo "  ✓ Data validation enforced"
    echo ""
    exit 0
else
    echo -e "${RED}✗ System is NOT READY for production${NC}"
    echo ""
    echo "Please review failed tests and fix issues before deploying"
    echo "Check the test report for detailed failure information"
    echo ""
    exit 1
fi
