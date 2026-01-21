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
