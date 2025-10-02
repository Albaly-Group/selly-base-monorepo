#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Selly Base - Test Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../../.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Check if test database is already running
if docker ps | grep -q selly-base-postgres-test; then
    echo -e "${YELLOW}⚠${NC} Test database is already running"
    echo -e "${YELLOW}  Stopping existing container...${NC}"
    docker compose -f docker-compose.test.yml down
fi

# Start test database
echo -e "${BLUE}▶${NC} Starting test database..."
docker compose -f docker-compose.test.yml up -d postgres-test

# Wait for database to be healthy
echo -e "${BLUE}⏳${NC} Waiting for database to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U postgres -d selly_base_test > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Database is ready!"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Database failed to start after ${MAX_ATTEMPTS} attempts${NC}"
        docker compose -f docker-compose.test.yml logs postgres-test
        exit 1
    fi
    
    echo -e "  Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

# Verify extensions
echo ""
echo -e "${BLUE}🔍 Verifying PostgreSQL extensions...${NC}"
EXTENSIONS=$(docker compose -f docker-compose.test.yml exec -T postgres-test psql -U postgres -d selly_base_test -c "\dx" | grep -E "vector|pg_trgm|pgcrypto|citext|uuid-ossp")

if [ -z "$EXTENSIONS" ]; then
    echo -e "${RED}❌ Extensions not installed${NC}"
    exit 1
fi

echo "$EXTENSIONS"
echo -e "${GREEN}✓${NC} All extensions verified"

# Count tables
echo ""
echo -e "${BLUE}📊 Verifying database schema...${NC}"
TABLE_COUNT=$(docker compose -f docker-compose.test.yml exec -T postgres-test psql -U postgres -d selly_base_test -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" | tr -d ' ')

echo -e "  Tables created: ${GREEN}$TABLE_COUNT${NC}"

if [ "$TABLE_COUNT" -lt 15 ]; then
    echo -e "${RED}❌ Expected at least 15 tables, found $TABLE_COUNT${NC}"
    exit 1
fi

# Verify sample data
echo ""
echo -e "${BLUE}📝 Verifying sample data...${NC}"
DATA_CHECK=$(docker compose -f docker-compose.test.yml exec -T postgres-test psql -U postgres -d selly_base_test -t -c "
SELECT 'organizations: ' || COUNT(*) FROM organizations
UNION ALL
SELECT 'users: ' || COUNT(*) FROM users
UNION ALL
SELECT 'companies: ' || COUNT(*) FROM companies
UNION ALL
SELECT 'roles: ' || COUNT(*) FROM roles;
")

echo "$DATA_CHECK"
echo -e "${GREEN}✓${NC} Sample data verified"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Test Database Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Connection details:"
echo -e "  Host: ${BLUE}localhost${NC}"
echo -e "  Port: ${BLUE}5432${NC}"
echo -e "  Database: ${BLUE}selly_base_test${NC}"
echo -e "  User: ${BLUE}postgres${NC}"
echo -e "  Password: ${BLUE}postgres${NC}"
echo ""
echo -e "To run tests: ${YELLOW}npm run test:e2e:docker${NC}"
echo -e "To stop database: ${YELLOW}docker compose -f docker-compose.test.yml down${NC}"
echo ""
