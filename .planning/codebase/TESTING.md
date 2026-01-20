# Testing Patterns

**Analysis Date:** 2026-01-20

**Test Coverage:**
- Test files: 2 files
- Source files: 53 files
- Test ratio: 3.8% (test files / source files)

## Test Framework

**Runner:**
- None - Custom console-based test framework
- Philosophy: "Zero npm dependencies" - no Jest, Mocha, or other test frameworks

**Assertion Library:**
- Custom assertion functions implemented inline
- Example patterns:
  - Simple boolean checks: `if (condition) { console.log('✅ ...') } else { console.log('❌ ...') }`
  - Custom `assert()` helper: `function assert(condition, message)`
  - Custom `assertClose()` for timing tests with tolerance

**Run Commands:**
```bash
node bin/lib/orchestration/result-validator.test.js    # Result validator tests
node bin/lib/orchestration/performance-tracker.test.js  # Performance tracker tests
node bin/test-state-management.js                       # State management tests
node bin/test-command-system.js                         # Command system tests
node bin/test-cross-cli-state.js                        # Cross-CLI state tests
```

No package.json test scripts configured for test execution.

## Test File Organization

**Location:**
- Co-located with source: `performance-tracker.test.js` next to `performance-tracker.js`
- Also in `bin/` directory: `bin/test-state-management.js`, `bin/test-command-system.js`

**Naming:**
- Pattern: `*.test.js` suffix
- Example: `result-validator.test.js`, `performance-tracker.test.js`

**Structure:**
```
bin/lib/orchestration/
├── result-validator.js
├── result-validator.test.js
├── performance-tracker.js
└── performance-tracker.test.js
```

## Test Structure

**Suite Organization:**
```javascript
async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running [Component] tests...\n');

  // Test 1: Description
  try {
    const result = await someOperation();
    
    if (result && result.valid === true) {
      console.log('✅ Test 1: Operation succeeded');
      passed++;
    } else {
      console.log('❌ Test 1: Operation failed');
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 1: Error:', err.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}
```

**Patterns:**
- Setup: Inline at start of each test
- Teardown: Explicit cleanup in try-catch blocks (temp files removed)
- Assertion: Custom functions or inline conditionals
- Exit codes: 0 for success, 1 for failure

## Mocking

**Framework:** None

**Patterns:**
- File system mocking: Create real temp files in `/tmp/`, clean up after test
- No dependency injection or mock libraries used
- Tests use actual filesystem, actual state files

**Example from `result-validator.test.js`:**
```javascript
// Create temp JSON file
const tempDir = '/tmp/validator-test-' + Date.now();
await fs.mkdir(tempDir, { recursive: true });
const tempFile = path.join(tempDir, 'test.json');
await fs.writeFile(tempFile, JSON.stringify({ test: true }, null, 2));

const validator = new ResultValidator(tempDir);
const result = await validator.validateJSON('test.json');

// Cleanup
await fs.unlink(tempFile);
await fs.rmdir(tempDir);
```

**What to Mock:**
- External filesystem paths: Use `/tmp/` with timestamp-based unique names
- Time-based operations: Not mocked - use short delays and tolerance ranges

**What NOT to Mock:**
- Core Node.js APIs (`fs`, `path`, etc.) - use real implementations
- System clock - use actual timing with tolerance

## Fixtures and Factories

**Test Data:**
- Generated inline or in temp directories
- No dedicated fixtures directory
- Timestamp-based uniqueness: `'/tmp/validator-test-' + Date.now()`

**Pattern from tests:**
```javascript
const tempDir = '/tmp/validator-test-' + Date.now();
await fs.mkdir(tempDir, { recursive: true });
const tempFile = path.join(tempDir, 'test.json');
await fs.writeFile(tempFile, JSON.stringify({ test: true, data: [1, 2, 3] }, null, 2));
// ... run test
await fs.unlink(tempFile);
await fs.rmdir(tempDir);
```

**Location:**
- No central fixtures location
- Test data created and destroyed within each test

## Coverage

**Requirements:** None enforced

**View Coverage:**
- No coverage tooling configured
- Coverage is approximate based on file counts (3.8% of source files have tests)

## Test Types

**Unit Tests:**
- Focus on individual classes and functions
- Examples: `ResultValidator` validation methods, `PerformanceTracker` timing methods
- Use real filesystem, no extensive mocking

**Integration Tests:**
- Tests named `test-state-management.js`, `test-cross-cli-state.js`, `test-command-system.js`
- Test interactions between multiple components
- Test actual `.planning/` directory structure

**E2E Tests:**
- Not detected in codebase

## Common Patterns

**Async Testing:**
```javascript
// Test async operations with timing
const mark = tracker.startAgent('test-agent', 'claude');
await sleep(50); // Simulate work
const duration = await tracker.endAgent('test-agent', 'claude', mark);

if (assertClose(duration, 50, 15, 'duration close to 50ms')) {
  testsPassed++;
} else {
  testsFailed++;
}
```

**Error Testing:**
```javascript
// Test error conditions
try {
  const validator = new ResultValidator('/nonexistent-test-dir-xyz');
  const result = await validator.validateStructure();
  
  if (!result.valid && result.errors.length > 0) {
    console.log('✅ Test: Correctly detects missing directory');
    passed++;
  } else {
    console.log('❌ Test: Expected errors but got valid=true');
    failed++;
  }
} catch (err) {
  console.log('❌ Test: Validation threw error:', err.message);
  failed++;
}
```

**Timing Tests with Tolerance:**
```javascript
function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  const withinTolerance = diff <= tolerance;
  if (withinTolerance) {
    console.log('✅', message, `(${actual.toFixed(2)}ms ≈ ${expected}ms ± ${tolerance}ms)`);
  } else {
    console.log('❌', message, `(${actual.toFixed(2)}ms not close to ${expected}ms ± ${tolerance}ms)`);
  }
  return withinTolerance;
}
```

**Cleanup Pattern:**
```javascript
try {
  // Test setup and execution
  const tracker = new PerformanceTracker(testFile);
  // ... perform test operations
  
  tracker.dispose(); // Explicit cleanup
} catch (error) {
  console.log('❌ Test failed:', error.message);
  testsFailed++;
}
```

## Testing Philosophy

**Zero Dependencies:**
- No npm test dependencies (no jest, mocha, chai, etc.)
- Custom assertion and test runner implementations
- Trade-off: Less features but zero dependency footprint

**Real Operations:**
- Tests use real filesystem operations
- Tests use real timing with `sleep()` helper
- No mocking frameworks - tests verify actual behavior

**Visual Output:**
- Heavy use of emojis: ✅ for pass, ❌ for fail
- Descriptive console output with context
- Summary statistics at end: passed/failed counts

**Example output style from `performance-tracker.test.js`:**
```
=== Performance Tracker Tests ===

Test 1: Tracker instantiation
✅ metricsFile set correctly
✅ metrics Map exists
✅ startAgent method exists

Test 2: Start and end tracking
✅ duration close to 50ms (52.35ms ≈ 50ms ± 15ms)
✅ duration is positive

=== Test Summary ===
Total: 5 tests
✅ Passed: 5
❌ Failed: 0

🎉 All tests passed!
```

---

*Testing analysis: 2026-01-20*
