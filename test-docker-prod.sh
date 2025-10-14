#!/bin/bash

# Test script for Docker Compose Production Setup
# This script validates the configuration without actually deploying

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Docker Compose Production Tests${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Test 1: Check Docker installation
echo -n "Test 1: Checking Docker installation... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL - Docker not installed${NC}"
    exit 1
fi

# Test 2: Check Docker Compose installation
echo -n "Test 2: Checking Docker Compose installation... "
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL - Docker Compose not installed${NC}"
    exit 1
fi

# Test 3: Validate docker-compose.prod.yml syntax
echo -n "Test 3: Validating docker-compose.prod.yml syntax... "
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL - Syntax error in docker-compose.prod.yml${NC}"
    exit 1
fi

# Test 4: Check required files exist
echo -n "Test 4: Checking required files exist... "
FILES=(
    "docker-compose.prod.yml"
    ".env.prod.example"
    "traefik/traefik.yml"
    "traefik/dynamic/tls.yml"
    "traefik/dynamic/middlewares.yml"
    "postgres/postgresql.conf"
    "Dockerfile.api.prod"
    "Dockerfile.web.prod"
    "deploy-production.sh"
    "maintenance.sh"
)

MISSING_FILES=0
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ FAIL - Missing file: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    exit 1
fi

# Test 5: Check Traefik configuration syntax
echo -n "Test 5: Validating Traefik configuration... "
if [ -f "traefik/traefik.yml" ]; then
    # Basic YAML syntax check (requires yq or python)
    if command -v python3 &> /dev/null; then
        python3 -c "import yaml; yaml.safe_load(open('traefik/traefik.yml'))" 2>/dev/null && \
        echo -e "${GREEN}✓ PASS${NC}" || echo -e "${YELLOW}⚠ WARNING - Could not validate YAML${NC}"
    else
        echo -e "${YELLOW}⚠ SKIP - Python not available for validation${NC}"
    fi
else
    echo -e "${RED}✗ FAIL - traefik/traefik.yml not found${NC}"
    exit 1
fi

# Test 6: Check scripts are executable
echo -n "Test 6: Checking scripts are executable... "
SCRIPTS=("deploy-production.sh" "maintenance.sh")
NON_EXECUTABLE=0
for script in "${SCRIPTS[@]}"; do
    if [ ! -x "$script" ]; then
        NON_EXECUTABLE=$((NON_EXECUTABLE + 1))
    fi
done

if [ $NON_EXECUTABLE -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING - Some scripts not executable (use chmod +x)${NC}"
fi

# Test 7: Check .env.prod.example has required variables
echo -n "Test 7: Checking .env.prod.example template... "
REQUIRED_VARS=("DOMAIN" "POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_DB" "JWT_SECRET")
MISSING_VARS=0
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.prod.example; then
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

if [ $MISSING_VARS -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL - Missing required variables in .env.prod.example${NC}"
    exit 1
fi

# Test 8: Check Dockerfile syntax (basic)
echo -n "Test 8: Checking Dockerfile syntax... "
if [ -f "Dockerfile.api.prod" ] && [ -f "Dockerfile.web.prod" ]; then
    # Check for basic Dockerfile structure
    if grep -q "FROM" Dockerfile.api.prod && grep -q "FROM" Dockerfile.web.prod; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL - Invalid Dockerfile structure${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ FAIL - Dockerfiles not found${NC}"
    exit 1
fi

# Test 9: Check if ports are available (if testing locally)
echo -n "Test 9: Checking if required ports are available... "
PORTS_IN_USE=0
for port in 80 443 8080; do
    if command -v lsof &> /dev/null; then
        if lsof -i :$port &> /dev/null; then
            PORTS_IN_USE=$((PORTS_IN_USE + 1))
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            PORTS_IN_USE=$((PORTS_IN_USE + 1))
        fi
    fi
done

if [ $PORTS_IN_USE -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING - Some ports already in use${NC}"
fi

# Test 10: Check documentation exists
echo -n "Test 10: Checking documentation exists... "
DOCS=(
    "DOCKER_COMPOSE_PRODUCTION.md"
    "DOCKER_PRODUCTION_QUICKSTART.md"
    "DOCKER_PRODUCTION_INDEX.md"
)
MISSING_DOCS=0
for doc in "${DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        MISSING_DOCS=$((MISSING_DOCS + 1))
    fi
done

if [ $MISSING_DOCS -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING - Some documentation missing${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Create .env.prod from .env.prod.example"
echo "2. Configure DNS to point to your server"
echo "3. Run ./deploy-production.sh"
echo ""
echo -e "${YELLOW}Note: These tests validate configuration only.${NC}"
echo -e "${YELLOW}Full deployment testing requires a server with DNS configured.${NC}"
echo ""

# Optional: Show docker-compose config preview
echo -n "Show docker-compose config preview? (y/n): "
read -t 10 show_config || show_config="n"
if [ "$show_config" == "y" ]; then
    echo ""
    echo -e "${BLUE}Docker Compose Configuration Preview:${NC}"
    echo ""
    docker compose -f docker-compose.prod.yml config | head -50
    echo "..."
    echo "(Truncated - use 'docker compose -f docker-compose.prod.yml config' to see full output)"
fi

echo ""
echo -e "${GREEN}✓ Validation complete!${NC}"
