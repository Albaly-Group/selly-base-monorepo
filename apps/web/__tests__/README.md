# Frontend Component Tests

This directory contains **frontend component tests** that test UI components in isolation using Jest and React Testing Library.

## Test Architecture

These tests are part of the project's comprehensive testing strategy:

```
┌─────────────────────────────────────────────────────────────┐
│  1. E2E Tests (/e2e/)                                        │
│     Frontend UI → Backend API → Database                    │
│                                                              │
│  2. Backend API Tests (apps/api/test/api/)                  │
│     Backend API endpoints only                              │
│                                                              │
│  3. Backend Integration Tests (apps/api/test/integration/)  │
│     Backend + Database (no UI)                              │
│                                                              │
│  4. Frontend Component Tests (THIS DIRECTORY) ⬅             │
│     UI components in isolation (no backend)                 │
└─────────────────────────────────────────────────────────────┘
```

## What are Component Tests?

Frontend component tests verify that individual React components:
- Render correctly with different props
- Handle user interactions properly
- Validate form inputs
- Display error messages
- Update state correctly

**No backend or database required** - API calls are mocked.

## Running Tests

```bash
# From apps/web directory
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage report
```

## Test Structure

```
__tests__/
├── components/              # Component tests
│   ├── login-form.test.tsx
│   ├── company-table.test.tsx
│   ├── company-create-dialog.test.tsx
│   └── navigation.test.tsx
└── integration/            # Integration tests (future)
```

## Writing Component Tests

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/login-form'

describe('LoginForm', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
  
  it('should validate required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    // Check validation error
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })
})
```

## Best Practices

1. **Test User Behavior**: Test what users see and do, not implementation details
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock API Calls**: Use `jest.fn()` or `jest.mock()` for external dependencies
4. **Keep Tests Isolated**: Each test should be independent
5. **Clean Up**: Reset mocks between tests using `beforeEach`

## Test Utilities

### Available Testing Tools

- `render()` - Render React components
- `screen` - Query rendered components
- `fireEvent` - Simulate user events
- `waitFor()` - Wait for async updates
- `userEvent` - More realistic user interactions

### Common Patterns

```typescript
// Query elements
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)

// Fire events
fireEvent.change(input, { target: { value: 'test' } })
fireEvent.click(button)

// Async assertions
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})

// Mock fetch
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' })
})
```

## Difference from Other Test Types

### Component Tests (This Directory)
- **What**: Tests UI components in isolation
- **When**: Testing component rendering and behavior
- **Speed**: Fast (no network, no backend)
- **Scope**: Frontend only

### E2E Tests (`/e2e/`)
- **What**: Tests complete user workflows
- **When**: Critical user journeys
- **Speed**: Slow (full browser automation)
- **Scope**: Frontend + Backend + Database

### Backend API Tests (`apps/api/test/api/`)
- **What**: Tests API endpoints
- **When**: API contract validation
- **Speed**: Fast (no UI)
- **Scope**: Backend only

### Backend Integration Tests (`apps/api/test/integration/`)
- **What**: Tests backend with database
- **When**: Business logic validation
- **Speed**: Medium (database operations)
- **Scope**: Backend + Database

## Configuration

- **Config File**: `jest.config.js`
- **Setup File**: `jest.setup.js`
- **Test Pattern**: `**/__tests__/**/*.test.ts?(x)`

## Coverage

Generate coverage report:

```bash
npm run test:coverage
```

Coverage report will be available in `coverage/` directory.

## Troubleshooting

### Tests Failing

1. **Mock not working**: Check `jest.setup.js` for global mocks
2. **Component not rendering**: Ensure all required props are provided
3. **Async timeout**: Increase timeout in `waitFor({ timeout: 5000 })`

### Common Errors

```typescript
// ❌ Wrong - testing implementation
expect(component.state.isLoading).toBe(true)

// ✅ Right - testing user behavior
expect(screen.getByText(/loading/i)).toBeInTheDocument()
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Project Testing Architecture](../../TESTING_ARCHITECTURE.md)

## Future Enhancements

- [ ] Add integration tests for complex workflows
- [ ] Add visual regression testing
- [ ] Add accessibility testing
- [ ] Increase test coverage to 80%+
- [ ] Add performance testing

---

**Last Updated**: 2025  
**Test Framework**: Jest + React Testing Library  
**Total Tests**: 20+ component tests  
**Status**: ✅ Ready for use
