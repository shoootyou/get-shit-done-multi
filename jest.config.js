module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns (include __tests__ and bin/lib unit tests)
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/bin/lib/**/*.test.js'
  ],
  
  // Ignore node_modules only
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'bin/**/*.js',
    'specs/**/*.js',
    '!bin/**/*.test.js',
    '!bin/lib/orchestration/test-scenarios/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds (start low, increase over time)
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    }
  },
  
  // Timeout for async tests
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Transform (none needed for CommonJS)
  transform: {},
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'node']
};
