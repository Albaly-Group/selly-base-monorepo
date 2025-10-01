#!/bin/bash

# Stop PostgreSQL database for Selly Base

set -e

echo "🛑 Stopping PostgreSQL..."

docker compose down

echo "✅ PostgreSQL stopped successfully!"
echo ""
echo "💡 To remove all data as well, run:"
echo "   docker compose down -v"
