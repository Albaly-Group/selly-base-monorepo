# Test Enhancements - Quick Start Guide

This guide provides quick commands to run all the enhanced test suites.

## Prerequisites

### Required Tools

1. **Node.js & npm** (already installed)
2. **Playwright** (already installed)
3. **Docker** (for security testing and load testing optional containers)

### Optional Tools

4. **Lighthouse CI**: `npm install -g @lhci/cli`
5. **k6**: Install from https://k6.io/docs/getting-started/installation/
6. **OWASP ZAP**: Use Docker image or download from https://www.zaproxy.org/download/

## Installation

```bash
# Install all dependencies
npm install

# Install enhanced testing dependencies
npm install --save-dev @axe-core/playwright @lhci/cli @pact-foundation/pact lost-pixel
```

## Quick Commands

### Core Tests (Existing)

```bash
# Frontend component tests
cd apps/web && npm test

# Backend unit tests
cd apps/api && npm test

# Backend API tests
cd apps/api && npm run test:api

# Backend integration tests
cd apps/api && npm run test:integration

# E2E tests
npm run test:e2e
```

### Enhanced Tests (New)

```bash
# Visual regression tests
npm run test:visual

# Update visual baselines (after UI changes)
npm run test:visual:update

# Accessibility tests
npm run test:a11y

# Performance tests (requires Lighthouse CI)
npm run test:performance

# Load tests (requires k6)
npm run test:load

# Contract tests
npm run test:contract

# Security tests (requires Docker)
npm run test:security

# Coverage report
npm run test:coverage

# Run all tests
npm run test:all
```

## Test Reports

### Visual Regression
- **Location**: `test-results/visual-regression.spec.ts-snapshots/`
- **View**: Compare screenshots in the test results folder

### Performance
- **Location**: `.lighthouseci/`
- **View**: `lhci open` or check HTML reports

### Accessibility
- **Location**: Console output + `test-results/`
- **View**: Check test output for violations

### Load Testing
- **Location**: Console output + optional `results.json`
- **View**: k6 provides real-time terminal output

### Contract Testing
- **Location**: `pacts/` directory
- **View**: JSON files with contract specifications

### Security
- **Location**: `zap-reports/security-report.html`
- **View**: Open HTML report in browser

### Coverage
- **Location**: `apps/web/coverage/` and `apps/api/coverage/`
- **View**: Open `index.html` in browser

## Development Workflow

### Before Committing

```bash
# Run core tests
npm test

# Check accessibility
npm run test:a11y

# Verify no visual regressions
npm run test:visual
```

### Before Deploying

```bash
# Run full test suite
npm run test:all

# Check performance
npm run test:performance

# Run security scan
npm run test:security
```

### After UI Changes

```bash
# Update visual baselines
npm run test:visual:update

# Verify accessibility
npm run test:a11y
```

### After API Changes

```bash
# Update contracts
npm run test:contract

# Run API tests
cd apps/api && npm run test:api
```

## Troubleshooting

### Visual Tests Failing
```bash
# View current snapshots
ls test-results/visual-regression.spec.ts-snapshots/

# Update if changes are intentional
npm run test:visual:update
```

### Accessibility Violations
```bash
# Run with detailed output
npm run test:a11y -- --reporter=verbose

# Check specific page
playwright test e2e/accessibility.spec.ts -g "home page"
```

### Performance Below Threshold
```bash
# Run single page audit
lhci collect --url=http://localhost:3000/

# Analyze specific metrics
lhci assert --preset=lighthouse:recommended
```

### Load Tests Failing
```bash
# Run with fewer virtual users
k6 run --vus 10 --duration 30s k6.config.js

# Check system resources
docker stats  # If using Docker backend
```

### Contract Tests Not Matching
```bash
# Verify API is running
curl http://localhost:3001/health

# Check contract files
cat pacts/*.json
```

### Security Scan Errors
```bash
# Run baseline scan (fewer checks)
docker run -t owasp/zap2docker-stable \
  zap-baseline-scan.py -t http://localhost:3000

# Check ZAP logs
cat zap-reports/*.log
```

## CI/CD Integration

These tests can be integrated into GitHub Actions:

```yaml
# Add to .github/workflows/test.yml

visual-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: npm run test:visual

accessibility-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: npm run test:a11y

performance-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: npm install -g @lhci/cli
    - run: npm run test:performance

security-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'http://localhost:3000'
```

## Best Practices

1. **Run accessibility tests** on every commit
2. **Update visual baselines** only after reviewing changes
3. **Run performance tests** before releases
4. **Run load tests** during off-peak hours
5. **Update contracts** when API changes
6. **Run security scans** weekly minimum
7. **Monitor coverage trends** over time

## Resources

- [Full Documentation](./TEST_ENHANCEMENTS.md)
- [Testing Architecture](./TESTING_ARCHITECTURE.md)
- [Test Suite Complete](./TEST_SUITE_COMPLETE.md)
- [Quick Start Guide](./TEST_QUICK_START.md)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [TEST_ENHANCEMENTS.md](./TEST_ENHANCEMENTS.md)
3. Consult tool-specific documentation linked in resources

---

**Happy Testing! 🧪✨**
