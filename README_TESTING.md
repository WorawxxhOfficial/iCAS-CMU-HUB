# Testing Guide

## Overview

This project uses **Jest** for backend testing and **Vitest** for frontend testing.

## Backend Testing (Jest)

### Setup

Backend tests are located in `backend/src/__tests__/`

### Running Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test setup and configuration
├── features/
│   └── auth/
│       ├── authController.test.ts
│       └── validation.test.ts
```

### Writing Backend Tests

Example test file:

```typescript
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../path/to/app';

describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });

    expect(response.status).toBe(200);
  });
});
```

## Frontend Testing (Vitest)

### Setup

Frontend tests are located in `src/__tests__/`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests for CI (single run)
npm run test:ci
```

### Test Structure

```
src/__tests__/
├── setup.ts                    # Test setup and configuration
├── components/
│   └── LoginHub.test.tsx
└── utils/
    └── validation.test.ts
```

### Writing Frontend Tests

Example test file:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## CI/CD

Tests run automatically on GitHub Actions when you push to `main` or `develop` branches, or when creating a pull request.

### GitHub Actions Workflow

The CI pipeline:
1. Runs backend tests with MySQL service
2. Runs frontend tests
3. Builds both backend and frontend
4. Uploads coverage reports to Codecov (optional)

See `.github/workflows/ci.yml` for details.

## Coverage

Coverage reports are generated in:
- Backend: `backend/coverage/`
- Frontend: `coverage/`

View HTML coverage reports:
- Backend: Open `backend/coverage/index.html`
- Frontend: Open `coverage/index.html`

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Mocking**: Mock external dependencies (APIs, databases, etc.)
5. **Coverage**: Aim for >80% code coverage, but focus on testing critical paths

## Troubleshooting

### Backend Tests

- **Database Connection**: Ensure test database is configured in `.env` or test environment
- **Port Conflicts**: Make sure test server uses different port than dev server

### Frontend Tests

- **Module Resolution**: Check `vite.config.ts` for proper path aliases
- **Mock Issues**: Ensure mocks are properly set up in `setup.ts`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

