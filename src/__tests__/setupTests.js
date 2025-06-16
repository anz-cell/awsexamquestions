// Jest setup file for testing environment
import "@testing-library/jest-dom";

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Suppress console output during tests unless needed
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;

  // Clear all mocks
  jest.clearAllMocks();
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance.now for timer tests
const mockPerformanceNow = jest.fn(() => Date.now());
Object.defineProperty(global.performance, "now", {
  writable: true,
  value: mockPerformanceNow,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock crypto.randomUUID for ID generation
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: jest.fn(() => "mocked-uuid-1234"),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock window.scrollTo
global.scrollTo = jest.fn();

// Mock window.alert, confirm, prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn(() => "mocked input");

// Mock timer functions for consistent testing
jest.setTimeout(10000); // 10 second timeout for all tests

// Custom matcher for testing time differences
expect.extend({
  toBeWithinTimeRange(received, expected, tolerance = 1000) {
    const pass = Math.abs(received - expected) <= tolerance;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within ${tolerance}ms of ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within ${tolerance}ms of ${expected}`,
        pass: false,
      };
    }
  },
});

// Custom matcher for testing AWS domain names
expect.extend({
  toBeValidAWSDomain(received) {
    const validDomains = [
      "Design Secure Applications and Architectures",
      "Design Resilient Architectures",
      "Design High-Performing Architectures",
      "Design Cost-Optimized Architectures",
    ];

    const pass = validDomains.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid AWS domain`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid AWS domain`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Utility to wait for async operations
  waitFor: async (callback, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const result = await callback();
        if (result) return result;
      } catch (error) {
        // Continue waiting
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timeout after ${timeout}ms`);
  },

  // Utility to create mock questions
  createMockQuestion: (overrides = {}) => ({
    id: 1,
    question: "Mock question?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: [0],
    explanation: "Mock explanation",
    domain: "Design High-Performing Architectures",
    type: "multiple choice",
    ...overrides,
  }),

  // Utility to create mock exam results
  createMockResults: (overrides = {}) => ({
    correct: 45,
    total: 65,
    percentage: 69,
    score: 692,
    passed: false,
    timeTaken: {
      minutes: 120,
      seconds: 30,
      totalMs: 7230000,
    },
    domainStats: {
      "Design Secure Applications and Architectures": {
        correct: 12,
        total: 20,
      },
      "Design Resilient Architectures": { correct: 11, total: 17 },
      "Design High-Performing Architectures": { correct: 10, total: 15 },
      "Design Cost-Optimized Architectures": { correct: 12, total: 13 },
    },
    ...overrides,
  }),
};

// Error boundary for React component testing
export const ErrorBoundary = ({ children, onError = () => {} }) => {
  try {
    return children;
  } catch (error) {
    onError(error);
    return <div data-testid="error-boundary">Something went wrong</div>;
  }
};
