/**
 * Unit tests for spec-parser module
 * Tests YAML frontmatter parsing and error handling
 */

const assert = require('assert');
const {parseSpec, parseSpecString} = require('./spec-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create temp directory for test files
const testDir = path.join(os.tmpdir(), 'spec-parser-tests-' + Date.now());
fs.mkdirSync(testDir, { recursive: true });

// Test counter
let testsPassed = 0;
let totalTests = 0;

/**
 * Run a test with description
 */
function test(description, fn) {
  totalTests++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    throw error;
  }
}

// Test 1: Valid spec with frontmatter and body
test('Valid spec with frontmatter and body', () => {
  const content = `---
name: test-agent
description: Test agent
tools: ['Bash', 'Read']
version: 1.0.0
---

# Test Agent

This is the test agent body content.
It can span multiple lines.
`;
  
  const result = parseSpecString(content, 'test.md');
  
  assert.strictEqual(result.frontmatter.name, 'test-agent');
  assert.strictEqual(result.frontmatter.description, 'Test agent');
  assert.deepStrictEqual(result.frontmatter.tools, ['Bash', 'Read']);
  assert.strictEqual(result.frontmatter.version, '1.0.0');
  assert.ok(result.body.includes('# Test Agent'));
  assert.ok(result.body.includes('multiple lines'));
  assert.strictEqual(result.path, 'test.md');
});

// Test 2: Invalid YAML frontmatter
test('Invalid YAML frontmatter throws error with line info', () => {
  const content = `---
name: test-agent
description: "unterminated string
tools: ['Bash']
---

Body content
`;
  
  let errorThrown = false;
  try {
    parseSpecString(content, 'invalid.md');
  } catch (error) {
    errorThrown = true;
    assert.ok(error.message.includes('Failed to parse YAML frontmatter'));
    assert.ok(error.message.includes('invalid.md'));
    // Error message should mention the problem
    assert.ok(error.message.length > 20);
  }
  
  assert.strictEqual(errorThrown, true, 'Should throw error for invalid YAML');
});

// Test 3: Missing frontmatter delimiters (body only)
test('Missing frontmatter delimiters returns empty frontmatter', () => {
  const content = `# Just a markdown file

No frontmatter here.
`;
  
  const result = parseSpecString(content);
  
  // gray-matter returns empty object for frontmatter when no delimiters found
  assert.deepStrictEqual(result.frontmatter, {});
  assert.ok(result.body.includes('# Just a markdown file'));
  assert.strictEqual(result.path, null);
});

// Test 4: Empty file
test('Empty file returns empty frontmatter and body', () => {
  const content = '';
  
  const result = parseSpecString(content);
  
  assert.deepStrictEqual(result.frontmatter, {});
  assert.strictEqual(result.body, '');
  assert.strictEqual(result.path, null);
});

// Test 5: File not found
test('File not found throws descriptive error', () => {
  const nonExistentPath = path.join(testDir, 'does-not-exist.md');
  
  let errorThrown = false;
  try {
    parseSpec(nonExistentPath);
  } catch (error) {
    errorThrown = true;
    assert.ok(error.message.includes('Spec file not found'));
    assert.ok(error.message.includes(nonExistentPath));
  }
  
  assert.strictEqual(errorThrown, true, 'Should throw error for missing file');
});

// Test 6: parseSpec with actual file
test('parseSpec reads file from filesystem', () => {
  const testFile = path.join(testDir, 'test-spec.md');
  const content = `---
name: file-test
tools: ['Read', 'Write']
---

# File Test

Content from file.
`;
  
  fs.writeFileSync(testFile, content, 'utf8');
  
  const result = parseSpec(testFile);
  
  assert.strictEqual(result.frontmatter.name, 'file-test');
  assert.deepStrictEqual(result.frontmatter.tools, ['Read', 'Write']);
  assert.ok(result.body.includes('# File Test'));
  assert.strictEqual(result.path, testFile);
});

// Test 7: Complex nested YAML structures
test('Complex nested YAML structures parse correctly', () => {
  const content = `---
name: complex-agent
config:
  nested:
    deep: value
  array: [1, 2, 3]
features:
  - feature1
  - feature2
metadata:
  tags:
    - tag1
    - tag2
---

Body content.
`;
  
  const result = parseSpecString(content);
  
  assert.strictEqual(result.frontmatter.name, 'complex-agent');
  assert.strictEqual(result.frontmatter.config.nested.deep, 'value');
  assert.deepStrictEqual(result.frontmatter.config.array, [1, 2, 3]);
  assert.deepStrictEqual(result.frontmatter.features, ['feature1', 'feature2']);
  assert.deepStrictEqual(result.frontmatter.metadata.tags, ['tag1', 'tag2']);
});

// Test 8: Frontmatter only (no body)
test('Frontmatter only (no body) returns empty body string', () => {
  const content = `---
name: no-body
description: Agent with no body content
---
`;
  
  const result = parseSpecString(content);
  
  assert.strictEqual(result.frontmatter.name, 'no-body');
  assert.strictEqual(result.body.trim(), '');
});

// Cleanup
fs.rmSync(testDir, { recursive: true, force: true });

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}/${totalTests}`);
console.log('='.repeat(50));

if (testsPassed === totalTests) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed');
  process.exit(1);
}
