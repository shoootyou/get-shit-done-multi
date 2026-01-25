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
  REVERSE_TOOL_INDEX,
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

test('mapTools uses PRIMARY aliases for Copilot', () => {
  const result = mapTools(['Bash', 'Read', 'Edit'], 'copilot');
  assert.deepStrictEqual(result, ['execute', 'read', 'edit']);
});

test('mapTools handles all canonical tools for Claude', () => {
  const result = mapTools(CANONICAL_TOOLS, 'claude');
  assert.strictEqual(result.length, CANONICAL_TOOLS.length);
  assert.ok(result.includes('Bash'));
  assert.ok(result.includes('Task'));
});

test('mapTools handles all canonical tools for Copilot', () => {
  const result = mapTools(CANONICAL_TOOLS, 'copilot');
  // Grep+Glob both map to 'search', so result is deduplicated: 5 not 6
  assert.strictEqual(result.length, 5);
  assert.ok(result.includes('execute'));
  assert.ok(result.includes('agent'));
});

test('mapTools filters out platform-unavailable tools', () => {
  const result = mapTools(['Bash', 'WebFetch'], 'copilot');
  assert.deepStrictEqual(result, ['execute']); // WebFetch not available on Copilot
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
  assert.strictEqual(result.copilotName, 'execute');
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

test('validateToolList warns for risky tools on wrong platform', () => {
  // When using Write (Claude-specific) to generate for Copilot, should warn
  const result = validateToolList(['write'], 'copilot');
  assert.strictEqual(result.valid, true); // Valid but warned (Write maps to Edit on Copilot)
  assert.ok(result.warnings.length > 0);
  assert.ok(result.warnings[0].includes('Claude-specific') || result.warnings[0].includes('cross-platform'));
});

test('validateToolList does NOT warn about platform-specific tools on their own platform', () => {
  // When using Write on Claude (where it's native), should NOT warn
  const resultClaude = validateToolList(['Write'], 'claude');
  assert.strictEqual(resultClaude.valid, true);
  assert.strictEqual(resultClaude.warnings.length, 0); // No warnings on native platform
  
  // When using Read on Copilot (where it's native), should NOT warn
  const resultCopilot = validateToolList(['read'], 'copilot');
  assert.strictEqual(resultCopilot.valid, true);
  assert.strictEqual(resultCopilot.warnings.length, 0); // No warnings for standard tools
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

test('Aliasing scenario from Pitfall 2 - Copilot uses PRIMARY aliases', () => {
  const copilotTools = mapTools(['Bash', 'Read', 'Edit'], 'copilot');
  // PRIMARY aliases: execute, read, edit
  assert.deepStrictEqual(copilotTools, ['execute', 'read', 'edit']);
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

// ==================== REVERSE_TOOL_INDEX TESTS ====================

test('REVERSE_TOOL_INDEX exists and is an object', () => {
  assert.ok(typeof REVERSE_TOOL_INDEX === 'object');
  assert.ok(Object.keys(REVERSE_TOOL_INDEX).length > 0);
});

test('REVERSE_TOOL_INDEX maps uppercase canonical to itself', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['Bash'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['Read'], 'Read');
  assert.strictEqual(REVERSE_TOOL_INDEX['Edit'], 'Edit');
  assert.strictEqual(REVERSE_TOOL_INDEX['Grep'], 'Grep');
  assert.strictEqual(REVERSE_TOOL_INDEX['Glob'], 'Glob');
  assert.strictEqual(REVERSE_TOOL_INDEX['Task'], 'Task');
});

test('REVERSE_TOOL_INDEX maps lowercase canonical to uppercase', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['bash'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['read'], 'Read');
  assert.strictEqual(REVERSE_TOOL_INDEX['edit'], 'Edit');
  assert.strictEqual(REVERSE_TOOL_INDEX['grep'], 'Grep');
  assert.strictEqual(REVERSE_TOOL_INDEX['glob'], 'Glob');
  assert.strictEqual(REVERSE_TOOL_INDEX['task'], 'Task');
});

test('REVERSE_TOOL_INDEX maps Bash aliases to Bash', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['execute'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['shell'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['powershell'], 'Bash');
});

test('REVERSE_TOOL_INDEX maps Edit aliases to Edit', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['edit'], 'Edit');
  assert.strictEqual(REVERSE_TOOL_INDEX['Edit'], 'Edit');
  assert.strictEqual(REVERSE_TOOL_INDEX['create'], 'Edit');
  assert.strictEqual(REVERSE_TOOL_INDEX['MultiEdit'], 'Edit');
});

test('REVERSE_TOOL_INDEX maps Grep aliases to Grep', () => {
  // Note: 'search' is ambiguous - both Grep and Glob map to 'search' on Copilot
  // So we don't test 'search' here
  assert.strictEqual(REVERSE_TOOL_INDEX['grep'], 'Grep');
  assert.strictEqual(REVERSE_TOOL_INDEX['Grep'], 'Grep');
});

test('REVERSE_TOOL_INDEX maps Task aliases to Task', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['agent'], 'Task');
  assert.strictEqual(REVERSE_TOOL_INDEX['custom-agent'], 'Task');
});

test('REVERSE_TOOL_INDEX is case-insensitive for aliases', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['BASH'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['bash'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['execute'], 'Bash');
  assert.strictEqual(REVERSE_TOOL_INDEX['EXECUTE'], 'Bash');
});

test('REVERSE_TOOL_INDEX returns undefined for unknown tools', () => {
  assert.strictEqual(REVERSE_TOOL_INDEX['UnknownTool'], undefined);
  assert.strictEqual(REVERSE_TOOL_INDEX['xyz'], undefined);
});

// ==================== PRIMARY ALIAS TESTS ====================

test('mapTools outputs PRIMARY execute for Bash on Copilot', () => {
  const result = mapTools(['Bash'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
});

test('mapTools outputs PRIMARY read for Read on Copilot', () => {
  const result = mapTools(['Read'], 'copilot');
  assert.deepStrictEqual(result, ['read']);
});

test('mapTools outputs PRIMARY edit for Edit on Copilot', () => {
  const result = mapTools(['Edit'], 'copilot');
  assert.deepStrictEqual(result, ['edit']);
});

test('mapTools outputs PRIMARY search for Grep on Copilot', () => {
  const result = mapTools(['Grep'], 'copilot');
  assert.deepStrictEqual(result, ['search']);
});

test('mapTools outputs PRIMARY search for Glob on Copilot', () => {
  const result = mapTools(['Glob'], 'copilot');
  assert.deepStrictEqual(result, ['search']);
});

test('mapTools outputs PRIMARY agent for Task on Copilot', () => {
  const result = mapTools(['Task'], 'copilot');
  assert.deepStrictEqual(result, ['agent']);
});

test('mapTools accepts lowercase bash and outputs PRIMARY execute', () => {
  const result = mapTools(['bash'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
});

test('mapTools accepts alias execute and outputs PRIMARY execute', () => {
  const result = mapTools(['execute'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
});

test('mapTools accepts alias shell and outputs PRIMARY execute', () => {
  const result = mapTools(['shell'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
});

test('mapTools accepts alias create and outputs PRIMARY edit', () => {
  const result = mapTools(['create'], 'copilot');
  assert.deepStrictEqual(result, ['edit']);
});

test('mapTools accepts alias grep and outputs PRIMARY search', () => {
  const result = mapTools(['grep'], 'copilot');
  assert.deepStrictEqual(result, ['search']);
});

test('mapTools accepts alias agent and outputs PRIMARY agent', () => {
  const result = mapTools(['agent'], 'copilot');
  assert.deepStrictEqual(result, ['agent']);
});

test('Claude continues using uppercase names', () => {
  const result = mapTools(['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'Task'], 'claude');
  assert.deepStrictEqual(result, ['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'Task']);
});

test('PRIMARY aliases work with mixed case input', () => {
  const result = mapTools(['BASH', 'read', 'Edit', 'grep'], 'copilot');
  assert.deepStrictEqual(result, ['execute', 'read', 'edit', 'search']);
});

test('TOOL_COMPATIBILITY_MATRIX uses PRIMARY names in copilot field', () => {
  assert.strictEqual(TOOL_COMPATIBILITY_MATRIX['Bash'].copilot, 'execute');
  assert.strictEqual(TOOL_COMPATIBILITY_MATRIX['Edit'].copilot, 'edit');
  assert.strictEqual(TOOL_COMPATIBILITY_MATRIX['Grep'].copilot, 'search');
  assert.strictEqual(TOOL_COMPATIBILITY_MATRIX['Glob'].copilot, 'search');
  assert.strictEqual(TOOL_COMPATIBILITY_MATRIX['Task'].copilot, 'agent');
});

// ==================== DEDUPLICATION TESTS ====================

test('mapTools deduplicates Grep+Glob to single search on Copilot', () => {
  const result = mapTools(['Grep', 'Glob'], 'copilot');
  assert.deepStrictEqual(result, ['search']);
  assert.strictEqual(result.length, 1);
});

test('mapTools deduplicates duplicate Bash on Copilot', () => {
  const result = mapTools(['Bash', 'Bash'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
  assert.strictEqual(result.length, 1);
});

test('mapTools deduplicates aliases that map to same tool on Copilot', () => {
  const result = mapTools(['bash', 'execute', 'shell'], 'copilot');
  assert.deepStrictEqual(result, ['execute']);
  assert.strictEqual(result.length, 1);
});

test('mapTools preserves order for unique tools on Copilot', () => {
  const result = mapTools(['Bash', 'Read', 'Edit'], 'copilot');
  assert.deepStrictEqual(result, ['execute', 'read', 'edit']);
});

test('mapTools preserves order for first occurrence when deduplicating', () => {
  const result = mapTools(['Grep', 'Read', 'Glob'], 'copilot');
  assert.deepStrictEqual(result, ['search', 'read']);
  // search appears at position 0 (from Grep), Glob duplicate removed
});

test('Claude does NOT deduplicate Grep and Glob', () => {
  const result = mapTools(['Grep', 'Glob'], 'claude');
  assert.deepStrictEqual(result, ['Grep', 'Glob']);
  assert.strictEqual(result.length, 2);
});

test('Deduplication works with all canonical tools on Copilot', () => {
  const result = mapTools(['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'Task'], 'copilot');
  assert.deepStrictEqual(result, ['execute', 'read', 'edit', 'search', 'agent']);
  assert.strictEqual(result.length, 5); // 6 tools → 5 after Grep+Glob dedup
});

test('Deduplication handles multiple duplicates correctly', () => {
  const result = mapTools(['Bash', 'Grep', 'Bash', 'Glob', 'Grep'], 'copilot');
  assert.deepStrictEqual(result, ['execute', 'search']);
  assert.strictEqual(result.length, 2);
});

test('Deduplication preserves non-duplicate tools', () => {
  const result = mapTools(['Read', 'Grep', 'Glob', 'Edit'], 'copilot');
  assert.deepStrictEqual(result, ['read', 'search', 'edit']);
});

test('Empty array remains empty after deduplication', () => {
  const result = mapTools([], 'copilot');
  assert.deepStrictEqual(result, []);
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
