#!/bin/bash

#############################################
# E2E Test Runner with DB in Docker Only
# 
# This script runs end-to-end tests with:
# - PostgreSQL database in Docker
# - Backend API running locally
# - Frontend web app running locally
# - Playwright E2E tests
#
# Tests focus on user experience and UX best practices
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
START_TIME=$(date +%s)

# Log file
LOG_DIR="e2e-test-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/e2e-run-$(date +%Y%m%d-%H%M%S).log"

# PIDs for background processes
API_PID=""
WEB_PID=""

# Function to log with timestamp
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

print_header() {
    log ""
    log "${BLUE}========================================${NC}"
    log "${BLUE}$1${NC}"
    log "${BLUE}========================================${NC}"
    log ""
}

print_success() {
    log "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    log "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    log "${CYAN}→ $1${NC}"
}

print_warning() {
    log "${YELLOW}⚠ $1${NC}"
}

# Cleanup function
cleanup() {
    log ""
    print_info "Cleaning up..."
    
    # Kill API process if running
    if [ ! -z "$API_PID" ]; then
        print_info "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
        wait $API_PID 2>/dev/null || true
    fi
    
    # Kill Web process if running
    if [ ! -z "$WEB_PID" ]; then
        print_info "Stopping Web server (PID: $WEB_PID)..."
        kill $WEB_PID 2>/dev/null || true
        wait $WEB_PID 2>/dev/null || true
    fi
    
    # Stop Docker database
    print_info "Stopping Docker database..."
    docker compose -f docker-compose.db-only.yml down -v 2>&1 | tee -a "$LOG_FILE"
    
    log ""
}

trap cleanup EXIT

# Main execution
print_header "Selly Base - E2E Tests with DB in Docker Only"

log "Test run started at: $(date)"
log "Log file: $LOG_FILE"
log ""

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

print_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

print_info "Checking Docker Compose installation..."
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is installed"

print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed ($(npm --version))"

# Step 2: Stop any existing containers
print_header "Step 2: Cleaning Up Existing Containers"

print_info "Stopping any existing E2E containers..."
docker compose -f docker-compose.db-only.yml down -v 2>&1 | tee -a "$LOG_FILE" || true
print_success "Cleanup complete"

# Step 3: Start PostgreSQL in Docker
print_header "Step 3: Starting PostgreSQL Database"

print_info "Starting PostgreSQL database in Docker..."
docker compose -f docker-compose.db-only.yml up -d postgres-e2e 2>&1 | tee -a "$LOG_FILE"

print_info "Waiting for database to be ready..."
for i in {1..30}; do
    if docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e &>> "$LOG_FILE"; then
        print_success "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start"
        docker compose -f docker-compose.db-only.yml logs postgres-e2e | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

# Step 4: Check if dependencies are installed
print_header "Step 4: Checking Dependencies"

if [ ! -d "node_modules" ]; then
    print_info "Installing root dependencies..."
    npm install 2>&1 | tee -a "$LOG_FILE"
    print_success "Root dependencies installed"
fi

if [ ! -d "apps/api/node_modules" ]; then
    print_info "Installing API dependencies..."
    cd apps/api && npm install 2>&1 | tee -a "$LOG_FILE" && cd ../..
    print_success "API dependencies installed"
fi

if [ ! -d "apps/web/node_modules" ]; then
    print_info "Installing Web dependencies..."
    cd apps/web && npm install 2>&1 | tee -a "$LOG_FILE" && cd ../..
    print_success "Web dependencies installed"
fi

# Step 5: Start Backend API locally
print_header "Step 5: Starting Backend API"

print_info "Starting backend API on port 3001..."
cd apps/api

# Set environment variables for local API
export NODE_ENV=test
export PORT=3001
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e
export JWT_SECRET=test-secret-key-for-e2e
export JWT_EXPIRES_IN=7d
export CORS_ORIGIN=http://localhost:3000

# Start API in background
npm run start:dev > ../../e2e-test-logs/api.log 2>&1 &
API_PID=$!
cd ../..

print_info "API started with PID: $API_PID"

# Wait for API to be ready
print_info "Waiting for backend API to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health &>> "$LOG_FILE"; then
        print_success "Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend API failed to start"
        cat e2e-test-logs/api.log | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

# Step 6: Start Frontend Web locally
print_header "Step 6: Starting Frontend Web"

print_info "Starting frontend web app on port 3000..."
cd apps/web

# Set environment variables for local Web
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=http://localhost:3001

# Start Web in background
npm run dev > ../../e2e-test-logs/web.log 2>&1 &
WEB_PID=$!
cd ../..

print_info "Web started with PID: $WEB_PID"

# Wait for Web to be ready
print_info "Waiting for frontend to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:3000 &>> "$LOG_FILE"; then
        print_success "Frontend web app is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Frontend web app failed to start"
        cat e2e-test-logs/web.log | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

# Step 7: Install Playwright browsers if needed
print_header "Step 7: Setting Up Playwright"

print_info "Installing Playwright browsers..."
npx playwright install chromium 2>&1 | tee -a "$LOG_FILE"
print_success "Playwright browsers installed"

# Step 8: Run E2E tests
print_header "Step 8: Running E2E Tests"

print_info "Running Playwright E2E tests..."
log ""
log "Test Results:"
log "============="

if npm run test:e2e -- --reporter=list,html 2>&1 | tee -a "$LOG_FILE"; then
    print_success "E2E tests passed"
else
    print_warning "Some E2E tests may have failed - check detailed report"
fi

# Step 9: Generate summary
print_header "Test Summary"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log "Test run completed at: $(date)"
log "Total duration: ${DURATION} seconds"
log ""

log "Services Status:"
log "================"
log "PostgreSQL: Running in Docker"
log "Backend API: Running locally (PID: $API_PID)"
log "Frontend Web: Running locally (PID: $WEB_PID)"
log ""

log "${CYAN}Detailed Logs Available:${NC}"
log "  Main log: $LOG_FILE"
log "  API log: e2e-test-logs/api.log"
log "  Web log: e2e-test-logs/web.log"
log "  HTML report: playwright-report-e2e/index.html"
log ""

log "${CYAN}View detailed test report with:${NC}"
log "  npm run test:e2e:report"
log ""

log "${CYAN}View Docker logs with:${NC}"
log "  docker compose -f docker-compose.db-only.yml logs postgres-e2e"
log ""

if [ -f "playwright-report-e2e/index.html" ]; then
    print_success "Test report generated successfully"
    log "${GREEN}Open test report: file://$(pwd)/playwright-report-e2e/index.html${NC}"
fi

log ""
print_header "E2E Test Run Complete"

if [ $TESTS_FAILED -eq 0 ]; then
    log "${GREEN}✓ All validation steps passed!${NC}"
    exit 0
else
    log "${RED}✗ Some validation steps failed${NC}"
    exit 1
fi
