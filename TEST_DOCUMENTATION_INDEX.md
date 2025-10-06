# Test Documentation Index

This document serves as a central index for all testing documentation in the Selly Base project.

## Overview Documents

### Core Testing Documentation
- **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Comprehensive testing strategy and architecture
- **[TEST_SUITE_COMPLETE.md](./TEST_SUITE_COMPLETE.md)** - Complete overview of the implemented test suite
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Test implementation completion summary
- **[TEST_QUICK_START.md](./TEST_QUICK_START.md)** - Quick start guide for running tests

### Enhanced Testing Documentation
- **[TEST_ENHANCEMENTS.md](./TEST_ENHANCEMENTS.md)** - Comprehensive guide to all test enhancements
- **[TEST_ENHANCEMENTS_QUICK_START.md](./TEST_ENHANCEMENTS_QUICK_START.md)** - Quick reference for enhanced tests

---

## Test Types

### 1. Frontend Component Tests
- **Location**: `/apps/web/__tests__/`
- **Framework**: Jest + React Testing Library
- **Documentation**: [apps/web/__tests__/README.md](./apps/web/__tests__/README.md)
- **Running**: `cd apps/web && npm test`

### 2. Backend Unit Tests
- **Location**: `/apps/api/src/**/*.spec.ts`
- **Framework**: Jest
- **Documentation**: Inline comments in test files
- **Running**: `cd apps/api && npm test`

### 3. Backend API Tests
- **Location**: `/apps/api/test/api/`
- **Framework**: Playwright APIRequestContext
- **Documentation**: [apps/api/test/README.md](./apps/api/test/README.md)
- **Running**: `cd apps/api && npm run test:api`

### 4. Backend Integration Tests
- **Location**: `/apps/api/test/integration/`
- **Framework**: Jest + Docker PostgreSQL
- **Documentation**: [apps/api/test/README.md](./apps/api/test/README.md)
- **Running**: `cd apps/api && npm run test:integration`

### 5. End-to-End Tests
- **Location**: `/e2e/`
- **Framework**: Playwright with Browser Automation
- **Documentation**: [e2e/README.md](./e2e/README.md)
- **Running**: `npm run test:e2e`

---

## Enhanced Test Types

### 6. Visual Regression Tests ✨
- **Location**: `/e2e/visual-regression.spec.ts`
- **Framework**: Playwright Screenshots + Chromatic
- **Configuration**: `.chromatic.config.json`
- **Documentation**: [TEST_ENHANCEMENTS.md#1-visual-regression-testing](./TEST_ENHANCEMENTS.md#1-visual-regression-testing)
- **Running**: `npm run test:visual`
- **Update Baselines**: `npm run test:visual:update`

### 7. Performance Tests ✨
- **Tool**: Lighthouse CI
- **Configuration**: `.lighthouserc.js`
- **Documentation**: [TEST_ENHANCEMENTS.md#2-performance-testing](./TEST_ENHANCEMENTS.md#2-performance-testing)
- **Running**: `npm run test:performance`
- **Reports**: `.lighthouseci/` directory

### 8. Accessibility Tests ✨
- **Location**: `/e2e/accessibility.spec.ts`
- **Framework**: axe-core with Playwright
- **Configuration**: `axe.config.js`
- **Documentation**: [TEST_ENHANCEMENTS.md#3-accessibility-testing](./TEST_ENHANCEMENTS.md#3-accessibility-testing)
- **Running**: `npm run test:a11y`
- **Standards**: WCAG 2.1 Level AA

### 9. Load Tests ✨
- **Tool**: k6
- **Configuration**: `k6.config.js`
- **Documentation**: [TEST_ENHANCEMENTS.md#4-load-testing](./TEST_ENHANCEMENTS.md#4-load-testing)
- **Running**: `npm run test:load`
- **Scenarios**: Ramp-up, Stress, Spike tests

### 10. Contract Tests ✨
- **Location**: `/apps/api/test/contract/`
- **Framework**: Pact
- **Documentation**: [TEST_ENHANCEMENTS.md#5-contract-testing](./TEST_ENHANCEMENTS.md#5-contract-testing)
- **Running**: `npm run test:contract`
- **Contracts**: `pacts/` directory

### 11. Security Tests ✨
- **Tool**: OWASP ZAP
- **Configuration**: `zap.config.yaml`
- **Documentation**: [TEST_ENHANCEMENTS.md#6-security-testing](./TEST_ENHANCEMENTS.md#6-security-testing)
- **Running**: `npm run test:security`
- **Reports**: `zap-reports/` directory

### 12. Code Coverage ✨
- **Target**: 90%+ coverage
- **Tools**: Jest Coverage + Istanbul
- **Documentation**: [TEST_ENHANCEMENTS.md#7-enhanced-test-coverage-90](./TEST_ENHANCEMENTS.md#7-enhanced-test-coverage-90)
- **Running**: `npm run test:coverage`
- **Reports**: `apps/web/coverage/` and `apps/api/coverage/`

---

## Configuration Files

### Core Configuration
- `playwright.config.ts` - E2E test configuration
- `apps/api/playwright.config.ts` - API test configuration
- `apps/web/jest.config.js` - Frontend test configuration
- `apps/api/jest.config.js` - Backend test configuration

### Enhancement Configuration
- `.chromatic.config.json` - Visual regression testing
- `.lighthouserc.js` - Performance testing
- `axe.config.js` - Accessibility testing
- `k6.config.js` - Load testing
- `zap.config.yaml` - Security testing

### CI/CD Configuration
- `.github/workflows/test.yml` - GitHub Actions test workflow

---

## Quick Command Reference

### Core Tests
```bash
# All tests
npm test

# Frontend only
cd apps/web && npm test

# Backend only
cd apps/api && npm test

# E2E tests
npm run test:e2e
```

### Enhanced Tests
```bash
# Visual regression
npm run test:visual

# Accessibility
npm run test:a11y

# Performance
npm run test:performance

# Load testing
npm run test:load

# Contract testing
npm run test:contract

# Security
npm run test:security

# Coverage
npm run test:coverage

# All tests
npm run test:all
```

---

## Test Reports

### Location of Reports

| Test Type | Report Location | View Command |
|-----------|----------------|--------------|
| Frontend | `apps/web/coverage/` | `open apps/web/coverage/index.html` |
| Backend | `apps/api/coverage/` | `open apps/api/coverage/index.html` |
| E2E | `playwright-report-e2e/` | `npm run test:e2e:report` |
| Visual | `test-results/` | Check screenshots in folder |
| Performance | `.lighthouseci/` | `lhci open` |
| Accessibility | Console + `test-results/` | Check test output |
| Load | Console | Real-time terminal output |
| Contract | `pacts/` | View JSON files |
| Security | `zap-reports/` | `open zap-reports/security-report.html` |

---

## Development Workflow

### Daily Development
1. Run component/unit tests: `npm test`
2. Run accessibility tests: `npm run test:a11y`
3. Check for visual changes: `npm run test:visual`

### Before Committing
1. Run full test suite: `npm run test:all`
2. Check test coverage: `npm run test:coverage`
3. Verify no accessibility violations

### Before Deploying
1. Run E2E tests: `npm run test:e2e`
2. Run performance tests: `npm run test:performance`
3. Run security scan: `npm run test:security`
4. Run load tests: `npm run test:load`

### After UI Changes
1. Update visual baselines: `npm run test:visual:update`
2. Verify accessibility: `npm run test:a11y`
3. Check performance impact: `npm run test:performance`

### After API Changes
1. Update contracts: `npm run test:contract`
2. Run API tests: `cd apps/api && npm run test:api`
3. Run integration tests: `cd apps/api && npm run test:integration`

---

## CI/CD Pipeline

The GitHub Actions workflow automatically runs:

### On Every Push/PR
- ✅ Frontend component tests
- ✅ Backend unit tests
- ✅ Backend API tests
- ✅ Backend integration tests
- ✅ Accessibility tests
- ✅ Visual regression tests

### On Main Branch Push
- ✅ E2E tests
- ✅ Performance tests
- ✅ Security tests

### Test Artifacts
- Coverage reports
- Test execution reports
- Screenshots (on failure)
- Performance reports
- Security scan results

---

## Test Statistics

| Test Type | Count | Status |
|-----------|-------|--------|
| Frontend Component | 27 | ✅ Complete |
| Backend Unit | 15+ | ✅ Complete |
| Backend API | 65+ | ✅ Complete |
| Backend Integration | 40+ | ✅ Complete |
| End-to-End | 25+ | ✅ Complete |
| Visual Regression | 15+ | ✅ Complete |
| Accessibility | 10+ | ✅ Complete |
| **TOTAL** | **195+** | ✅ |

---

## Best Practices

### Test Writing
- Write descriptive test names
- Test behavior, not implementation
- Keep tests independent and isolated
- Use realistic test data
- Mock external dependencies appropriately

### Test Maintenance
- Update tests when requirements change
- Keep test data current
- Review and update baselines regularly
- Monitor test execution time
- Refactor flaky tests

### Code Coverage
- Aim for 90%+ coverage on new code
- Focus on meaningful coverage
- Test error paths and edge cases
- Don't sacrifice quality for coverage numbers

---

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check environment variables
   - Verify dependencies are installed
   - Check timing issues (increase timeouts)

2. **Visual tests showing differences**
   - Review changes carefully
   - Update baselines if changes are intentional
   - Check viewport consistency

3. **Performance tests below threshold**
   - Profile application performance
   - Check network conditions
   - Optimize critical rendering path

4. **Accessibility violations**
   - Fix immediately - don't accumulate debt
   - Test with screen readers manually
   - Review WCAG guidelines

5. **Load tests failing**
   - Check system resources
   - Verify database connection pool
   - Monitor backend response times

---

## Resources

### Official Documentation
- [Playwright](https://playwright.dev/)
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Chromatic](https://www.chromatic.com/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core](https://github.com/dequelabs/axe-core)
- [k6](https://k6.io/docs/)
- [Pact](https://docs.pact.io/)
- [OWASP ZAP](https://www.zaproxy.org/docs/)

### Best Practices
- [Testing Best Practices](https://martinfowler.com/testing/)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance](https://web.dev/performance/)

---

## Support

For questions or issues:
1. Check this index for relevant documentation
2. Review the troubleshooting section
3. Consult tool-specific documentation
4. Check GitHub discussions

---

## Document Version

- **Last Updated**: 2024
- **Version**: 2.0.0 (with enhancements)
- **Maintained By**: Development Team

---

**Note**: This is a living document. Keep it updated as new tests are added or processes change.
