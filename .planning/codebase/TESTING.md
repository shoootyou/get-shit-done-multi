# Testing Patterns

**Analysis Date:** 2026-01-29

**Test Coverage:**
- Test files: 21 files
- Source files: 85 files (57 in bin/lib)
- Test ratio: 37% (test files / total source+test files)
- Coverage targets: statements 70%, branches 50%, functions 70%, lines 70%

## Test Framework

**Runner:**
- vitest 4.0.18
- Config: `vitest.config.js`

**Assertion Library:**
- Vitest built-in (Chai-compatible API)

**Run Commands:**
```bash
npm test                    # Run all tests once
npm run test:watch          # Watch mode
npm run test:ui             # Web UI
npm run test:coverage       # Coverage report
```

**Additional Tools:**
- gray-matter (frontmatter parsing in tests)
- fs/promises (file operations)

## Test File Organization

**Location:**
- Tests co-located by type, not by source
- Separate test tree under `tests/` directory

**Directory Structure:**
```
tests/
├── helpers/
│   └── test-utils.js              # Shared test utilities
├── unit/                          # Isolated module tests (9 files)
│   ├── file-scanner.test.js
│   ├── frontmatter-serializer.test.js
│   ├── path-validator.test.js
│   ├── path-resolver.test.js
│   └── ...
├── integration/                   # Multi-component tests (6 files)
│   ├── installer.test.js
│   ├── path-security.test.js
│   ├── validation-flow.test.js
│   └── ...
├── validation/                    # Validation-specific (1 file)
│   └── manifest-generator.test.js
└── version/                       # Version detection (4 files)
    ├── version-detector.test.js
    └── ...
```

**Naming:**
- Pattern: `{module-name}.test.js`
- Matches source file name: `bin/lib/rendering/frontmatter-serializer.js` → `tests/unit/frontmatter-serializer.test.js`
- No `.spec.js` variant used

## Test Structure

**Suite Organization:**
```javascript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { functionToTest } from '../../bin/lib/module.js';

describe('module-name', () => {
  describe('feature or function', () => {
    test('should do specific thing', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
    
    test('should handle edge case', () => {
      expect(() => functionToTest(null)).toThrow('error message');
    });
  });
});
```

**Patterns:**
- Nested `describe` blocks for grouping related tests
- `test()` not `it()` (both work, but `test()` is consistent)
- Descriptive test names starting with "should"
- Arrange-Act-Assert pattern in test body
- One assertion focus per test (but multiple expect calls OK)

**Example from `tests/unit/frontmatter-serializer.test.js`:**
```javascript
describe('frontmatter-serializer', () => {
  describe('empty array omission', () => {
    test('omits empty tools array from output', () => {
      const data = {
        name: 'test-agent',
        tools: [],
        description: 'Test agent'
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify empty array is not present
      expect(result).not.toContain('tools:');
      expect(result).not.toContain('[]');
      
      // Verify other fields are present
      expect(result).toContain('name: test-agent');
      expect(result).toContain("description: Test agent");
    });
  });
  
  describe('Copilot single-line tools format', () => {
    test('formats tools as single-line array with single quotes', () => {
      const data = {
        name: 'test-agent',
        tools: ['read', 'write', 'bash']
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain("tools: ['read', 'write', 'bash']");
      expect(result).not.toMatch(/tools:\n\s*-/);
    });
  });
});
```

## Test Isolation

**Critical Pattern: `/tmp` Usage**

All tests use isolated temporary directories. **Never write to project directories.**

**Test Utilities (`tests/helpers/test-utils.js`):**
```javascript
import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';

/**
 * Create isolated test directory in /tmp
 * @returns {Promise<string>} Test directory path
 */
export async function createTestDir() {
  const prefix = join(tmpdir(), 'gsd-test-');
  return mkdtemp(prefix);
}

/**
 * Clean up test directory
 * @param {string} dir - Directory to remove
 */
export async function cleanupTestDir(dir) {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn(`Cleanup warning: ${error.message}`);
  }
}
```

**Setup/Teardown Pattern:**
```javascript
describe('integration test', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await createTestDir();
  });
  
  afterEach(async () => {
    await cleanupTestDir(testDir);
  });
  
  test('should do something', async () => {
    // testDir is isolated, no project pollution
  });
});
```

**Alternative Pattern (Home Directory):**

Some integration tests use home directory to avoid system path restrictions:

```javascript
beforeEach(async () => {
  const home = homedir();
  testDir = await mkdtemp(join(home, '.gsd-test-integration-'));
});
```

**Why This Matters:**

From `.planning/SOURCE-PROTECTION.md`:
- `.claude/`, `.github/`, `.codex/` are READ-ONLY source references
- Tests must use `targetDirOverride` parameter
- Never write to project root during tests
- Accidental deletion during tests was caught and prevented by this pattern

## Fixtures and Test Data

**Inline Test Data:**

Most tests create data inline:

```javascript
test('should format frontmatter', () => {
  const data = {
    name: 'test-agent',
    tools: ['read', 'write']
  };
  
  const result = serializeFrontmatter(data, 'copilot');
  expect(result).toContain("tools: ['read', 'write']");
});
```

**Template Creation Helper:**

From `tests/helpers/test-utils.js`:

```javascript
/**
 * Create minimal template structure for testing
 * @param {string} baseDir - Base directory for templates
 */
export async function createMinimalTemplates(baseDir) {
  const templatesDir = join(baseDir, 'templates');
  const skillsDir = join(templatesDir, 'skills', 'gsd-test-skill');
  const agentsDir = join(templatesDir, 'agents');
  const sharedDir = join(templatesDir, 'get-shit-done');
  
  await mkdir(skillsDir, { recursive: true });
  await mkdir(agentsDir, { recursive: true });
  await mkdir(sharedDir, { recursive: true });
  
  // Create skill
  await writeFile(
    join(skillsDir, 'SKILL.md'),
    `---
name: Test Skill
description: Test skill
allowed-tools: Read, Write
---
Install to {{PLATFORM_ROOT}}/skills/
Use {{COMMAND_PREFIX}}test-skill
`
  );
  
  // Create agent
  await writeFile(
    join(agentsDir, 'gsd-test-agent.md'),
    `---
name: test-agent
description: Test agent
tools: Read, Write
---
Agent content with {{PLATFORM_ROOT}} reference
`
  );
  
  return templatesDir;
}
```

**No Fixture Files:**
- No separate fixture directory
- Test data created programmatically
- Keeps tests self-contained and readable

## Mocking

**Framework:** Vitest built-in mocking

**Patterns:**

Tests favor real implementations over mocks. Most tests:
- Use real file system operations (in `/tmp`)
- Use real adapters and validators
- Mock only external dependencies (if needed)

**Example of Real Implementation Testing:**
```javascript
test('should install skills, agents, and shared directory', async () => {
  const targetDir = join(testDir, '.claude');
  const binDir = join(testDir, 'bin');
  await ensureDirectory(binDir);
  
  const options = {
    platform: 'claude',
    isGlobal: false,
    isVerbose: false,
    scriptDir: binDir,
    targetDir // Override for test isolation
  };
  
  const stats = await install(options);
  
  // Check stats
  expect(stats.skills).toBeGreaterThan(0);
  expect(stats.agents).toBeGreaterThan(0);
  expect(stats.shared).toBe(1);
  
  // Check structure exists
  expect(await pathExists(join(targetDir, 'skills'))).toBe(true);
  expect(await pathExists(join(targetDir, 'agents'))).toBe(true);
});
```

**What to Mock:**
- External API calls (none in current codebase)
- System commands that can't run in test (none currently)

**What NOT to Mock:**
- File operations (use real fs in `/tmp`)
- Path validation (test real logic)
- Adapters (test real transformations)

## Coverage

**Requirements:**
- statements: 70%
- branches: 50% (lowered temporarily for Phase 2)
- functions: 70%
- lines: 70%

**Configuration (`vitest.config.js`):**
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['bin/lib/**/*.js'],
  exclude: ['bin/lib/**/*.test.js'],
  thresholds: {
    statements: 70,
    branches: 50,
    functions: 70,
    lines: 70
  }
}
```

**View Coverage:**
```bash
npm run test:coverage
# Opens HTML report in coverage/index.html
```

**Coverage Strategy:**
- Unit tests cover core logic (validators, serializers, transformers)
- Integration tests cover flows (installation, validation, migration)
- Not aiming for 100% — focus on critical paths

## Test Types

**Unit Tests (`tests/unit/`):**
- Test single module in isolation
- Fast execution (< 1ms per test)
- No file I/O (or minimal, in /tmp)
- Examples: `path-validator.test.js`, `frontmatter-serializer.test.js`

**Integration Tests (`tests/integration/`):**
- Test multiple modules together
- File system operations
- Real template creation
- Examples: `installer.test.js`, `validation-flow.test.js`

**Validation Tests (`tests/validation/`):**
- Test validation logic end-to-end
- Security checks (path traversal, reserved names)
- Example: `manifest-generator.test.js`

**Version Tests (`tests/version/`):**
- Test version detection
- Manifest reading
- Installation finding
- Examples: `version-detector.test.js`, `installation-finder.test.js`

## Common Patterns

**Async Testing:**
```javascript
test('should read file content', async () => {
  const file = join(testDir, 'test.txt');
  await writeFile(file, 'hello world');
  const content = await readFile(file);
  expect(content).toBe('hello world');
});
```

**Error Testing:**
```javascript
test('should reject path traversal attempts', async () => {
  const maliciousTarget = join(testDir, '../../../etc');
  
  await expect(
    runPreInstallationChecks(maliciousTarget, templatesDir, false, 'claude')
  ).rejects.toThrow(); // Any error means validation worked
});

test('should throw on null byte', () => {
  expect(() => validatePath(basePath, 'safe.txt\x00../../evil'))
    .toThrow('Null byte detected');
});
```

**Multiple Assertions:**
```javascript
test('should format complete Copilot agent', () => {
  const data = {
    name: 'gsd-install',
    description: 'Install GSD skills',
    tools: ['read', 'write', 'bash'],
    metadata: { platform: 'copilot', generated: '2026-01-28' }
  };
  
  const result = serializeFrontmatter(data, 'copilot');
  
  // Verify tools format
  expect(result).toContain("tools: ['read', 'write', 'bash']");
  
  // Verify metadata block
  expect(result).toContain('metadata:');
  expect(result).toContain('  platform: copilot');
  
  // Parse to verify structure
  const parsed = yaml(`---\n${result}\n---`);
  expect(parsed.data.name).toBe('gsd-install');
  expect(parsed.data.tools).toEqual(['read', 'write', 'bash']);
});
```

**Attack Vector Testing:**
```javascript
describe('Attack Vector Integration Tests', () => {
  test('should block all URL-encoded traversal variants', async () => {
    const attacks = [
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc',
      '%2e%2e%5c%2e%2e%5c%2e%2e%5cetc',
      'skills%2f%2e%2e%2f%2e%2e%2fetc'
    ];
    
    for (const attack of attacks) {
      const maliciousTarget = join(testDir, decodeURIComponent(attack));
      await expect(
        runPreInstallationChecks(maliciousTarget, templatesDir, false, 'claude')
      ).rejects.toThrow();
    }
  });
});
```

**Batch Validation Testing:**
```javascript
test('should collect all errors without stopping', () => {
  const paths = [
    '.claude/valid.md',        // valid
    '../../../etc/passwd',     // invalid
    '.github/CON',             // invalid
    '.codex/good.json',        // valid
    'evil/file.txt'            // invalid
  ];
  
  const result = validateAllPaths(basePath, paths);
  
  expect(result.valid).toHaveLength(2);
  expect(result.errors).toHaveLength(3);
  expect(result.errors[0]).toContain('Path traversal');
  expect(result.errors[1]).toContain('Windows reserved');
  expect(result.errors[2]).toContain('Path not in allowlist');
});
```

## Test Configuration

**Vitest Config (`vitest.config.js`):**
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,           // Explicit imports required
    environment: 'node',      // Node.js environment (not browser)
    testTimeout: 30000,       // 30s for integration tests
    hookTimeout: 10000,       // 10s for setup/teardown
    isolate: true,            // Isolate test environment
    pool: 'forks',            // Process isolation (not threads)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['bin/lib/**/*.js'],
      exclude: ['bin/lib/**/*.test.js'],
      thresholds: {
        statements: 70,
        branches: 50,
        functions: 70,
        lines: 70
      }
    }
  }
});
```

**Key Settings:**
- `globals: false` — No auto-imported `describe`, `test`, `expect` (explicit imports required)
- `pool: 'forks'` — Each test file runs in separate process (full isolation)
- `testTimeout: 30000` — Generous timeout for file operations
- `isolate: true` — Full test environment isolation

## Testing Philosophy

**Integration Over Unit:**
- More integration tests than pure unit tests
- Test real behavior, not implementation details
- Use real file system (in /tmp) rather than mocking

**Security Testing:**
- Explicit attack vector tests
- Path traversal variants (basic, URL-encoded, Windows)
- Windows reserved names
- Null byte injection
- Path length limits

**Practical Coverage:**
- 70% coverage is target, not 100%
- Focus on critical paths: validation, security, installation
- Under-tested areas documented in coverage reports

**Test Maintenance:**
- Self-contained tests (no shared state)
- Cleanup always runs (even on failure)
- Descriptive names for easy debugging
- Comments explain "why" not "what"

---

*Testing analysis: 2026-01-29*
