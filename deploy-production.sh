#!/bin/bash

# Production Deployment Script for Selly Base with Docker Compose + Traefik
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Selly Base Production Deployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${YELLOW}Warning: .env.prod file not found${NC}"
    echo "Creating from template..."
    if [ -f .env.prod.example ]; then
        cp .env.prod.example .env.prod
        echo -e "${YELLOW}Please edit .env.prod with your configuration${NC}"
        echo "Required: DOMAIN, POSTGRES_PASSWORD, JWT_SECRET"
        exit 1
    else
        echo -e "${RED}Error: .env.prod.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env.prod

# Validate required variables
REQUIRED_VARS=("DOMAIN" "POSTGRES_PASSWORD" "JWT_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env.prod${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Environment configuration validated${NC}"

# Check DNS configuration
echo ""
echo "Checking DNS configuration..."
if command -v nslookup &> /dev/null; then
    nslookup $DOMAIN > /dev/null 2>&1 && echo -e "${GREEN}✓ DNS configured for $DOMAIN${NC}" || echo -e "${YELLOW}⚠ Warning: DNS not configured for $DOMAIN${NC}"
    nslookup api.$DOMAIN > /dev/null 2>&1 && echo -e "${GREEN}✓ DNS configured for api.$DOMAIN${NC}" || echo -e "${YELLOW}⚠ Warning: DNS not configured for api.$DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠ nslookup not available, skipping DNS check${NC}"
fi

# Create required directories
echo ""
echo "Creating required directories..."
mkdir -p traefik/dynamic postgres
echo -e "${GREEN}✓ Directories created${NC}"

# Build Docker images
echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}✓ Docker images built successfully${NC}"

# Start services
echo ""
echo -e "${YELLOW}Starting services...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo -e "${GREEN}✓ Services started${NC}"

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker compose -f docker-compose.prod.yml ps

# Health check
echo ""
echo "Performing health checks..."
sleep 5

# Check if services are accessible
RETRY_COUNT=0
MAX_RETRIES=30

echo "Waiting for API to be ready..."
until docker exec selly-api wget --spider -q http://localhost:3001/health 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo -n "."
    sleep 2
    ((RETRY_COUNT++))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ API health check failed${NC}"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs api"
else
    echo -e "${GREEN}✓ API is healthy${NC}"
fi

RETRY_COUNT=0
echo "Waiting for Frontend to be ready..."
until docker exec selly-web wget --spider -q http://localhost:3000 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo -n "."
    sleep 2
    ((RETRY_COUNT++))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ Frontend health check failed${NC}"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs web"
else
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
fi

# Display access information
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Your application is now running:"
echo ""
echo -e "Frontend:         ${GREEN}https://$DOMAIN${NC}"
echo -e "API:              ${GREEN}https://api.$DOMAIN${NC}"
echo -e "API Docs:         ${GREEN}https://api.$DOMAIN/docs${NC}"
echo -e "Traefik Dashboard: ${GREEN}https://traefik.$DOMAIN${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:       docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop services:   docker compose -f docker-compose.prod.yml down"
echo "  Restart:         docker compose -f docker-compose.prod.yml restart"
echo "  Status:          docker compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${YELLOW}Note: SSL certificates may take a few minutes to be issued.${NC}"
echo -e "${YELLOW}If you see certificate errors initially, wait 2-3 minutes and try again.${NC}"
echo ""
