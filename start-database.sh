#!/bin/bash

# Start PostgreSQL with pgvector for Selly Base development
# This script simplifies the database setup process

set -e

echo "🐳 Starting PostgreSQL with pgvector extension..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL container..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=30
counter=0

while [ $counter -lt $timeout ]; do
    if docker compose exec postgres pg_isready -U postgres -d selly_base > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done

echo ""

if [ $counter -eq $timeout ]; then
    echo "❌ Error: PostgreSQL failed to start within $timeout seconds"
    echo "Check logs with: docker compose logs postgres"
    exit 1
fi

# Verify extensions
echo ""
echo "🔍 Verifying PostgreSQL extensions..."
docker compose exec postgres psql -U postgres -d selly_base -c "\dx" | grep -E "vector|pg_trgm|pgcrypto|citext|uuid-ossp" || true

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: selly_base"
echo "   Username: postgres"
echo "   Password: postgres"
echo ""
echo "🔗 Connection URL:"
echo "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base"
echo ""
echo "📝 Next steps:"
echo "   1. Copy Docker environment: cp .env.docker apps/api/.env"
echo "   2. Start the API: cd apps/api && npm run start:dev"
echo "   3. Optional: Start pgAdmin with: docker compose --profile with-pgadmin up -d"
echo ""
echo "📖 For more help, see DOCKER_SETUP.md"
