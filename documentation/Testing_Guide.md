# Testing Guide

This document explains the testing strategy, frameworks used, and how to execute tests in the FinSight AI repository.

## 1. Testing Strategy
FinSight AI employs a multi-tiered testing strategy to ensure code quality and system reliability:
*   **Unit Tests**: Test individual functions and helpers in isolation (e.g., calculation utilities, validators).
*   **Integration Tests**: Test API endpoints and database interactions, utilizing mock services for external APIs (like OpenAI).

## 2. Test Frameworks
*   **Jest**: The core test runner and assertion library.
*   **Supertest**: Used for HTTP assertions in integration tests.
*   **MongoDB Memory Server**: Provides a spun-up, in-memory MongoDB instance for fast, isolated database testing without affecting actual data.

## 3. Running Tests

### 3.1 Run All Tests
Execute all unit and integration tests with coverage reporting:
```bash
npm run test
```

### 3.2 Run Unit Tests Only
```bash
npm run test:unit
```

### 3.3 Run Integration Tests Only
```bash
npm run test:integration
```

## 4. Writing Tests
*   Place unit tests adjacent to the file they test or in `tests/unit/`.
*   Place integration tests in `tests/integration/`. Name them `*.integration.test.js`.
*   Always use the `describe()` block to group related tests.
*   Ensure the in-memory database is cleared `afterEach` test to prevent state leakage.

## 5. Mocks
External dependencies (OpenAI, Nodemailer) must be mocked. Reference `tests/mocks/ai.mock.js` for standard AI payload mocks.
