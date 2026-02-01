# Testing Patterns

**Analysis Date:** 2026-02-01

**Test Coverage:**
- Test files: 25 files
- Source files: 69 files
- Test ratio: 36% (test files / source files)
- Total test code: ~4,597 lines
- Total source code: ~5,547 lines

## Test Framework

**Runner:**
- Vitest v4.0.18
- Config: `vitest.config.js`

**Assertion Library:**
- Vitest built-in assertions (expect API)
- No additional assertion libraries

**Run Commands:**
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode with auto-rerun
npm run test:ui         # Launch Vitest UI in browser
npm run test:coverage   # Generate coverage report
npm run test:validation # Run specific test file (skill validation)
```

**CI Commands:**
```bash
npm ci                  # Install dependencies (CI)
npm test                # Run tests in CI
```

## Test File Organization

**Location:**
- Tests in dedicated `tests/` directory (not co-located with source)
- Mirror source structure within `tests/`

**Naming:**
- Pattern: `{module-name}.test.js`
- Examples: `file-scanner.test.js`, `path-validator.test.js`, `installer.test.js`

**Structure:**
```
tests/
├── unit/                        # Unit tests for individual modules
│   ├── file-scanner.test.js
│   ├── path-validator.test.js
│   ├── platforms/               # Platform-specific unit tests
│   │   ├── claude/
│   │   │   └── serializer.test.js
│   │   ├── copilot/
│   │   │   └── serializer.test.js
│   │   └── codex/
│   │       └── serializer.test.js
│   └── ...
├── integration/                 # Integration tests
│   ├── installer.test.js
│   ├── validation-flow.test.js
│   ├── migration-flow.test.js
│   └── ...
├── version/                     # Version detection tests
│   ├── version-detector.test.js
│   ├── version-checker.test.js
│   └── ...
├── validation/                  # Validation tests
│   ├── manifest-generator.test.js
│   └── pre-install-checks.test.js
└── helpers/                     # Test utilities
    └── test-utils.js
```

## Test Structure

**Suite Organization:**
```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('module-name', () => {
  // Setup/teardown
  let testDir;
  
  beforeEach(async () => {
    // Create test environment
    testDir = await createTestDir();
  });
  
  afterEach(async () => {
    // Clean up
    await cleanupTestDir(testDir);
  });
  
  describe('function-name', () => {
    it('should handle normal case', async () => {
      // Arrange
      const input = 'test-data';
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
    
    it('should handle edge case', async () => {
      // Test edge case
    });
    
    it('should throw on invalid input', () => {
      expect(() => functionUnderTest(invalid))
        .toThrow('Expected error message');
    });
  });
});
```

**Patterns:**
- Use `describe()` for grouping related tests (module, then function)
- Use `it()` or `test()` for individual test cases (both supported, `it` more common)
- Nested `describe()` blocks for organizing function-specific tests
- Descriptive test names: "should {expected behavior} {given condition}"

**Test lifecycle:**
- `beforeEach()` - Run before each test (create fresh test environment)
- `afterEach()` - Run after each test (clean up resources)
- `beforeAll()`/`afterAll()` - Not commonly used (prefer `beforeEach`/`afterEach` for isolation)

## Mocking

**Framework:** Vitest built-in mocking (minimal usage)

**Current usage:**
- Very limited mocking in codebase (~9 instances found)
- Prefer real implementations and test isolation over mocks
- Use filesystem-based test directories instead of mocking fs

**Patterns:**
```javascript
// Rarely used - prefer real implementations
import { vi } from 'vitest';

vi.mock('module-name', () => ({
  functionName: vi.fn()
}));
```

**What to Mock:**
- External API calls (when necessary)
- Time-dependent operations (not heavily used)

**What NOT to Mock:**
- Filesystem operations - use real temp directories instead
- Internal modules - test real implementations
- Simple utilities - no need to mock

## Fixtures and Factories

**Test Data:**
```javascript
// Helper functions in tests/helpers/test-utils.js
export async function createTestDir() {
  const prefix = join(tmpdir(), 'gsd-test-');
  return mkdtemp(prefix);
}

export async function cleanupTestDir(dir) {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

export async function createMinimalTemplates(baseDir) {
  const templatesDir = join(baseDir, 'templates');
  // ... create test template structure
  return templatesDir;
}
```

**Location:**
- Test utilities: `tests/helpers/test-utils.js`
- Inline test data within test files for simple cases
- Factory functions for complex test setups

**Patterns:**
- Use real temporary directories via `mkdtemp()` in system tmpdir
- Create minimal but realistic test data structures
- Clean up all test artifacts in `afterEach()`
- Use Node.js `os.tmpdir()` and `homedir()` for cross-platform compatibility

## Coverage

**Requirements:**
```javascript
// vitest.config.js coverage thresholds
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['bin/lib/**/*.js'],
  exclude: ['bin/lib/**/*.test.js'],
  thresholds: {
    statements: 70,
    branches: 50,    // Lowered temporarily (utility modules under-tested)
    functions: 70,
    lines: 70
  }
}
```

**View Coverage:**
```bash
npm run test:coverage
# Opens coverage/index.html in browser
# Shows text summary in terminal
```

**Coverage reports:**
- Text summary in terminal
- JSON report for CI/analysis
- HTML report for detailed review
- Reports generated in `coverage/` directory (gitignored)

**Coverage goals:**
- 70% statements, functions, lines
- 50% branches (temporary - plan to increase)
- Focus on critical paths: installation, validation, migration

## Test Types

**Unit Tests:**
- Scope: Individual functions and modules
- Location: `tests/unit/`
- Focus: Pure logic, utilities, validators, serializers
- Examples:
  - `file-scanner.test.js` - File scanning utility
  - `path-validator.test.js` - Path validation logic
  - `platforms/claude/serializer.test.js` - YAML frontmatter serialization

**Integration Tests:**
- Scope: Multiple modules working together
- Location: `tests/integration/`
- Focus: End-to-end workflows, installation, validation
- Examples:
  - `installer.test.js` - Full installation workflow
  - `validation-flow.test.js` - Validation + manifest generation
  - `migration-flow.test.js` - Version migration end-to-end

**Version Tests:**
- Scope: Version detection and checking
- Location: `tests/version/`
- Focus: Version parsing, comparison, detection
- Examples:
  - `version-detector.test.js` - Detect installed versions
  - `version-checker.test.js` - Compare versions

**Validation Tests:**
- Scope: Pre-install checks and validation
- Location: `tests/validation/`
- Focus: Security, permissions, manifests
- Examples:
  - `pre-install-checks.test.js` - Directory validation
  - `manifest-generator.test.js` - Manifest creation

**E2E Tests:**
- Not implemented yet
- Would test full CLI interaction with real processes

## Common Patterns

**Async Testing:**
```javascript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

it('should reject on error', async () => {
  await expect(asyncFunction(invalid))
    .rejects.toThrow('Error message');
});
```

**Error Testing:**
```javascript
// Synchronous errors
it('should throw on invalid input', () => {
  expect(() => validatePath(basePath, '../etc/passwd'))
    .toThrow('Path traversal detected');
});

// Async errors
it('should reject promise on error', async () => {
  await expect(install('2.0.0', invalidOptions))
    .rejects.toThrow('Invalid options');
});
```

**Filesystem Testing:**
```javascript
it('should create file structure', async () => {
  // Use real filesystem in temp directory
  const testDir = await createTestDir();
  
  try {
    await writeFile(join(testDir, 'test.txt'), 'content');
    const exists = await pathExists(join(testDir, 'test.txt'));
    expect(exists).toBe(true);
  } finally {
    await cleanupTestDir(testDir);
  }
});
```

**Assertion Patterns:**
```javascript
// Equality
expect(result).toBe(value);           // Strict equality (===)
expect(result).toEqual(object);       // Deep equality

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toContainEqual(object);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ key: value });

// Instances
expect(error).toBeInstanceOf(Error);

// Strings
expect(string).toContain('substring');

// Numbers
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThan(10);
```

**Temporary Directory Pattern:**
```javascript
describe('module with file operations', () => {
  let testDir;
  
  beforeEach(async () => {
    // Create unique temp dir for each test
    testDir = join(tmpdir(), `.gsd-test-${Math.random().toString(36).slice(2)}`);
    await ensureDir(testDir);
  });
  
  afterEach(async () => {
    // Clean up after each test
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('test case', async () => {
    // Test uses testDir
  });
});
```

**Platform-Specific Testing:**
```javascript
describe('Claude Serializer', () => {
  describe('array formatting - block style', () => {
    test('serializes arrays as multi-line block style', () => {
      const data = { skills: ['gsd-help', 'gsd-verify'] };
      const result = serializeFrontmatter(data);
      
      expect(result).toContain('skills:\n  - gsd-help\n  - gsd-verify');
    });
  });
});
```

## CI/CD Integration

**GitHub Actions Workflows:**

### PR Validation (`.github/workflows/pr-validation.yml`)
- Triggers: All pull requests
- Node version: 20.x
- Steps:
  1. Checkout code
  2. Setup Node.js with npm cache
  3. Install dependencies (`npm ci`)
  4. Run tests (`npm test`)
  5. Build if build script exists
  6. Create and validate tarball
  7. Comment on PR with results
- Concurrency: Cancel in-progress runs for same PR
- Permissions: read contents, write PR comments

### Publish Workflow (`.github/workflows/publish-main.yml`)
- Trigger: Manual workflow dispatch
- Node version: 20.x
- Environment: prod
- Steps:
  1. Validate version format
  2. Check tag doesn't exist
  3. Update package.json version
  4. Install dependencies (`npm ci`)
  5. Run tests (`npm test`)
  6. Build if needed
  7. Create and test tarball
  8. Dry-run publish
  9. Create git tag
  10. Create GitHub release
  11. Publish to NPM with provenance
- Security: OIDC provenance for supply chain integrity

**Concurrency:**
- PR validation: Cancel in-progress for same PR
- Publish: No concurrent publishes allowed

**Status Reporting:**
- PR validation posts status as PR comment
- Updates existing comment on re-run
- Shows test results, tarball validation

## Test Isolation

**Principles:**
- Each test runs independently
- No shared state between tests
- Fresh test environment per test
- Clean up all artifacts

**Patterns:**
- Use `beforeEach()`/`afterEach()` for setup/teardown
- Create unique temp directories per test
- Avoid test interdependencies
- Don't rely on test execution order

**Process Isolation:**
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    globals: false,        // Explicit imports required
    environment: 'node',   // Node.js environment
    isolate: true,         // Isolate tests
    pool: 'forks'          // Process isolation
  }
});
```

## Test Configuration

**Timeouts:**
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    testTimeout: 30000,   // 30s for integration tests
    hookTimeout: 10000    // 10s for setup/teardown
  }
});
```

**Test Execution:**
- No global test functions (explicit imports)
- Fork pool for process isolation
- Individual test isolation enforced

## Best Practices

**DO:**
- Write descriptive test names: "should {behavior} when {condition}"
- Use AAA pattern (Arrange, Act, Assert) for clarity
- Test one thing per test case
- Use real filesystem with temp directories
- Clean up all test artifacts
- Test error cases and edge cases
- Use async/await consistently
- Keep tests fast and focused

**DON'T:**
- Share state between tests
- Mock excessively - prefer real implementations
- Commit test artifacts or temp files
- Rely on test execution order
- Leave resources open (files, connections)
- Test implementation details - test behavior
- Mix unit and integration concerns in same test

**Security Testing:**
- Path traversal attacks tested in `path-validator.test.js`
- Null byte injection tested
- Windows reserved names tested
- Permission checks tested in integration tests

**Example: Comprehensive Test Suite**
```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDir, cleanupTestDir } from '../helpers/test-utils.js';

describe('file-scanner', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTestDir();
  });

  afterEach(async () => {
    await cleanupTestDir(testDir);
  });

  describe('scanInstallationFiles', () => {
    it('should scan and return all files recursively', async () => {
      // Arrange
      await fs.writeFile(join(testDir, 'file1.txt'), 'content');
      await fs.ensureDir(join(testDir, 'subdir'));
      await fs.writeFile(join(testDir, 'subdir', 'file2.txt'), 'content');

      // Act
      const files = await scanInstallationFiles(testDir);

      // Assert
      expect(files).toHaveLength(2);
      expect(files).toContain('file1.txt');
      expect(files).toContain(join('subdir', 'file2.txt'));
    });

    it('should exclude files with specified prefix', async () => {
      await fs.writeFile(join(testDir, 'normal.txt'), 'content');
      await fs.writeFile(join(testDir, '.gsd-manifest.json'), 'manifest');

      const files = await scanInstallationFiles(testDir);

      expect(files).toHaveLength(1);
      expect(files).toContain('normal.txt');
      expect(files).not.toContain('.gsd-manifest.json');
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await scanInstallationFiles(join(testDir, 'nonexistent'));

      expect(files).toEqual([]);
    });
  });
});
```

---

*Testing analysis: 2026-02-01*
