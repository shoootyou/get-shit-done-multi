/**
 * Unit tests for field-transformer.js
 * Run with: node bin/lib/template-system/field-transformer.test.js
 */

const assert = require('assert');
const ft = require('./field-transformer');

// Test 1: transformFields preserves common fields on both platforms
{
  const spec = { tools: ['Bash', 'Read'], description: 'Test agent' };
  
  const claudeResult = ft.transformFields(spec, 'claude');
  assert.deepStrictEqual(claudeResult.transformed.tools, ['Bash', 'Read']);
  assert.strictEqual(claudeResult.transformed.description, 'Test agent');
  assert.strictEqual(claudeResult.warnings.length, 0);
  
  const copilotResult = ft.transformFields(spec, 'copilot');
  assert.deepStrictEqual(copilotResult.transformed.tools, ['Bash', 'Read']);
  assert.strictEqual(copilotResult.transformed.description, 'Test agent');
  assert.strictEqual(copilotResult.warnings.length, 0);
  
  console.log('✓ Test 1: Common fields preserved on both platforms');
}

// Test 2: transformFields includes model field for Claude
{
  const spec = { model: 'haiku', tools: ['Bash'] };
  const result = ft.transformFields(spec, 'claude');
  
  assert.strictEqual(result.transformed.model, 'haiku');
  assert.strictEqual(result.warnings.length, 0);
  
  console.log('✓ Test 2: Model field included for Claude');
}

// Test 3: transformFields excludes model field for Copilot with warning
{
  const spec = { model: 'haiku', tools: ['Bash'] };
  const result = ft.transformFields(spec, 'copilot');
  
  assert.strictEqual(result.transformed.model, undefined);
  assert.strictEqual(result.warnings.length, 1);
  assert.strictEqual(result.warnings[0].field, 'model');
  assert.ok(result.warnings[0].reason.includes('Copilot'));
  assert.ok(result.warnings[0].suggestion);
  
  console.log('✓ Test 3: Model field excluded for Copilot with warning');
}

// Test 4: transformFields includes hooks/skills for Claude only
{
  const spec = { 
    hooks: { on_create: 'echo "test"' }, 
    skills: ['skill-1'],
    tools: ['Bash']
  };
  
  const claudeResult = ft.transformFields(spec, 'claude');
  assert.deepStrictEqual(claudeResult.transformed.hooks, { on_create: 'echo "test"' });
  assert.deepStrictEqual(claudeResult.transformed.skills, ['skill-1']);
  assert.strictEqual(claudeResult.warnings.length, 0);
  
  const copilotResult = ft.transformFields(spec, 'copilot');
  assert.strictEqual(copilotResult.transformed.hooks, undefined);
  assert.strictEqual(copilotResult.transformed.skills, undefined);
  assert.strictEqual(copilotResult.warnings.length, 2); // hooks + skills
  
  console.log('✓ Test 4: Hooks/skills included for Claude only');
}

// Test 5: transformFields handles mcp-servers appropriately per platform
{
  const spec = { 
    'mcp-servers': { custom: { type: 'local', command: 'test' } },
    tools: ['Bash']
  };
  
  // Claude: mcp-servers excluded (inherits from global)
  const claudeResult = ft.transformFields(spec, 'claude');
  assert.strictEqual(claudeResult.transformed['mcp-servers'], undefined);
  assert.strictEqual(claudeResult.warnings.length, 1);
  
  // Copilot: mcp-servers included (frontmatter config)
  const copilotResult = ft.transformFields(spec, 'copilot');
  assert.deepStrictEqual(copilotResult.transformed['mcp-servers'], spec['mcp-servers']);
  assert.strictEqual(copilotResult.warnings.length, 0);
  
  console.log('✓ Test 5: MCP-servers handled per platform (Pitfall 8)');
}

// Test 6: transformFields converts disallowedTools to warning on Copilot (Pitfall 4)
{
  const spec = { 
    tools: ['Bash', 'Read'],
    disallowedTools: ['Write', 'Edit']
  };
  
  // Claude: disallowedTools supported
  const claudeResult = ft.transformFields(spec, 'claude');
  assert.deepStrictEqual(claudeResult.transformed.disallowedTools, ['Write', 'Edit']);
  assert.strictEqual(claudeResult.warnings.length, 0);
  
  // Copilot: disallowedTools not supported
  const copilotResult = ft.transformFields(spec, 'copilot');
  assert.strictEqual(copilotResult.transformed.disallowedTools, undefined);
  assert.strictEqual(copilotResult.warnings.length, 1);
  assert.ok(copilotResult.warnings[0].reason.includes('allowlist'));
  
  console.log('✓ Test 6: disallowedTools warning on Copilot (Pitfall 4)');
}

// Test 7: validateFieldSupport returns supported=true for Claude model field
{
  const result = ft.validateFieldSupport('model', 'claude');
  
  assert.strictEqual(result.supported, true);
  assert.strictEqual(result.warning, null);
  assert.strictEqual(result.suggestion, null);
  
  console.log('✓ Test 7: validateFieldSupport returns true for Claude model');
}

// Test 8: validateFieldSupport returns supported=false for Copilot model field
{
  const result = ft.validateFieldSupport('model', 'copilot');
  
  assert.strictEqual(result.supported, false);
  assert.ok(result.warning);
  assert.ok(result.suggestion);
  assert.ok(result.impact);
  
  console.log('✓ Test 8: validateFieldSupport returns false for Copilot model');
}

// Test 9: validateFieldSupport suggests prompt text for Copilot hooks
{
  const result = ft.validateFieldSupport('hooks', 'copilot');
  
  assert.strictEqual(result.supported, false);
  assert.ok(result.suggestion.includes('prompt'));
  
  console.log('✓ Test 9: validateFieldSupport suggests prompt text for hooks');
}

// Test 10: validateFieldSupport handles unknown fields
{
  const result = ft.validateFieldSupport('unknown-field', 'claude');
  
  assert.strictEqual(result.supported, null);
  assert.ok(result.warning.includes('Unknown field'));
  assert.ok(result.suggestion);
  
  console.log('✓ Test 10: validateFieldSupport handles unknown fields');
}

// Test 11: addPlatformMetadata includes platform identifier
{
  const frontmatter = { name: 'test-agent', tools: ['Bash'] };
  const result = ft.addPlatformMetadata(frontmatter, 'claude');
  
  assert.strictEqual(result._platform, 'claude');
  assert.ok(result._generated); // Timestamp should exist
  assert.strictEqual(result.name, 'test-agent'); // Preserves existing fields
  
  console.log('✓ Test 11: addPlatformMetadata includes platform identifier');
}

// Test 12: addPlatformMetadata includes generation timestamp
{
  const frontmatter = { name: 'test-agent' };
  const result = ft.addPlatformMetadata(frontmatter, 'copilot');
  
  assert.ok(result._generated);
  assert.ok(result._generated.match(/^\d{4}-\d{2}-\d{2}T/)); // ISO format
  
  console.log('✓ Test 12: addPlatformMetadata includes timestamp');
}

// Test 13: addPlatformMetadata preserves existing frontmatter
{
  const frontmatter = { 
    name: 'test-agent', 
    description: 'Test',
    tools: ['Bash', 'Read']
  };
  const result = ft.addPlatformMetadata(frontmatter, 'claude', {
    version: '1.8.1',
    specPath: '/path/to/spec.yml'
  });
  
  assert.strictEqual(result.name, 'test-agent');
  assert.strictEqual(result.description, 'Test');
  assert.deepStrictEqual(result.tools, ['Bash', 'Read']);
  assert.strictEqual(result._templateVersion, '1.8.1');
  assert.strictEqual(result._sourceSpec, '/path/to/spec.yml');
  
  console.log('✓ Test 13: addPlatformMetadata preserves frontmatter and adds metadata');
}

// Test 14: Pitfall 3 scenario - model field handled correctly
{
  const spec = { 
    name: 'fast-agent',
    model: 'haiku',
    description: 'Optimized for speed',
    tools: ['Bash']
  };
  
  // Claude: includes model
  const claudeResult = ft.transformFields(spec, 'claude');
  assert.strictEqual(claudeResult.transformed.model, 'haiku');
  
  // Copilot: excludes model with warning
  const copilotResult = ft.transformFields(spec, 'copilot');
  assert.strictEqual(copilotResult.transformed.model, undefined);
  const modelWarning = copilotResult.warnings.find(w => w.field === 'model');
  assert.ok(modelWarning);
  assert.ok(modelWarning.reason.includes('ignores'));
  
  console.log('✓ Test 14: Pitfall 3 - model field handled (Claude included, Copilot excluded)');
}

// Test 15: Pitfall 10 scenario - hooks/skills Claude-only with warnings
{
  const spec = {
    name: 'lifecycle-agent',
    hooks: { on_create: 'init' },
    skills: ['common-context'],
    tools: ['Bash']
  };
  
  // Copilot: excludes both with warnings
  const result = ft.transformFields(spec, 'copilot');
  assert.strictEqual(result.transformed.hooks, undefined);
  assert.strictEqual(result.transformed.skills, undefined);
  assert.strictEqual(result.warnings.length, 2);
  
  const hooksWarning = result.warnings.find(w => w.field === 'hooks');
  const skillsWarning = result.warnings.find(w => w.field === 'skills');
  assert.ok(hooksWarning);
  assert.ok(skillsWarning);
  
  console.log('✓ Test 15: Pitfall 10 - hooks/skills Claude-only with warnings');
}

// Test 16: transformFields handles null/invalid frontmatter gracefully
{
  const result1 = ft.transformFields(null, 'claude');
  assert.strictEqual(result1.warnings.length, 1);
  assert.ok(result1.warnings[0].reason.includes('Invalid'));
  
  const result2 = ft.transformFields('not-an-object', 'claude');
  assert.strictEqual(result2.warnings.length, 1);
  
  console.log('✓ Test 16: Handles null/invalid frontmatter gracefully');
}

// Test 17: transformFields handles invalid platform gracefully
{
  const spec = { tools: ['Bash'] };
  const result = ft.transformFields(spec, 'invalid-platform');
  
  assert.strictEqual(result.warnings.length, 1);
  assert.ok(result.warnings[0].reason.includes('Unsupported platform'));
  assert.deepStrictEqual(result.transformed, spec); // Unchanged
  
  console.log('✓ Test 17: Handles invalid platform gracefully');
}

// Test 18: supportsField helper function works correctly
{
  assert.strictEqual(ft.supportsField('model', 'claude'), true);
  assert.strictEqual(ft.supportsField('model', 'copilot'), false);
  assert.strictEqual(ft.supportsField('hooks', 'claude'), true);
  assert.strictEqual(ft.supportsField('hooks', 'copilot'), false);
  assert.strictEqual(ft.supportsField('tools', 'claude'), true);
  assert.strictEqual(ft.supportsField('tools', 'copilot'), true);
  assert.strictEqual(ft.supportsField('unknown', 'claude'), null);
  
  console.log('✓ Test 18: supportsField helper function works correctly');
}

// Test 19: FIELD_RULES constant is accessible
{
  const rules = ft.FIELD_RULES;
  assert.ok(rules);
  assert.ok(rules.model);
  assert.ok(rules.hooks);
  assert.ok(rules.skills);
  assert.ok(rules.disallowedTools);
  assert.ok(rules['mcp-servers']);
  assert.ok(rules.tools);
  assert.ok(rules.description);
  
  console.log('✓ Test 19: FIELD_RULES constant accessible');
}

// Test 20: getFieldRules returns copy of rules
{
  const rules = ft.getFieldRules();
  assert.ok(rules);
  assert.ok(rules.model);
  
  // Modify copy shouldn't affect original
  rules.model.claude = false;
  assert.strictEqual(ft.FIELD_RULES.model.claude, true);
  
  console.log('✓ Test 20: getFieldRules returns copy of rules');
}

console.log('\n✅ All 20 field-transformer tests passed');
