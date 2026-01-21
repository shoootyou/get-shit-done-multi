/**
 * Tests for tool-mapper.js
 * 
 * Validates tool name mapping, compatibility checking, and validation
 * for both Claude and Copilot platforms.
 */

const assert = require('assert');
const {
  CANONICAL_TOOLS,
  TOOL_COMPATIBILITY_MATRIX,
  mapTools,
  getToolCompatibility,
  validateToolList,
} = require('./tool-mapper');

// Test counter
let passedTests = 0;
let totalTests = 0;

function test(description, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    throw error;
  }
}

// ==================== CANONICAL TOOLS TESTS ====================

test('CANONICAL_TOOLS contains at least 6 safe tools', () => {
  assert.ok(CANONICAL_TOOLS.length >= 6, `Expected at least 6 tools, got ${CANONICAL_TOOLS.length}`);
});

test('CANONICAL_TOOLS includes core tools (Bash, Read, Edit, Grep)', () => {
  assert.ok(CANONICAL_TOOLS.includes('Bash'), 'Missing Bash');
  assert.ok(CANONICAL_TOOLS.includes('Read'), 'Missing Read');
  assert.ok(CANONICAL_TOOLS.includes('Edit'), 'Missing Edit');
  assert.ok(CANONICAL_TOOLS.includes('Grep'), 'Missing Grep');
});

// ==================== MAP TOOLS TESTS ====================

test('mapTools preserves exact case for Claude', () => {
  const result = mapTools(['Bash', 'Read', 'Edit'], 'claude');
  assert.deepStrictEqual(result, ['Bash', 'Read', 'Edit']);
});

test('mapTools converts to lowercase for Copilot', () => {
  const result = mapTools(['Bash', 'Read', 'Edit'], 'copilot');
  assert.deepStrictEqual(result, ['bash', 'read', 'edit']);
});

test('mapTools handles all canonical tools for Claude', () => {
  const result = mapTools(CANONICAL_TOOLS, 'claude');
  assert.strictEqual(result.length, CANONICAL_TOOLS.length);
  assert.ok(result.includes('Bash'));
  assert.ok(result.includes('Task'));
});

test('mapTools handles all canonical tools for Copilot', () => {
  const result = mapTools(CANONICAL_TOOLS, 'copilot');
  assert.strictEqual(result.length, CANONICAL_TOOLS.length);
  assert.ok(result.includes('bash'));
  assert.ok(result.includes('task'));
});

test('mapTools filters out platform-unavailable tools', () => {
  const result = mapTools(['Bash', 'WebFetch'], 'copilot');
  assert.deepStrictEqual(result, ['bash']); // WebFetch not available on Copilot
});

test('mapTools handles empty array', () => {
  const result = mapTools([], 'claude');
  assert.deepStrictEqual(result, []);
});

test('mapTools throws on invalid platform', () => {
  assert.throws(
    () => mapTools(['Bash'], 'invalid'),
    /platform must be "claude" or "copilot"/
  );
});

test('mapTools throws on non-array input', () => {
  assert.throws(
    () => mapTools('Bash', 'claude'),
    /toolArray must be an array/
  );
});

// ==================== COMPATIBILITY CHECKING TESTS ====================

test('getToolCompatibility identifies Bash as canonical and safe', () => {
  const result = getToolCompatibility('Bash');
  assert.strictEqual(result.isCanonical, true);
  assert.strictEqual(result.claudeName, 'Bash');
  assert.strictEqual(result.copilotName, 'bash');
  assert.strictEqual(result.safe, true);
  assert.ok(Array.isArray(result.aliases));
});

test('getToolCompatibility identifies WebFetch as Claude-only with warning', () => {
  const result = getToolCompatibility('WebFetch');
  assert.strictEqual(result.isCanonical, false);
  assert.strictEqual(result.claudeName, 'WebFetch');
  assert.strictEqual(result.copilotName, null);
  assert.strictEqual(result.safe, false);
  assert.ok(result.warning && result.warning.includes('Claude-only'));
});

test('getToolCompatibility handles unknown tool', () => {
  const result = getToolCompatibility('UnknownTool');
  assert.strictEqual(result.isCanonical, false);
  assert.strictEqual(result.claudeName, null);
  assert.strictEqual(result.copilotName, null);
  assert.strictEqual(result.safe, false);
  assert.ok(result.warning && result.warning.includes('Unknown tool'));
});

test('getToolCompatibility returns aliases array', () => {
  const result = getToolCompatibility('Bash');
  assert.ok(Array.isArray(result.aliases));
  assert.ok(result.aliases.includes('execute'));
  assert.ok(result.aliases.includes('shell'));
});

test('getToolCompatibility warns about Task context differences', () => {
  const result = getToolCompatibility('Task');
  assert.strictEqual(result.safe, true);
  assert.ok(result.warning && result.warning.includes('agent types'));
});

// ==================== VALIDATION TESTS ====================

test('validateToolList passes for safe tools on Claude', () => {
  const result = validateToolList(['Bash', 'Read', 'Edit'], 'claude');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.warnings.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test('validateToolList passes for safe tools on Copilot', () => {
  const result = validateToolList(['Bash', 'Read', 'Edit'], 'copilot');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.warnings.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test('validateToolList errors for Claude-only tools on Copilot', () => {
  const result = validateToolList(['WebFetch'], 'copilot');
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors[0].includes('not available on copilot'));
});

test('validateToolList warns for risky tools', () => {
  const result = validateToolList(['Write'], 'claude');
  assert.strictEqual(result.valid, true); // Valid but warned
  assert.ok(result.warnings.length > 0);
  assert.ok(result.warnings[0].includes('Claude-specific'));
});

test('validateToolList warns for unknown tools', () => {
  const result = validateToolList(['UnknownTool'], 'claude');
  assert.strictEqual(result.valid, true); // Valid with warning
  assert.ok(result.warnings.length > 0);
  assert.ok(result.warnings[0].includes('Unknown tool'));
});

test('validateToolList handles empty array', () => {
  const result = validateToolList([], 'claude');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.warnings.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

test('validateToolList handles duplicate tools', () => {
  const result = validateToolList(['Bash', 'Bash', 'Read'], 'claude');
  assert.strictEqual(result.valid, true);
  // No errors for duplicates - they just map the same way
});

test('validateToolList errors on invalid platform', () => {
  const result = validateToolList(['Bash'], 'invalid');
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors[0].includes('platform must be'));
});

test('validateToolList errors on non-array input', () => {
  const result = validateToolList('Bash', 'claude');
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors[0].includes('tools must be an array'));
});

// ==================== PITFALLS.md INTEGRATION TESTS ====================

test('Case sensitivity scenario from Pitfall 1 - Claude requires exact case', () => {
  const claudeTools = mapTools(['Bash', 'Read', 'Edit', 'Grep'], 'claude');
  assert.ok(claudeTools.every(t => t[0] === t[0].toUpperCase()), 'Claude tools should preserve uppercase');
});

test('Aliasing scenario from Pitfall 2 - Copilot accepts lowercase', () => {
  const copilotTools = mapTools(['Bash', 'Read', 'Edit'], 'copilot');
  assert.ok(copilotTools.every(t => t === t.toLowerCase()), 'Copilot tools should be lowercase');
});

test('Tool matrix coverage - all PITFALLS.md tools present', () => {
  const expectedTools = ['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'Task', 'Write', 'WebFetch', 'WebSearch'];
  expectedTools.forEach(tool => {
    assert.ok(TOOL_COMPATIBILITY_MATRIX[tool], `Missing tool in matrix: ${tool}`);
  });
});

test('Safe tool identification from compatibility matrix', () => {
  const safeTools = ['Bash', 'Read', 'Edit', 'Grep', 'Glob'];
  safeTools.forEach(tool => {
    const compat = getToolCompatibility(tool);
    assert.strictEqual(compat.safe, true, `${tool} should be safe`);
  });
});

test('Platform-specific tool identification', () => {
  const claudeOnlyTools = ['WebFetch', 'WebSearch'];
  claudeOnlyTools.forEach(tool => {
    const compat = getToolCompatibility(tool);
    assert.strictEqual(compat.safe, false, `${tool} should not be safe (Claude-only)`);
    assert.strictEqual(compat.copilotName, null, `${tool} should not have Copilot name`);
  });
});

// ==================== SUMMARY ====================

console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passedTests}/${totalTests}`);
if (passedTests === totalTests) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed');
  process.exit(1);
}
