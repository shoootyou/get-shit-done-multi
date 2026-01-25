module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',   // Integration tests
    '**/bin/**/*.test.js',          // Unit tests (colocated)
  ],
  collectCoverageFrom: [
    'bin/**/*.js',
    'lib-ghcc/**/*.js',
    '!bin/**/*.test.js',            // Exclude tests from coverage
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/bin/lib/orchestration/.*\\.test\\.js$',  // Standalone orchestration test runners
    '/bin/lib/templating/.*\\.test\\.js$',      // Standalone templating test runners
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
