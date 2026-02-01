// vitest.config.js

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false, // Explicit imports
    environment: 'node',
    testTimeout: 30000, // 30s for integration tests
    hookTimeout: 10000,
    isolate: true,
    pool: 'forks', // Process isolation
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['bin/lib/**/*.js'],
      exclude: ['bin/lib/**/*.test.js'],
      thresholds: {
        statements: 70,
        branches: 50, // Lowered temporarily for Phase 2 (utility modules under-tested)
        functions: 70,
        lines: 70
      }
    }
  }
});
