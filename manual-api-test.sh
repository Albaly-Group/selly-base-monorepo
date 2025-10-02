#!/bin/bash

# Manual API Permission Testing Script
# This script demonstrates logging in with different users and viewing their permissions

API_URL="http://localhost:3001"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Manual API Permission Testing${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Test 1: Platform Admin
echo -e "${BLUE}1. Platform Admin (Full Access)${NC}"
echo "Email: platform@albaly.com"
echo "Expected: Wildcard (*) permission"
echo ""
response=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "platform@albaly.com", "password": "password123"}')
echo "Response:"
echo "$response" | jq '{
  user: .user.email,
  role: .user.roles[0].name,
  permissions: .user.roles[0].permissions
}'
echo ""

# Test 2: Customer Admin
echo -e "${BLUE}2. Customer Admin (Organization Access)${NC}"
echo "Email: admin@albaly.com"
echo "Expected: org:*, users:*, lists:*, projects:*"
echo ""
response=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@albaly.com", "password": "password123"}')
echo "Response:"
echo "$response" | jq '{
  user: .user.email,
  role: .user.roles[0].name,
  organization: .user.organization.name,
  permissions: .user.roles[0].permissions
}'
echo ""

# Test 3: Customer Staff
echo -e "${BLUE}3. Customer Staff (Limited Access)${NC}"
echo "Email: staff@albaly.com"
echo "Expected: projects:*, lists:*, companies:read"
echo ""
response=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@albaly.com", "password": "password123"}')
echo "Response:"
echo "$response" | jq '{
  user: .user.email,
  role: .user.roles[0].name,
  organization: .user.organization.name,
  permissions: .user.roles[0].permissions
}'
echo ""

# Test 4: Customer User
echo -e "${BLUE}4. Customer User (Basic Access)${NC}"
echo "Email: user@albaly.com"
echo "Expected: lists:create, lists:read:own, companies:read, contacts:read"
echo ""
response=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@albaly.com", "password": "password123"}')
echo "Response:"
echo "$response" | jq '{
  user: .user.email,
  role: .user.roles[0].name,
  organization: .user.organization.name,
  permissions: .user.roles[0].permissions
}'
echo ""

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}All Manual Tests Complete${NC}"
echo -e "${GREEN}=====================================${NC}"
