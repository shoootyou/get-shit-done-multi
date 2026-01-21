/**
 * Tests for platform-specific validators
 */

const assert = require('assert');
const {
  validateClaudeSpec,
  validateCopilotSpec,
  validateSpec,
  checkPromptLength,
  CLAUDE_MODELS,
  CLAUDE_HOOKS,
  PROMPT_LIMITS,
} = require('./validators');

let testsRun = 0;
let testsPassed = 0;

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
  }
}

console.log('Running validators tests...\n');

// ============================================================================
// Claude Validator Tests
// ============================================================================

test('validateClaudeSpec: valid spec passes', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test agent description',
    tools: ['Bash', 'Read', 'Edit'],
    model: 'haiku',
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('validateClaudeSpec: missing name fails', () => {
  const result = validateClaudeSpec({
    description: 'Test description',
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'name'), 'Should have name error');
});

test('validateClaudeSpec: empty name fails', () => {
  const result = validateClaudeSpec({
    name: '   ',
    description: 'Test description',
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'name'), 'Should have name error');
});

test('validateClaudeSpec: missing description fails', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'description'), 'Should have description error');
});

test('validateClaudeSpec: lowercase tool name fails (Pitfall 1)', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['bash', 'read'],  // Wrong case
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'tools' && e.message.includes('Bash')), 
    'Should error about incorrect case for bash');
});

test('validateClaudeSpec: mixed case tools fail', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['Bash', 'read', 'Edit'],  // read is wrong case
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'tools'), 'Should have tools error');
});

test('validateClaudeSpec: wildcard tools fail (Pitfall 2)', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['*'],
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'tools' && e.message.includes('wildcard')), 
    'Should error about wildcard');
});

test('validateClaudeSpec: invalid model fails', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    model: 'gpt-4',  // Not a Claude model
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'model'), 'Should have model error');
});

test('validateClaudeSpec: valid models pass', () => {
  CLAUDE_MODELS.forEach(model => {
    const result = validateClaudeSpec({
      name: 'test-agent',
      description: 'Test description',
      model: model,
    });
    
    assert.strictEqual(result.valid, true, `Model ${model} should be valid`);
  });
});

test('validateClaudeSpec: unknown hook generates warning', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    hooks: {
      on_create: 'echo "test"',
      on_unknown: 'echo "bad"',  // Unknown hook
    },
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid (warning not error)');
  assert.ok(result.warnings.some(w => w.field === 'hooks' && w.message.includes('Unknown hook')), 
    'Should warn about unknown hook');
});

test('validateClaudeSpec: Claude-only tool generates warning', () => {
  const result = validateClaudeSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['Bash', 'WebFetch'],  // WebFetch is Claude-only
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.ok(result.warnings.some(w => w.field === 'tools' && w.message.includes('WebFetch')), 
    'Should warn about Claude-only tool');
});

// ============================================================================
// Copilot Validator Tests
// ============================================================================

test('validateCopilotSpec: valid spec passes', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test agent description',
    tools: ['bash', 'read', 'edit'],
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('validateCopilotSpec: wildcard tools valid', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['*'],  // Valid on Copilot
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.errors.length, 0, 'Should have no errors');
});

test('validateCopilotSpec: model field generates warning (Pitfall 3)', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    model: 'haiku',  // Ignored on Copilot
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid (warning not error)');
  assert.ok(result.warnings.some(w => w.field === 'model'), 
    'Should warn about ignored model field');
});

test('validateCopilotSpec: hooks generate warning (Pitfall 10)', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    hooks: { on_create: 'echo test' },
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid (warning not error)');
  assert.ok(result.warnings.some(w => w.field === 'hooks'), 
    'Should warn about unsupported hooks');
});

test('validateCopilotSpec: skills generate warning (Pitfall 10)', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    skills: ['skill1', 'skill2'],
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid (warning not error)');
  assert.ok(result.warnings.some(w => w.field === 'skills'), 
    'Should warn about unsupported skills');
});

test('validateCopilotSpec: disallowedTools generate warning (Pitfall 4)', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    disallowedTools: ['WebFetch'],
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid (warning not error)');
  assert.ok(result.warnings.some(w => w.field === 'disallowedTools'), 
    'Should warn about unsupported disallowedTools');
});

test('validateCopilotSpec: Claude-only tool generates warning', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    tools: ['bash', 'WebFetch'],  // WebFetch not available on Copilot
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.ok(result.warnings.some(w => w.field === 'tools' && w.message.includes('WebFetch')), 
    'Should warn about unavailable tool');
});

test('validateCopilotSpec: MCP servers validated', () => {
  const result = validateCopilotSpec({
    name: 'test-agent',
    description: 'Test description',
    'mcp-servers': {
      'server1': { command: 'node', args: ['server.js'] }
    },
  });
  
  assert.strictEqual(result.valid, true, 'Should be valid');
});

// ============================================================================
// Generic validateSpec Tests
// ============================================================================

test('validateSpec: dispatches to Claude validator', () => {
  const result = validateSpec({
    name: 'test',
    description: 'test',
    tools: ['Bash'],
  }, 'claude');
  
  assert.strictEqual(result.valid, true, 'Should validate for Claude');
});

test('validateSpec: dispatches to Copilot validator', () => {
  const result = validateSpec({
    name: 'test',
    description: 'test',
    tools: ['*'],  // Valid on Copilot only
  }, 'copilot');
  
  assert.strictEqual(result.valid, true, 'Should validate for Copilot');
});

test('validateSpec: unknown platform fails', () => {
  const result = validateSpec({
    name: 'test',
    description: 'test',
  }, 'unknown');
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'platform'), 'Should error about platform');
});

// ============================================================================
// Prompt Length Tests
// ============================================================================

test('checkPromptLength: short prompt passes for Claude', () => {
  const result = checkPromptLength('Short prompt text', 'claude');
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.warnings.length, 0, 'Should have no warnings');
  assert.strictEqual(result.limit, PROMPT_LIMITS.claude, 'Should use Claude limit');
});

test('checkPromptLength: short prompt passes for Copilot', () => {
  const result = checkPromptLength('Short prompt text', 'copilot');
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.warnings.length, 0, 'Should have no warnings');
  assert.strictEqual(result.limit, PROMPT_LIMITS.copilot, 'Should use Copilot limit');
});

test('checkPromptLength: long prompt warns for Copilot (Pitfall 7)', () => {
  const longPrompt = 'x'.repeat(28000);  // 28k chars (>90% of 30k limit)
  const result = checkPromptLength(longPrompt, 'copilot');
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.ok(result.warnings.length > 0, 'Should have warnings');
  assert.ok(result.warnings[0].message.includes('approaching'), 
    'Should warn about approaching limit');
});

test('checkPromptLength: excessive prompt fails for Copilot', () => {
  const longPrompt = 'x'.repeat(31000);  // 31k chars (exceeds 30k limit)
  const result = checkPromptLength(longPrompt, 'copilot');
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.warnings.length > 0, 'Should have warnings');
  assert.ok(result.warnings[0].message.includes('exceeds'), 
    'Should error about exceeding limit');
});

test('checkPromptLength: long prompt fine for Claude', () => {
  const longPrompt = 'x'.repeat(50000);  // 50k chars (fine for Claude's 200k limit)
  const result = checkPromptLength(longPrompt, 'claude');
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.warnings.length, 0, 'Should have no warnings');
});

test('checkPromptLength: null prompt handled', () => {
  const result = checkPromptLength(null, 'claude');
  
  assert.strictEqual(result.valid, true, 'Should be valid');
  assert.strictEqual(result.length, 0, 'Should have zero length');
});

// ============================================================================
// Edge Cases
// ============================================================================

test('validateClaudeSpec: null frontmatter fails gracefully', () => {
  const result = validateClaudeSpec(null);
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'frontmatter'), 
    'Should error about invalid frontmatter');
});

test('validateCopilotSpec: null frontmatter fails gracefully', () => {
  const result = validateCopilotSpec(null);
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'frontmatter'), 
    'Should error about invalid frontmatter');
});

test('validateClaudeSpec: tools not array fails', () => {
  const result = validateClaudeSpec({
    name: 'test',
    description: 'test',
    tools: 'Bash',  // Should be array
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'tools'), 'Should error about tools type');
});

test('validateCopilotSpec: tools not array fails', () => {
  const result = validateCopilotSpec({
    name: 'test',
    description: 'test',
    tools: 'bash',  // Should be array
  });
  
  assert.strictEqual(result.valid, false, 'Should be invalid');
  assert.ok(result.errors.some(e => e.field === 'tools'), 'Should error about tools type');
});

// ============================================================================
// Summary
// ============================================================================

console.log(`\n${testsPassed}/${testsRun} tests passed`);

if (testsPassed === testsRun) {
  console.log('✓ All validators tests passed!');
  process.exit(0);
} else {
  console.error(`✗ ${testsRun - testsPassed} tests failed`);
  process.exit(1);
}
