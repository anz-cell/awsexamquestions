module.exports = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],

  // File extensions to consider
  moduleFileExtensions: ["js", "jsx", "json"],

  // Transform files
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  // Test file patterns
  testMatch: ["<rootDir>/**/*.test.js", "<rootDir>/**/*.spec.js"],

  // Coverage configuration
  collectCoverageFrom: [
    "../src/**/*.{js,jsx}",
    "!../src/index.js",
    "!../src/reportWebVitals.js",
    "!../src/**/*.test.js",
    "!../src/**/*.spec.js",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Coverage directory
  coverageDirectory: "<rootDir>/coverage",

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/../node_modules/", "<rootDir>/../build/"],

  // Module directories
  moduleDirectories: ["node_modules", "<rootDir>/../src"],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Mock CSS and other static assets
  moduleNameMapping: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@tests/(.*)$": "<rootDir>/$1",
  },

  // Global test timeout
  testTimeout: 10000,

  // Error handling
  errorOnDeprecated: true,

  // Transform ignore patterns for ES6 modules
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],

  // Watch mode configuration
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
