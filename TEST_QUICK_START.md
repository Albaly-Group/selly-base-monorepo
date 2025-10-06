# Test Suite Quick Start Guide

Quick reference for running tests in the Selly Base application.

## 🚀 Run All Tests (Recommended)

```bash
./run-all-tests.sh
```

This runs all test suites in the correct order:
1. Frontend Component Tests
2. Backend Unit Tests  
3. Backend API Tests
4. Backend Integration Tests (with Docker)

## 📋 Individual Test Commands

### Frontend Tests
```bash
cd apps/web
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```
**Time**: ~1 second  
**Tests**: 27 tests in 4 suites

### Backend API Tests
```bash
cd apps/api
npm run test:api           # Run all
npm run test:api:ui        # Interactive UI
npm run test:api:report    # View HTML report
```
**Time**: ~5-10 seconds  
**Tests**: 65+ tests

### Backend Integration Tests
```bash
cd apps/api

# First time or if database is not running
npm run test:integration:setup     # Start Docker DB

# Run tests
npm run test:integration

# When done (optional)
npm run test:integration:cleanup   # Stop Docker DB
```
**Time**: ~30-60 seconds  
**Tests**: 40+ tests  
**Requires**: Docker

### End-to-End Tests
```bash
# IMPORTANT: Start servers first!

# Terminal 1: Start backend
cd apps/api && npm run dev

# Terminal 2: Start frontend
cd apps/web && npm run dev

# Terminal 3: Run E2E tests
npm run test:e2e           # Run all
npm run test:e2e:ui        # Interactive UI
npm run test:e2e:report    # View HTML report
```
**Time**: ~2-5 minutes  
**Tests**: 25+ tests  
**Requires**: Frontend + Backend running

## 🐳 Docker Quick Commands

```bash
# Start test database
cd apps/api
npm run test:integration:setup

# Check if database is running
docker ps | grep postgres-test

# View database logs
docker logs selly-base-postgres-test

# Stop database
npm run test:integration:cleanup
```

## ⚙️ Environment Variables

### Skip Docker Tests
```bash
SKIP_DOCKER=true ./run-all-tests.sh
```

### Run E2E Tests Too
```bash
SKIP_E2E=false ./run-all-tests.sh
```

## 📊 Test Status Check

```bash
# Frontend tests
cd apps/web && npm test -- --passWithNoTests

# Backend API tests
cd apps/api && npm run test:api

# Integration tests (requires Docker)
cd apps/api && npm run test:integration
```

## 🔍 Debug Failing Tests

### Frontend Tests
```bash
cd apps/web
npm test -- --verbose
npm test -- --no-coverage
```

### Backend Tests
```bash
cd apps/api
npm run test:api:ui        # Interactive debugger
```

### E2E Tests
```bash
npm run test:e2e:ui        # Step through tests visually
```

## 📝 Common Issues

### Issue: Docker not running
```bash
# Start Docker daemon
sudo systemctl start docker

# Or on macOS
open -a Docker
```

### Issue: Port 5432 already in use
```bash
# Stop other PostgreSQL instances
docker ps | grep postgres
docker stop <container-id>

# Or change port in docker-compose.test.yml
```

### Issue: Tests timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds
```

### Issue: Frontend tests fail
```bash
# Reinstall dependencies
cd apps/web
rm -rf node_modules
npm install
```

## 🎯 Quick Test Scenarios

### Before Committing Code
```bash
# Run relevant tests only
cd apps/web && npm test              # If you changed frontend
cd apps/api && npm run test:api      # If you changed backend
```

### Before Creating PR
```bash
# Run all tests
./run-all-tests.sh
```

### After Pulling Latest Code
```bash
# Update dependencies and run tests
npm install
cd apps/web && npm install
cd apps/api && npm install

# Run all tests
cd ../../
./run-all-tests.sh
```

## 📚 Documentation

- [TEST_SUITE_COMPLETE.md](./TEST_SUITE_COMPLETE.md) - Complete test documentation
- [TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md) - Test architecture overview
- [apps/web/__tests__/README.md](./apps/web/__tests__/README.md) - Frontend test details
- [e2e/README.md](./e2e/README.md) - E2E test details
- [DOCKER_E2E_TESTING.md](./DOCKER_E2E_TESTING.md) - Docker setup guide

## ⏱️ Expected Times

| Test Suite | Time | When to Run |
|------------|------|-------------|
| Frontend Tests | ~1s | After every frontend change |
| Backend API Tests | ~5-10s | After every backend change |
| Integration Tests | ~30-60s | Before committing |
| E2E Tests | ~2-5min | Before creating PR |
| All Tests | ~5-10min | Before major releases |

## 🔄 CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

View results at: [GitHub Actions](https://github.com/albalydigital-team/selly-base-frontend/actions)

## 💡 Tips

1. **Use watch mode** during development: `npm run test:watch`
2. **Run specific test file**: `npm test -- login-form.test.tsx`
3. **View coverage**: `npm run test:coverage`
4. **Debug E2E tests**: Use `npm run test:e2e:ui` to see what's happening
5. **Keep Docker running**: If running integration tests repeatedly
6. **Run tests in parallel**: Frontend and API tests can run simultaneously

## 🆘 Getting Help

1. Check test logs for specific error messages
2. Review test documentation in README files
3. Check GitHub Actions logs for CI failures
4. Ensure all dependencies are installed
5. Verify Docker is running for integration tests

---

**Quick Links**:
- 📖 [Full Documentation](./TEST_SUITE_COMPLETE.md)
- 🏗️ [Architecture](./TESTING_ARCHITECTURE.md)
- 🐳 [Docker Setup](./DOCKER_E2E_TESTING.md)
- 🔧 [CI/CD](./.github/workflows/test.yml)
