/**
 * Unit tests for context-builder.js
 * Run with: node bin/lib/template-system/context-builder.test.js
 */

const assert = require('assert');
const { buildContext } = require('./context-builder');

// Test 1: Claude context has correct flags
{
  const ctx = buildContext('claude', { workDir: '/test' });
  assert.strictEqual(ctx.isClaude, true, 'Claude context should have isClaude=true');
  assert.strictEqual(ctx.isCopilot, false, 'Claude context should have isCopilot=false');
  assert.strictEqual(ctx.isCodex, false, 'Claude context should have isCodex=false');
  assert.strictEqual(ctx.platform, 'claude', 'Platform should be "claude"');
  console.log('✓ Test 1: Claude context has correct flags');
}

// Test 2: Copilot context has correct capabilities
{
  const ctx = buildContext('copilot', { workDir: '/test' });
  assert.strictEqual(ctx.isCopilot, true, 'Copilot context should have isCopilot=true');
  assert.strictEqual(ctx.supportsModel, false, 'Copilot should not support model selection');
  assert.strictEqual(ctx.supportsHooks, false, 'Copilot should not support hooks');
  assert.strictEqual(ctx.supportsWildcards, true, 'Copilot should support tool wildcards');
  assert.strictEqual(ctx.maxPromptLength, 30000, 'Copilot character limit should be 30000');
  console.log('✓ Test 2: Copilot context has correct capabilities');
}

// Test 3: Claude capabilities
{
  const ctx = buildContext('claude', { workDir: '/test' });
  assert.strictEqual(ctx.supportsModel, true, 'Claude should support model selection');
  assert.strictEqual(ctx.supportsHooks, true, 'Claude should support hooks');
  assert.strictEqual(ctx.supportsWildcards, false, 'Claude should not support tool wildcards');
  assert.strictEqual(ctx.maxPromptLength, 200000, 'Claude character limit should be 200000');
  console.log('✓ Test 3: Claude context has correct capabilities');
}

// Test 4: Invalid platform throws error
{
  try {
    buildContext('invalid-platform', { workDir: '/test' });
    assert.fail('Should have thrown error for invalid platform');
  } catch (err) {
    assert.ok(err.message.includes('invalid-platform'), 'Error should mention invalid platform');
    assert.ok(err.message.includes('claude'), 'Error should list valid platforms');
  }
  console.log('✓ Test 4: Invalid platform throws descriptive error');
}

// Test 5: Additional variables merged into context
{
  const ctx = buildContext('claude', {
    workDir: '/test',
    additionalVars: {
      customVar: 'custom value',
      agentName: 'test-agent'
    }
  });
  assert.strictEqual(ctx.customVar, 'custom value', 'Additional vars should be merged');
  assert.strictEqual(ctx.agentName, 'test-agent', 'Additional vars should be accessible');
  console.log('✓ Test 5: Additional variables merged into context');
}

// Test 6: Paths correctly populated
{
  const ctx = buildContext('claude', {
    workDir: '/workspace',
    paths: {
      agents: '/custom/agents',
      skills: '/custom/skills'
    }
  });
  assert.strictEqual(ctx.agentsPath, '/custom/agents', 'Custom agents path should be used');
  assert.strictEqual(ctx.skillsPath, '/custom/skills', 'Custom skills path should be used');
  assert.strictEqual(ctx.workDir, '/workspace', 'Work directory should be set');
  console.log('✓ Test 6: Paths correctly populated from options');
}

// Test 7: Default workDir uses process.cwd()
{
  const ctx = buildContext('copilot');
  assert.ok(ctx.workDir, 'Work directory should have a default value');
  assert.strictEqual(typeof ctx.workDir, 'string', 'Work directory should be a string');
  console.log('✓ Test 7: Default workDir uses process.cwd()');
}

// Test 8: Codex platform support
{
  const ctx = buildContext('codex', { workDir: '/test' });
  assert.strictEqual(ctx.isCodex, true, 'Codex context should have isCodex=true');
  assert.strictEqual(ctx.isClaude, false, 'Codex context should have isClaude=false');
  assert.strictEqual(ctx.isCopilot, false, 'Codex context should have isCopilot=false');
  assert.ok(ctx.supportsModel !== undefined, 'Codex should have capability flags');
  console.log('✓ Test 8: Codex platform support');
}

// Test 9: All platforms have required context properties
{
  ['claude', 'copilot', 'codex'].forEach(platform => {
    const ctx = buildContext(platform, { workDir: '/test' });
    
    // Required properties
    assert.ok('platform' in ctx, `${platform}: should have platform property`);
    assert.ok('isClaude' in ctx, `${platform}: should have isClaude flag`);
    assert.ok('isCopilot' in ctx, `${platform}: should have isCopilot flag`);
    assert.ok('isCodex' in ctx, `${platform}: should have isCodex flag`);
    assert.ok('agentsPath' in ctx, `${platform}: should have agentsPath`);
    assert.ok('skillsPath' in ctx, `${platform}: should have skillsPath`);
    assert.ok('workDir' in ctx, `${platform}: should have workDir`);
    
    // Capability properties
    assert.ok('supportsModel' in ctx, `${platform}: should have supportsModel flag`);
    assert.ok('supportsHooks' in ctx, `${platform}: should have supportsHooks flag`);
    assert.ok('supportsMCP' in ctx, `${platform}: should have supportsMCP flag`);
  });
  console.log('✓ Test 9: All platforms have required context properties');
}

console.log('\n✅ All context-builder tests passed');

// NEW TESTS: Enhanced capability flags (Phase 2 Plan 02)

// Test 10: Claude context has detailed capability flags
{
  const ctx = buildContext('claude', { workDir: '/test' });
  assert.strictEqual(ctx.supportsModel, true, 'Claude should support model');
  assert.strictEqual(ctx.supportsHooks, true, 'Claude should support hooks');
  assert.strictEqual(ctx.supportsSkills, true, 'Claude should support skills');
  assert.strictEqual(ctx.supportsMCP, true, 'Claude should support MCP');
  assert.strictEqual(ctx.supportsDisallowedTools, true, 'Claude should support disallowedTools');
  assert.strictEqual(ctx.supportsWildcards, false, 'Claude should not support wildcards');
  assert.strictEqual(ctx.maxPromptLength, 200000, 'Claude prompt limit should be 200k');
  assert.strictEqual(ctx.toolCaseSensitive, true, 'Claude tools should be case-sensitive');
  console.log('✓ Test 10: Claude has all 8 detailed capability flags');
}

// Test 11: Copilot context has correct detailed capability flags
{
  const ctx = buildContext('copilot', { workDir: '/test' });
  assert.strictEqual(ctx.supportsModel, false, 'Copilot should not support model');
  assert.strictEqual(ctx.supportsHooks, false, 'Copilot should not support hooks');
  assert.strictEqual(ctx.supportsSkills, false, 'Copilot should not support skills');
  assert.strictEqual(ctx.supportsMCP, true, 'Copilot should support MCP');
  assert.strictEqual(ctx.supportsDisallowedTools, false, 'Copilot should not support disallowedTools');
  assert.strictEqual(ctx.supportsWildcards, true, 'Copilot should support wildcards');
  assert.strictEqual(ctx.maxPromptLength, 30000, 'Copilot prompt limit should be 30k');
  assert.strictEqual(ctx.toolCaseSensitive, false, 'Copilot tools should be case-insensitive');
  console.log('✓ Test 11: Copilot has all 8 detailed capability flags with correct values');
}

// Test 12: supportsField helper works for model field
{
  const { supportsField } = require('./context-builder');
  assert.strictEqual(supportsField('claude', 'model'), true);
  assert.strictEqual(supportsField('copilot', 'model'), false);
  console.log('✓ Test 12: supportsField helper works for model field');
}

// Test 13: supportsField helper works for hooks field
{
  const { supportsField } = require('./context-builder');
  assert.strictEqual(supportsField('claude', 'hooks'), true);
  assert.strictEqual(supportsField('copilot', 'hooks'), false);
  console.log('✓ Test 13: supportsField helper works for hooks field');
}

// Test 14: supportsField returns true for common fields
{
  const { supportsField } = require('./context-builder');
  assert.strictEqual(supportsField('claude', 'tools'), true);
  assert.strictEqual(supportsField('copilot', 'tools'), true);
  assert.strictEqual(supportsField('claude', 'description'), true);
  assert.strictEqual(supportsField('copilot', 'description'), true);
  console.log('✓ Test 14: supportsField returns true for common fields on both platforms');
}

// Test 15: supportsField returns null for unknown fields
{
  const { supportsField } = require('./context-builder');
  assert.strictEqual(supportsField('claude', 'unknown-field'), null);
  assert.strictEqual(supportsField('copilot', 'unknown-field'), null);
  console.log('✓ Test 15: supportsField returns null for unknown fields');
}

// Test 16: getFieldWarning returns null for supported fields
{
  const { getFieldWarning } = require('./context-builder');
  assert.strictEqual(getFieldWarning('claude', 'model'), null);
  assert.strictEqual(getFieldWarning('claude', 'hooks'), null);
  console.log('✓ Test 16: getFieldWarning returns null for supported fields');
}

// Test 17: getFieldWarning returns helpful message for unsupported fields
{
  const { getFieldWarning } = require('./context-builder');
  const warning = getFieldWarning('copilot', 'model');
  assert.ok(warning);
  assert.ok(warning.includes('Copilot'));
  assert.ok(warning.includes('model'));
  console.log('✓ Test 17: getFieldWarning returns helpful message for unsupported fields');
}

// Test 18: getPlatformLimits returns structured limit object
{
  const { getPlatformLimits } = require('./context-builder');
  
  const claudeLimits = getPlatformLimits('claude');
  assert.strictEqual(claudeLimits.maxPromptLength, 200000);
  assert.strictEqual(claudeLimits.toolCaseSensitive, true);
  assert.strictEqual(claudeLimits.supportsWildcards, false);
  assert.strictEqual(claudeLimits.platform, 'claude');
  
  const copilotLimits = getPlatformLimits('copilot');
  assert.strictEqual(copilotLimits.maxPromptLength, 30000);
  assert.strictEqual(copilotLimits.toolCaseSensitive, false);
  assert.strictEqual(copilotLimits.supportsWildcards, true);
  assert.strictEqual(copilotLimits.platform, 'copilot');
  
  console.log('✓ Test 18: getPlatformLimits returns structured limit object');
}

// Test 19: Platform limits differ between Claude and Copilot (PITFALLS.md)
{
  const { getPlatformLimits } = require('./context-builder');
  const claudeLimits = getPlatformLimits('claude');
  const copilotLimits = getPlatformLimits('copilot');
  
  // Pitfall 7: Character limits differ (200k vs 30k)
  assert.notStrictEqual(claudeLimits.maxPromptLength, copilotLimits.maxPromptLength);
  
  // Pitfall 1: Tool case sensitivity differs
  assert.notStrictEqual(claudeLimits.toolCaseSensitive, copilotLimits.toolCaseSensitive);
  
  console.log('✓ Test 19: Platform limits differ correctly per PITFALLS.md research');
}

console.log('\n✅ All 19 context-builder tests passed (9 original + 10 new)');

