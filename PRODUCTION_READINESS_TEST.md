# Production Readiness Test

## Overview

The **Production Readiness Test Suite** is a comprehensive validation tool that ensures the Selly Base B2B Prospecting Platform is ready for production deployment. This automated test suite checks all critical aspects of the application, from build processes to security configurations.

## Quick Start

```bash
# Run the production readiness test
npm run test:production-ready

# Or directly
./test-production-ready.sh
```

## What Gets Tested

The production readiness test suite performs **65+ comprehensive checks** across 12 categories:

### 1. Environment & Prerequisites ✅
- Node.js installation and version
- npm installation and version
- Docker and Docker Compose availability
- Git installation

### 2. Dependencies & Security 🔒
- Package.json and package-lock.json presence
- Dependency installation
- npm audit for security vulnerabilities
- Workspace package validation

### 3. Production Build Process 🏗️
- Backend API build (NestJS)
- Frontend build (Next.js)
- Shared types compilation
- Build artifact verification

### 4. Code Quality & Linting 📝
- ESLint checks for all code
- Backend code quality
- Frontend code quality
- Maximum warning thresholds

### 5. Test Suites 🧪
- Backend unit tests (Jest)
- Frontend component tests (Jest + React Testing Library)
- Backend API tests (Playwright)
- Test pass rates

### 6. Production Configuration ⚙️
- Environment variable templates
- Required production environment variables
- Configuration file presence
- Turbo configuration

### 7. Docker Production Setup 🐳
- Docker Compose files validation
- Dockerfile syntax checks
- Traefik configuration
- Deployment scripts

### 8. Database Configuration 💾
- PostgreSQL schema files
- Database configuration
- TypeORM setup
- Migration files

### 9. Documentation & Guides 📚
- README.md
- Deployment guides
- Testing documentation
- Docker production guides

### 10. Security Validation 🛡️
- .gitignore presence and content
- No .env files in repository
- No hardcoded credentials
- Security best practices

### 11. Application Startup Validation 🚀
- Startup scripts availability
- Health check endpoints
- Service dependencies
- Manual validation checklist

### 12. Performance & Best Practices ⚡
- Next.js configuration
- Build optimization
- Package-lock.json committed
- Build scripts presence

## Test Results

The script provides detailed output with color-coded results:

- ✅ **Green (PASS)**: Test passed successfully
- ⚠️ **Yellow (WARNING)**: Non-critical issue detected
- ❌ **Red (FAIL)**: Critical issue that must be addressed

### Example Output

```
========================================
PRODUCTION READINESS TEST SUITE
========================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Environment & Prerequisites
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1: Node.js is installed... ✓ PASS
Test 2: npm is installed... ✓ PASS
Test 3: Docker is installed... ✓ PASS
...

========================================
PRODUCTION READINESS TEST SUMMARY
========================================

Test Results:
  Total Tests:    65
  Passed:         64
  Failed:         0
  Warnings:       1

Success Rate: 98.5%

╔════════════════════════════════════════╗
║  ⚠ PRODUCTION READY - WITH WARNINGS   ║
╚════════════════════════════════════════╝
```

## Understanding Test Statuses

### Production Ready ✅
All critical tests pass. The application is ready for production deployment.

```
╔════════════════════════════════════════╗
║  ✓ PRODUCTION READY - ALL TESTS PASS  ║
╚════════════════════════════════════════╝
```

### Production Ready with Warnings ⚠️
All critical tests pass, but some optional checks generated warnings.

```
╔════════════════════════════════════════╗
║  ⚠ PRODUCTION READY - WITH WARNINGS   ║
╚════════════════════════════════════════╝
```

### Not Production Ready ❌
Critical tests failed. Address issues before deployment.

```
╔════════════════════════════════════════╗
║  ✗ NOT PRODUCTION READY - TESTS FAILED║
╚════════════════════════════════════════╝
```

## Test Artifacts

All test logs are saved to a temporary directory for debugging:

```
Test artifacts saved to: /tmp/selly-production-test-<timestamp>
```

Each failed test has a detailed log file:
- `test-1.log` - First test log
- `test-2.log` - Second test log
- etc.

## Next Steps After Success

When all tests pass, follow these steps for production deployment:

1. **Configure Production Environment**
   ```bash
   cp .env.prod.example .env.prod
   nano .env.prod  # Edit with production values
   ```

2. **Set Up DNS Records**
   - Point your domain to the server
   - Configure A records or CNAME as needed

3. **Deploy to Production**
   ```bash
   ./deploy-production.sh
   ```

4. **Verify Health Endpoints**
   - Frontend: https://your-domain.com
   - API Health: https://api.your-domain.com/health
   - API Docs: https://api.your-domain.com/api/docs

5. **Additional Validation**
   ```bash
   ./test-docker-prod.sh
   ```

6. **Monitor Logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

## Troubleshooting

### Build Failures

If builds fail, check:
- Node.js version (requires 18+)
- Dependencies are installed: `npm install`
- No TypeScript errors: `npm run lint`

### Test Failures

If tests fail:
- Check test logs in `/tmp/selly-production-test-*/`
- Run individual test suites to identify issues
- Ensure database is available for integration tests

### Docker Issues

If Docker tests fail:
- Verify Docker is installed and running
- Check Docker Compose is installed: `docker compose version`
- Ensure ports 80, 443, 8080 are available

### Environment Configuration

If environment checks fail:
- Copy `.env.example` files as needed
- Ensure required environment variables are defined
- Validate syntax of environment files

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Production Readiness Test
  run: npm run test:production-ready
```

```yaml
# GitLab CI example
production-ready-test:
  script:
    - npm install
    - npm run test:production-ready
```

## Related Documentation

- [Docker Production Quickstart](./DOCKER_PRODUCTION_QUICKSTART.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Docker Production Guide](./DOCKER_COMPOSE_PRODUCTION.md)

## Maintenance

### Updating Tests

To add new tests, edit `test-production-ready.sh`:

```bash
# Add a critical test
run_test "Test name" "test command"

# Add a warning-level test
run_test "Test name" "test command" "warning"

# Add an info-level test
run_test "Test name" "test command" "info"
```

### Test Categories

Tests are organized into sections:
1. Prerequisites checks
2. Security validation
3. Build process
4. Configuration
5. Documentation

Each section can be expanded as needed.

## Support

For issues or questions:
1. Check test artifact logs
2. Review related documentation
3. Run individual test commands manually
4. Consult deployment guides

## Version

- **Script**: test-production-ready.sh
- **Version**: 1.0.0
- **Last Updated**: December 2025
