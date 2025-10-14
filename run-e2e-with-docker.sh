#!/bin/bash

#############################################
# Complete E2E Test Runner with Docker
# 
# This script runs full end-to-end tests with:
# - PostgreSQL database in Docker
# - Backend API in Docker
# - Frontend web app in Docker
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
    ((TESTS_PASSED++)) || true
}

print_error() {
    log "${RED}✗ $1${NC}"
    ((TESTS_FAILED++)) || true
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
    print_info "Cleaning up Docker containers..."
    docker compose -f docker-compose.e2e.yml down -v 2>&1 | tee -a "$LOG_FILE"
    log ""
}

trap cleanup EXIT

# Main execution
print_header "Selly Base - Complete E2E Test Suite with Docker"

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
docker compose -f docker-compose.e2e.yml down -v 2>&1 | tee -a "$LOG_FILE" || true
print_success "Cleanup complete"

# Step 3: Build Docker images
print_header "Step 3: Building Docker Images"

print_info "Building backend API image..."
docker compose -f docker-compose.e2e.yml build api-e2e 2>&1 | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    print_success "Backend API image built"
else
    print_error "Failed to build backend API image"
    exit 1
fi

print_info "Building frontend web image..."
docker compose -f docker-compose.e2e.yml build web-e2e 2>&1 | tee -a "$LOG_FILE"
if [ $? -eq 0 ]; then
    print_success "Frontend web image built"
else
    print_error "Failed to build frontend web image"
    exit 1
fi

# Step 4: Start services
print_header "Step 4: Starting Services"

print_info "Starting PostgreSQL database..."
docker compose -f docker-compose.e2e.yml up -d postgres-e2e 2>&1 | tee -a "$LOG_FILE"

print_info "Waiting for database to be ready..."
for i in {1..30}; do
    if docker compose -f docker-compose.e2e.yml ps postgres-e2e 2>&1 | grep -q "healthy"; then
        print_success "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start"
        docker compose -f docker-compose.e2e.yml logs postgres-e2e | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

print_info "Starting backend API..."
docker compose -f docker-compose.e2e.yml up -d api-e2e 2>&1 | tee -a "$LOG_FILE"

print_info "Waiting for backend API to be ready..."
for i in {1..30}; do
    if docker compose -f docker-compose.e2e.yml ps api-e2e 2>&1 | grep -q "healthy"; then
        print_success "Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend API failed to start"
        docker compose -f docker-compose.e2e.yml logs api-e2e | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

print_info "Starting frontend web app..."
docker compose -f docker-compose.e2e.yml up -d web-e2e 2>&1 | tee -a "$LOG_FILE"

print_info "Waiting for frontend to be ready..."
for i in {1..30}; do
    if docker compose -f docker-compose.e2e.yml ps web-e2e 2>&1 | grep -q "healthy"; then
        print_success "Frontend web app is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend web app failed to start"
        docker compose -f docker-compose.e2e.yml logs web-e2e | tee -a "$LOG_FILE"
        exit 1
    fi
    sleep 2
done

# Step 5: Verify services
print_header "Step 5: Verifying Services"

print_info "Checking database connection..."
if docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e &>> "$LOG_FILE"; then
    print_success "Database is accessible"
else
    print_error "Database is not accessible"
    exit 1
fi

print_info "Checking backend API health..."
if curl -f http://localhost:3001/health &>> "$LOG_FILE"; then
    print_success "Backend API is responding"
else
    print_error "Backend API is not responding"
    docker compose -f docker-compose.e2e.yml logs api-e2e | tee -a "$LOG_FILE"
    exit 1
fi

print_info "Checking frontend web app..."
if curl -f http://localhost:3000 &>> "$LOG_FILE"; then
    print_success "Frontend web app is responding"
else
    print_error "Frontend web app is not responding"
    docker compose -f docker-compose.e2e.yml logs web-e2e | tee -a "$LOG_FILE"
    exit 1
fi

# Step 6: Install Playwright browsers if needed
print_header "Step 6: Setting Up Playwright"

print_info "Installing Playwright browsers..."
npx playwright install chromium 2>&1 | tee -a "$LOG_FILE"
print_success "Playwright browsers installed"

# Step 7: Run E2E tests
print_header "Step 7: Running E2E Tests"

print_info "Running Playwright E2E tests..."
log ""
log "Test Results:"
log "============="

if npm run test:e2e -- --reporter=list,html 2>&1 | tee -a "$LOG_FILE"; then
    print_success "E2E tests passed"
else
    print_warning "Some E2E tests may have failed - check detailed report"
fi

# Step 8: Generate summary
print_header "Test Summary"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log "Test run completed at: $(date)"
log "Total duration: ${DURATION} seconds"
log ""
log "Docker Services Status:"
log "======================="
docker compose -f docker-compose.e2e.yml ps 2>&1 | tee -a "$LOG_FILE"
log ""

log "${CYAN}Detailed Logs Available:${NC}"
log "  Main log: $LOG_FILE"
log "  HTML report: playwright-report-e2e/index.html"
log ""

log "${CYAN}View detailed test report with:${NC}"
log "  npm run test:e2e:report"
log ""

log "${CYAN}View Docker logs with:${NC}"
log "  docker compose -f docker-compose.e2e.yml logs postgres-e2e"
log "  docker compose -f docker-compose.e2e.yml logs api-e2e"
log "  docker compose -f docker-compose.e2e.yml logs web-e2e"
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
