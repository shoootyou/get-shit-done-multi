/**
 * Unit tests for engine.js
 * Run with: node bin/lib/template-system/engine.test.js
 */

const assert = require('assert');
const { render, validate, renderAndValidate } = require('./engine');

// Test 1: Simple variable substitution
{
  const template = 'Hello {{name}}!';
  const context = { name: 'World' };
  const result = render(template, context);
  assert.strictEqual(result, 'Hello World!', 'Should replace {{name}} with context value');
  console.log('✓ Test 1: Simple variable substitution');
}

// Test 2: Multiple variables in same template
{
  const template = 'name: {{agentName}}\ndescription: {{desc}}\nplatform: {{platform}}';
  const context = { agentName: 'test-agent', desc: 'Test description', platform: 'claude' };
  const result = render(template, context);
  assert.ok(result.includes('name: test-agent'), 'Should replace agentName');
  assert.ok(result.includes('description: Test description'), 'Should replace desc');
  assert.ok(result.includes('platform: claude'), 'Should replace platform');
  console.log('✓ Test 2: Multiple variables in same template');
}

// Test 3: Undefined variable throws error with variable name
{
  const template = 'Hello {{name}}!';
  const context = {};
  try {
    render(template, context);
    assert.fail('Should have thrown error for undefined variable');
  } catch (err) {
    assert.ok(err.message.includes('name'), 'Error should mention undefined variable name');
    assert.ok(err.message.includes('Undefined'), 'Error should indicate variable is undefined');
  }
  console.log('✓ Test 3: Undefined variable throws error with variable name');
}

// Test 4: Boolean values converted to strings
{
  const template = 'enabled: {{isEnabled}}';
  const context = { isEnabled: true };
  const result = render(template, context);
  assert.strictEqual(result, 'enabled: true', 'Should convert boolean to string');
  console.log('✓ Test 4: Boolean values converted to strings');
}

// Test 5: Null/undefined values replaced with empty string
{
  const template1 = 'value: {{nullValue}}';
  const context1 = { nullValue: null };
  const result1 = render(template1, context1);
  assert.strictEqual(result1, 'value: ', 'Null should be replaced with empty string');
  
  const template2 = 'value: {{undefinedValue}}';
  const context2 = { undefinedValue: undefined };
  const result2 = render(template2, context2);
  assert.strictEqual(result2, 'value: ', 'Undefined should be replaced with empty string');
  console.log('✓ Test 5: Null/undefined values replaced with empty string');
}

// Test 6: Valid YAML passes validation
{
  const validYaml = `name: test-agent
description: A test agent
tools:
  - Bash
  - Read
  - Edit`;
  const result = validate(validYaml);
  assert.strictEqual(result.valid, true, 'Valid YAML should pass validation');
  assert.strictEqual(result.errors.length, 0, 'Valid YAML should have no errors');
  console.log('✓ Test 6: Valid YAML passes validation');
}

// Test 7: Invalid YAML caught with line number
{
  const invalidYaml = `name: test
tools: [Bash, Read`;  // Missing closing bracket
  const result = validate(invalidYaml);
  assert.strictEqual(result.valid, false, 'Invalid YAML should fail validation');
  assert.ok(result.errors.length > 0, 'Invalid YAML should have error array');
  assert.ok(result.errors[0].line !== null, 'Error should have line number');
  assert.ok(typeof result.errors[0].message === 'string', 'Error should have message');
  console.log('✓ Test 7: Invalid YAML caught with line number');
}

// Test 8: Malformed YAML provides helpful error message
{
  const malformedYaml = `name: test
  invalid: yaml: content: here`;
  const result = validate(malformedYaml);
  assert.strictEqual(result.valid, false, 'Malformed YAML should fail validation');
  assert.ok(result.errors[0].message.length > 0, 'Error message should be present');
  assert.ok(result.errors[0].rawError, 'Raw error message should be available');
  console.log('✓ Test 8: Malformed YAML provides helpful error message');
}

// Test 9: Template with whitespace in variable syntax
{
  const template = 'value: {{ name }}';  // Spaces around variable name
  const context = { name: 'test' };
  const result = render(template, context);
  assert.strictEqual(result, 'value: test', 'Should handle whitespace around variable name');
  console.log('✓ Test 9: Template with whitespace in variable syntax');
}

// Test 10: Multiple occurrences of same variable
{
  const template = '{{name}} says hello! {{name}} is friendly.';
  const context = { name: 'Bot' };
  const result = render(template, context);
  assert.strictEqual(result, 'Bot says hello! Bot is friendly.', 'Should replace all occurrences');
  console.log('✓ Test 10: Multiple occurrences of same variable');
}

// Test 11: Empty template
{
  const template = '';
  const context = { name: 'test' };
  const result = render(template, context);
  assert.strictEqual(result, '', 'Empty template should return empty string');
  console.log('✓ Test 11: Empty template');
}

// Test 12: Template with no variables
{
  const template = 'Just plain text';
  const context = { name: 'test' };
  const result = render(template, context);
  assert.strictEqual(result, 'Just plain text', 'Template without variables should return as-is');
  console.log('✓ Test 12: Template with no variables');
}

// Test 13: renderAndValidate combines both operations
{
  const template = 'name: {{agentName}}\ntools: [Bash]';
  const context = { agentName: 'test' };
  const result = renderAndValidate(template, context);
  assert.ok(result.rendered, 'Should have rendered output');
  assert.strictEqual(result.valid, true, 'Should validate rendered output');
  assert.ok(result.rendered.includes('name: test'), 'Should contain rendered content');
  console.log('✓ Test 13: renderAndValidate combines both operations');
}

// Test 14: renderAndValidate catches render errors
{
  const template = 'name: {{undefinedVar}}';
  const context = { name: 'test' };
  const result = renderAndValidate(template, context);
  assert.strictEqual(result.valid, false, 'Should report invalid when render fails');
  assert.ok(result.errors.length > 0, 'Should have error information');
  assert.ok(result.errors[0].message.includes('undefinedVar'), 'Error should mention variable');
  console.log('✓ Test 14: renderAndValidate catches render errors');
}

// Test 15: Validate handles non-string input
{
  const result = validate(123);
  assert.strictEqual(result.valid, false, 'Non-string input should be invalid');
  assert.ok(result.errors[0].message.includes('string'), 'Error should mention string requirement');
  console.log('✓ Test 15: Validate handles non-string input');
}

// Test 16: Render handles non-string template
{
  try {
    render(123, { name: 'test' });
    assert.fail('Should throw error for non-string template');
  } catch (err) {
    assert.ok(err.message.includes('string'), 'Error should mention string requirement');
  }
  console.log('✓ Test 16: Render handles non-string template');
}

// Test 17: Complex YAML structure validation
{
  const complexYaml = `
name: complex-agent
tools:
  - Bash
  - Read
config:
  maxRetries: 3
  timeout: 5000
  options:
    verbose: true
    debug: false
`;
  const result = validate(complexYaml);
  assert.strictEqual(result.valid, true, 'Complex nested YAML should be valid');
  console.log('✓ Test 17: Complex YAML structure validation');
}

console.log('\n✅ All engine tests passed');
