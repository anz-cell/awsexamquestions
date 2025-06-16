# AWS Exam Platform - Test Suite

This directory contains comprehensive tests for the AWS Solutions Architect Associate exam practice platform.

## Directory Structure

```
tests/
├── components/          # Component unit tests
├── services/           # Service layer tests
├── utils/             # Utility function tests
├── fixtures/          # Test data and mock objects
├── __mocks__/         # Mock implementations
├── coverage/          # Test coverage reports
├── jest.config.js     # Jest configuration
├── setupTests.js      # Global test setup
└── README.md          # This file
```

## Test Categories

### Component Tests

- App.test.js: Main application flow, exam state management, timer
- QuestionDisplay.test.js: Question rendering, answer selection
- ExamScreen.test.js: Exam interface, navigation
- ResultsScreen.test.js: Results calculation, domain statistics

### Service Tests

- GeminiService.test.js: API calls, question generation, error handling

### Utility Tests

- examUtils.test.js: Time formatting, score calculation, answer validation

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test
npm test -- App.test.js
```

## Coverage Thresholds

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Data

Sample AWS exam questions covering all four domains:

1. Design Secure Applications and Architectures (30%)
2. Design Resilient Architectures (26%)
3. Design High-Performing Architectures (24%)
4. Design Cost-Optimized Architectures (20%)

## Configuration

Key files:

- jest.config.js: Test environment and coverage settings
- setupTests.js: Global mocks and custom matchers
- fixtures/: Sample questions and mock data

## Contributing

When adding tests:

1. Follow existing patterns
2. Include positive and negative cases
3. Test edge cases and errors
4. Maintain coverage thresholds
