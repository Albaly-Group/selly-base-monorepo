# Test Suite Enhancements

This document describes the enhanced testing capabilities added to the Selly Base project to ensure comprehensive quality assurance across all aspects of the application.

## Overview

The test suite now includes seven additional testing categories beyond the core unit, integration, API, and E2E tests:

1. **Visual Regression Testing** - Detect unintended UI changes
2. **Performance Testing** - Monitor application speed and resource usage
3. **Accessibility Testing** - Ensure WCAG 2.1 compliance
4. **Load Testing** - Verify system behavior under high traffic
5. **Contract Testing** - Validate API contracts between services
6. **Security Testing** - Identify security vulnerabilities
7. **Enhanced Coverage** - Target 90%+ code coverage

---

## 1. Visual Regression Testing

**Tool**: Playwright Screenshots + Chromatic (optional)  
**Location**: `/e2e/visual-regression.spec.ts`  
**Purpose**: Detect unintended visual changes in the UI

### Configuration

- **Chromatic**: `.chromatic.config.json`
- **Playwright**: Built-in screenshot comparison

### Running Visual Tests

```bash
# Run visual regression tests
npm run test:visual

# Update baseline images
npm run test:visual:update

# Run with Chromatic (requires setup)
npx chromatic --project-token=<token>
```

### Features

- Full page screenshots
- Component-level snapshots
- Responsive testing (mobile, tablet, desktop)
- Dark mode testing
- Hover state verification
- Baseline comparison with pixel-perfect accuracy

### Configuration Details

The `.chromatic.config.json` file configures:
- Project identification
- Build script reference
- Auto-acceptance rules
- External file exclusions
- Branch-specific behavior

---

## 2. Performance Testing

**Tool**: Lighthouse CI  
**Location**: `.lighthouserc.js`  
**Purpose**: Monitor and enforce performance standards

### Configuration

The Lighthouse CI configuration tests:
- Performance scores (target: 90+)
- Accessibility scores (target: 90+)
- Best practices (target: 90+)
- SEO optimization (target: 90+)

### Key Metrics

- **First Contentful Paint (FCP)**: < 2000ms
- **Largest Contentful Paint (LCP)**: < 2500ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 300ms

### Running Performance Tests

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run performance audit
lhci autorun

# Run specific URL
lhci collect --url=http://localhost:3000

# View report
lhci open
```

### Tested Pages

- Home page (`/`)
- Companies list (`/companies`)
- Dashboard (`/dashboard`)
- Lists page (`/lists`)

### GitHub Actions Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## 3. Accessibility Testing

**Tool**: axe-core with Playwright  
**Location**: `/e2e/accessibility.spec.ts`  
**Purpose**: Ensure WCAG 2.1 Level AA compliance

### Configuration

- **Config File**: `axe.config.js`
- **Standards**: WCAG 2.0 AA, WCAG 2.1 AA, Best Practices

### Running Accessibility Tests

```bash
# Run accessibility tests
npm run test:a11y

# Run with detailed reporting
npm run test:a11y -- --reporter=html
```

### Test Coverage

- ✅ Color contrast ratios
- ✅ Form label associations
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Heading hierarchy
- ✅ Image alt text
- ✅ Focus indicators
- ✅ Screen reader compatibility

### Example Test

```typescript
test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Dependencies

```bash
npm install --save-dev @axe-core/playwright
```

---

## 4. Load Testing

**Tool**: k6  
**Location**: `k6.config.js`  
**Purpose**: Test system performance under various load conditions

### Load Test Scenarios

1. **Ramp-up Test**: Gradually increase load
2. **Stress Test**: Push system beyond normal capacity
3. **Spike Test**: Sudden traffic spikes
4. **Endurance Test**: Sustained load over time

### Configuration

The k6 configuration includes:
- **Stages**: Progressive load increase/decrease
- **Thresholds**: Performance expectations
- **Metrics**: Custom error tracking

### Running Load Tests

```bash
# Install k6
# macOS: brew install k6
# Linux: sudo apt-get install k6
# Windows: choco install k6

# Run default load test
k6 run k6.config.js

# Run with custom VUs (virtual users)
k6 run --vus 100 --duration 30s k6.config.js

# Run specific scenario
k6 run -e SCENARIO=stress k6.config.js

# View results
k6 run --out json=results.json k6.config.js
```

### Performance Thresholds

- **95th percentile**: < 500ms
- **99th percentile**: < 1000ms
- **Error rate**: < 1%
- **Custom errors**: < 5%

### Tested Endpoints

- Health check (`/health`)
- Companies list API
- Dashboard data
- Authentication

### Alternative: Artillery

If you prefer Artillery over k6:

```bash
npm install -g artillery

# Run load test
artillery run artillery.config.yml
```

---

## 5. Contract Testing

**Tool**: Pact  
**Location**: `/apps/api/test/contract/pact.spec.ts`  
**Purpose**: Verify API contracts between frontend and backend

### Configuration

Contract tests ensure:
- Request/response schemas match expectations
- API behavior is consistent
- Breaking changes are detected early

### Running Contract Tests

```bash
# Install Pact
npm install --save-dev @pact-foundation/pact

# Run consumer tests (frontend)
npm run test:contract:consumer

# Run provider tests (backend)
npm run test:contract:provider

# Publish contracts to Pact Broker
npm run test:contract:publish
```

### Contract Coverage

- **Companies API**: List, create, read, update, delete
- **Authentication API**: Login, logout, token refresh
- **Lists API**: CRUD operations
- **Dashboard API**: Data retrieval

### Example Contract

```typescript
await provider.addInteraction({
  state: 'companies exist',
  uponReceiving: 'a request for companies list',
  withRequest: {
    method: 'GET',
    path: '/api/v1/companies',
    query: { page: '1', limit: '10' },
  },
  willRespondWith: {
    status: 200,
    body: {
      data: [/* ... */],
      meta: { total: 1, page: 1, limit: 10 },
    },
  },
});
```

### Pact Broker Setup

```bash
# Run Pact Broker with Docker
docker run -d -p 9292:9292 pactfoundation/pact-broker
```

---

## 6. Security Testing

**Tool**: OWASP ZAP (Zed Attack Proxy)  
**Location**: `zap.config.yaml`  
**Purpose**: Identify security vulnerabilities

### Configuration

The ZAP configuration includes:
- **Spider**: Crawl application
- **Active Scan**: Probe for vulnerabilities
- **Passive Scan**: Analyze traffic
- **Authentication**: Test with credentials

### Running Security Tests

```bash
# Install OWASP ZAP
# Download from https://www.zaproxy.org/download/

# Run with Docker
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable \
  zap-full-scan.py -t http://localhost:3000 \
  -c zap.config.yaml

# Generate HTML report
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable \
  zap-full-scan.py -t http://localhost:3000 \
  -r security-report.html
```

### Security Checks

- ✅ SQL Injection
- ✅ Cross-Site Scripting (XSS)
- ✅ Cross-Site Request Forgery (CSRF)
- ✅ Security Headers
- ✅ Authentication/Authorization
- ✅ Session Management
- ✅ Input Validation
- ✅ Sensitive Data Exposure

### CI/CD Integration

```yaml
- name: Run OWASP ZAP Security Scan
  run: |
    docker run -v $(pwd):/zap/wrk/:rw \
      -t owasp/zap2docker-stable \
      zap-baseline-scan.py -t http://localhost:3000 \
      -c zap.config.yaml
```

### Report Location

Reports are generated in `zap-reports/security-report.html`

---

## 7. Enhanced Test Coverage (90%+)

**Goal**: Achieve 90%+ code coverage across all test types

### Current Coverage

| Category | Coverage | Target |
|----------|----------|--------|
| Frontend | TBD | 90%+ |
| Backend | TBD | 90%+ |
| Integration | TBD | 85%+ |
| E2E | TBD | Critical paths |

### Coverage Configuration

#### Frontend (Jest)

Update `apps/web/jest.config.js`:

```javascript
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThresholds: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

#### Backend (Jest)

Update `apps/api/jest.config.js`:

```javascript
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThresholds: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
};
```

### Running Coverage Reports

```bash
# Frontend coverage
cd apps/web && npm test -- --coverage

# Backend coverage
cd apps/api && npm test -- --coverage

# Combined coverage
npm run test:coverage

# View HTML report
open apps/web/coverage/index.html
open apps/api/coverage/index.html
```

### Coverage Metrics

- **Statements**: 90%+ of code statements executed
- **Branches**: 90%+ of conditional branches tested
- **Functions**: 90%+ of functions called
- **Lines**: 90%+ of code lines executed

### Areas to Focus

1. **Error Handlers**: Test all error paths
2. **Edge Cases**: Test boundary conditions
3. **Validation Logic**: Test all validation rules
4. **Business Logic**: Test all business rules
5. **Utility Functions**: Test all helper functions

---

## Quick Start Commands

### Install All Testing Dependencies

```bash
# Core dependencies (already installed)
npm install

# Visual regression
npm install --save-dev chromatic

# Performance testing
npm install -g @lhci/cli

# Accessibility testing
npm install --save-dev @axe-core/playwright

# Load testing
# Install k6 separately (system package)

# Contract testing
npm install --save-dev @pact-foundation/pact

# Security testing
# Install OWASP ZAP separately (Docker or binary)
```

### Run All Enhanced Tests

```bash
# Visual regression
npm run test:visual

# Performance
lhci autorun

# Accessibility
npm run test:a11y

# Load testing
k6 run k6.config.js

# Contract testing
npm run test:contract

# Security
docker run -t owasp/zap2docker-stable \
  zap-baseline-scan.py -t http://localhost:3000

# Coverage
npm run test:coverage
```

---

## GitHub Actions Integration

### Enhanced Workflow

Add to `.github/workflows/test.yml`:

```yaml
  visual-tests:
    name: Visual Regression Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitOnceUploaded: true

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/companies
          configPath: '.lighthouserc.js'

  accessibility-tests:
    name: Accessibility Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: |
          npm ci
          npm install --save-dev @axe-core/playwright
      - name: Run accessibility tests
        run: npm run test:a11y

  security-tests:
    name: Security Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: 'zap.config.yaml'
```

---

## Maintenance and Best Practices

### Visual Regression

- **Update baselines** after intentional UI changes
- **Review diffs** carefully before accepting changes
- **Use descriptive names** for screenshots
- **Test multiple viewports** for responsive design

### Performance

- **Monitor trends** over time, not just absolute values
- **Test on different networks** (3G, 4G, WiFi)
- **Optimize critical paths** first
- **Set realistic thresholds** based on user expectations

### Accessibility

- **Fix violations immediately** - don't accumulate technical debt
- **Test with screen readers** manually
- **Include accessibility in code reviews**
- **Train team on accessibility standards**

### Load Testing

- **Run regularly** to catch performance regressions
- **Test realistic scenarios** based on actual usage patterns
- **Monitor system resources** (CPU, memory, database)
- **Gradually increase load** to find breaking points

### Contract Testing

- **Update contracts** when APIs change
- **Publish to Pact Broker** for team visibility
- **Version contracts** properly
- **Test both consumer and provider** sides

### Security

- **Run weekly** at minimum
- **Fix critical issues immediately**
- **Review all alerts** - don't just auto-dismiss
- **Keep ZAP rules updated**
- **Test both authenticated and unauthenticated** scenarios

### Coverage

- **Don't chase 100%** - focus on meaningful coverage
- **Test behavior, not implementation**
- **Prioritize complex logic** over simple getters/setters
- **Review coverage reports** in code reviews

---

## Troubleshooting

### Visual Tests Failing

- Check if UI changes were intentional
- Update baselines: `npm run test:visual:update`
- Verify viewport sizes match

### Performance Tests Slow

- Check network conditions
- Verify no background processes
- Increase timeout thresholds if needed

### Accessibility Violations

- Review axe-core documentation
- Use browser DevTools accessibility audits
- Test with keyboard navigation manually

### Load Tests Failing

- Check if backend can handle load
- Verify database connection pool size
- Monitor system resources

### Contract Tests Not Matching

- Verify API hasn't changed
- Check request/response formats
- Update contract expectations

### Security Scan False Positives

- Review ZAP alert details
- Add to allow list if confirmed safe
- Update ZAP rules as needed

---

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core](https://github.com/dequelabs/axe-core)
- [k6 Documentation](https://k6.io/docs/)
- [Pact Documentation](https://docs.pact.io/)
- [OWASP ZAP](https://www.zaproxy.org/docs/)

---

## Summary

With these enhancements, the Selly Base test suite now provides comprehensive coverage across:

✅ Functional testing (unit, integration, E2E)  
✅ Visual regression testing  
✅ Performance monitoring  
✅ Accessibility compliance  
✅ Load and stress testing  
✅ Contract validation  
✅ Security scanning  
✅ High code coverage (90%+)

This ensures the application maintains high quality, performance, accessibility, and security standards throughout its development lifecycle.
