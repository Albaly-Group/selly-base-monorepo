# Quick Verification Guide - Permissions System

## 🚀 Quick Start (2 minutes)

### Step 1: Start Infrastructure
```bash
# Start PostgreSQL
docker compose up -d postgres

# Verify database is ready
docker compose exec postgres pg_isready -U postgres -d selly_base
```

### Step 2: Start API Server
```bash
# In new terminal
cd apps/api && npm run start:dev

# Wait for: "🚀 NestJS API is running on http://localhost:3001"
```

### Step 3: Start Frontend
```bash
# In new terminal
cd apps/web && npm run dev

# Wait for: "✓ Ready in 1785ms"
```

### Step 4: Test Login
1. Open browser: http://localhost:3000
2. Login with: `platform@albaly.com` / `password123`
3. Verify dashboard shows Platform Admin features

---

## ✅ Automated Tests (30 seconds)

```bash
# Run full test suite
./test-permissions-docker.sh

# Expected output: "Tests Passed: 36, Tests Failed: 0"
```

---

## 🧪 Manual API Tests

```bash
# Test all user roles
./manual-api-test.sh

# Or test individual users:
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "platform@albaly.com", "password": "password123"}' | jq '.'
```

---

## 👥 Test User Credentials

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| platform@albaly.com | password123 | Platform Admin | Full system access |
| admin@albaly.com | password123 | Customer Admin | Organization management |
| staff@albaly.com | password123 | Customer Staff | Limited access |
| user@albaly.com | password123 | Customer User | Basic features |
| support@albaly.com | password123 | Platform Staff | Read-only platform |
| admin@sampleenterprise.com | password123 | Admin (Legacy) | Organization admin |

---

## 🔍 Quick Verification Checklist

### Infrastructure
- [ ] PostgreSQL container running: `docker compose ps postgres`
- [ ] Database healthy: `docker compose exec postgres pg_isready`
- [ ] API server running: `curl http://localhost:3001/health`
- [ ] Frontend accessible: Open http://localhost:3000

### Authentication
- [ ] Login page displays
- [ ] Platform Admin can log in
- [ ] Customer Admin can log in
- [ ] Dashboard shows correct role

### Permissions
- [ ] Automated tests pass (36/36)
- [ ] API returns permissions in login response
- [ ] Frontend shows role-based navigation
- [ ] Database queries show correct data

---

## 📊 Expected Results

### Health Check
```json
{
  "database": "connected",
  "status": "healthy"
}
```

### Login Response (Platform Admin)
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "email": "platform@albaly.com",
    "roles": [{
      "name": "platform_admin",
      "permissions": [{
        "key": "*"
      }]
    }]
  }
}
```

### Test Suite
```
Tests Passed: 36
Tests Failed: 0
Total Tests: 36
✓ All tests passed!
```

---

## 🐛 Quick Troubleshooting

### Database not connecting
```bash
docker compose restart postgres
docker compose logs postgres
```

### API not starting
```bash
# Check if port 3001 is available
netstat -tuln | grep 3001

# Check environment variables
cat apps/api/.env | grep DATABASE
```

### Frontend not loading
```bash
# Check if port 3000 is available
netstat -tuln | grep 3000

# Clear cache and restart
rm -rf apps/web/.next
cd apps/web && npm run dev
```

---

## 📚 Documentation

- **Complete Evidence**: `PERMISSIONS_FULL_STACK_TEST_EVIDENCE.md`
- **Issue Resolution**: `ISSUE_RESOLUTION_SUMMARY.md`
- **Test Guide**: `PERMISSIONS_DOCKER_TEST_GUIDE.md`
- **Quick Reference**: `PERMISSIONS_QUICK_REFERENCE.md`

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ All 36 automated tests pass
2. ✅ You can log in at http://localhost:3000
3. ✅ Dashboard displays correct role
4. ✅ Navigation menu shows role-based items
5. ✅ API returns permissions in login response
6. ✅ Database queries return correct data

---

## 🎯 Test Coverage

- ✅ 6 user roles tested
- ✅ 36 automated tests passing
- ✅ Real PostgreSQL database
- ✅ Real API authentication
- ✅ Real frontend integration
- ✅ Complete evidence captured

**Status**: ✅ VERIFIED WORKING - PRODUCTION READY

---

**Quick Help**: If you have issues, check the troubleshooting section in `PERMISSIONS_DOCKER_TEST_GUIDE.md`
