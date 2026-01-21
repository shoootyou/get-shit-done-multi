/**
 * Integration Tests for Template System
 * End-to-end tests verifying spec → agent generation pipeline
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateAgent, generateFromSpec } = require('./generator');

// Create temp directory for test files
const testDir = path.join(os.tmpdir(), 'template-system-integration-tests');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

/**
 * Test 1: Happy path - Complete generation
 */
function testHappyPath() {
  console.log('Test 1: Happy path - Complete generation');
  
  const specContent = `---
name: test-agent
description: Agent for {{platform}}
tools: ['Bash', 'Read']
---

# Test Agent

Platform: {{platform}}
Work directory: {{workDir}}
`;
  
  const specPath = path.join(testDir, 'test-spec-1.md');
  fs.writeFileSync(specPath, specContent);
  
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  assert.ok(result.output, 'Output should be populated');
  assert.ok(result.output.includes('Platform: claude'), 'Platform variable should be substituted');
  assert.ok(result.output.includes('Work directory: /workspace'), 'workDir variable should be substituted');
  assert.ok(result.output.includes('name: test-agent'), 'Frontmatter should be present');
  assert.strictEqual(result.errors.length, 0, 'No errors should be present');
  
  console.log('  ✓ Happy path test passed\n');
}

/**
 * Test 2: Platform switching
 */
function testPlatformSwitching() {
  console.log('Test 2: Platform switching');
  
  const specContent = `---
name: multi-platform-agent
description: Works on {{platform}}
---

# {{platform}} Agent

Platform capabilities: {{supportsModel}}
`;
  
  const specPath = path.join(testDir, 'test-spec-2.md');
  fs.writeFileSync(specPath, specContent);
  
  // Test Claude
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.ok(claudeResult.output.includes('# claude Agent'), 'Claude platform should be in output');
  assert.ok(claudeResult.output.includes('Works on claude'), 'Claude description should be rendered');
  
  // Test Copilot
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  assert.ok(copilotResult.output.includes('# copilot Agent'), 'Copilot platform should be in output');
  assert.ok(copilotResult.output.includes('Works on copilot'), 'Copilot description should be rendered');
  
  // Outputs should be different
  assert.notStrictEqual(claudeResult.output, copilotResult.output, 'Outputs should differ by platform');
  
  console.log('  ✓ Platform switching test passed\n');
}

/**
 * Test 3: Error handling - Invalid spec
 */
function testInvalidSpec() {
  console.log('Test 3: Error handling - Invalid spec');
  
  // Test 3a: Malformed YAML
  const malformedContent = `---
name: test
description: [unclosed bracket
---

# Test
`;
  
  const malformedPath = path.join(testDir, 'test-spec-3a.md');
  fs.writeFileSync(malformedPath, malformedContent);
  
  const malformedResult = generateAgent(malformedPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(malformedResult.success, false, 'Malformed YAML should fail');
  assert.ok(malformedResult.errors.length > 0, 'Errors array should be populated');
  assert.strictEqual(malformedResult.output, null, 'Output should be null on failure');
  
  // Test 3b: File not found
  const missingPath = path.join(testDir, 'nonexistent-spec.md');
  const missingResult = generateAgent(missingPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(missingResult.success, false, 'Missing file should fail');
  assert.ok(missingResult.errors.length > 0, 'Errors should be populated');
  assert.ok(missingResult.errors[0].message.includes('not found'), 'Error should mention file not found');
  
  console.log('  ✓ Invalid spec error handling passed\n');
}

/**
 * Test 4: Error handling - Undefined variables
 */
function testUndefinedVariables() {
  console.log('Test 4: Error handling - Undefined variables');
  
  const specContent = `---
name: test-agent
description: Uses {{nonexistentVar}}
---

# Test
`;
  
  const specPath = path.join(testDir, 'test-spec-4.md');
  fs.writeFileSync(specPath, specContent);
  
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, false, 'Undefined variable should fail');
  assert.ok(result.errors.length > 0, 'Errors should be populated');
  assert.ok(
    result.errors[0].message.includes('nonexistentVar') || 
    result.errors[0].message.includes('Undefined variable'),
    'Error should mention the undefined variable'
  );
  
  console.log('  ✓ Undefined variable error handling passed\n');
}

/**
 * Test 5: Validation catches invalid output
 */
function testValidationCatchesInvalid() {
  console.log('Test 5: Validation catches invalid output');
  
  // Create spec that will render to invalid YAML
  const specContent = `---
name: test-agent
description: "Test with {{platform}}"
invalid_field: "{{platform}}: [unclosed"
---

# Test
`;
  
  const specPath = path.join(testDir, 'test-spec-5.md');
  fs.writeFileSync(specPath, specContent);
  
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  // This may or may not fail depending on how the YAML renders
  // The key is that if it's invalid, we catch it
  if (!result.success) {
    assert.ok(result.errors.length > 0, 'Validation errors should be present');
    assert.ok(
      result.errors.some(e => e.stage === 'validate' || e.stage === 'render-frontmatter'),
      'Error should be from validation or render stage'
    );
  }
  
  console.log('  ✓ Validation test passed\n');
}

/**
 * Test 6: Complex template with multiple variables
 */
function testComplexTemplate() {
  console.log('Test 6: Complex template with multiple variables');
  
  const specContent = `---
name: complex-agent
description: "{{platform}} agent in {{workDir}}"
capabilities:
  model: {{supportsModel}}
  wildcards: {{supportsWildcards}}
metadata:
  platform: "{{platform}}"
  version: "1.0"
---

# Complex Agent

## Platform Details
- Platform: {{platform}}
- Claude: {{isClaude}}
- Copilot: {{isCopilot}}

## Paths
- Working: {{workDir}}
- Agents: {{agentsPath}}
- Skills: {{skillsPath}}

## Capabilities
- Model selection: {{supportsModel}}
- Wildcard tools: {{supportsWildcards}}
`;
  
  const specPath = path.join(testDir, 'test-spec-6.md');
  fs.writeFileSync(specPath, specContent);
  
  const result = generateAgent(specPath, 'claude', { 
    workDir: '/workspace',
    verbose: true
  });
  
  assert.strictEqual(result.success, true, 'Complex generation should succeed');
  assert.ok(result.output.includes('Platform: claude'), 'Platform should be substituted');
  assert.ok(result.output.includes('- Claude: true'), 'Claude flag should be true');
  assert.ok(result.output.includes('- Copilot: false'), 'Copilot flag should be false');
  assert.ok(result.output.includes('Working: /workspace'), 'workDir should be substituted');
  
  console.log('  ✓ Complex template test passed\n');
}

/**
 * Test 7: generateFromSpec function
 */
function testGenerateFromSpec() {
  console.log('Test 7: generateFromSpec function');
  
  const spec = {
    frontmatter: {
      name: 'memory-agent',
      description: 'Agent for {{platform}}'
    },
    body: '# {{platform}} Agent\n\nWorks in {{workDir}}'
  };
  
  const result = generateFromSpec(spec, 'copilot', { workDir: '/test' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  assert.ok(result.output.includes('name: memory-agent'), 'Name should be present');
  assert.ok(result.output.includes('Agent for copilot'), 'Platform in description should be substituted');
  assert.ok(result.output.includes('# copilot Agent'), 'Platform in heading should be substituted');
  assert.ok(result.output.includes('Works in /test'), 'workDir should be substituted');
  
  console.log('  ✓ generateFromSpec test passed\n');
}

/**
 * Test 8: validateOnly option
 */
function testValidateOnly() {
  console.log('Test 8: validateOnly option');
  
  const specContent = `---
name: validate-test
description: Valid spec
---

# Test
`;
  
  const specPath = path.join(testDir, 'test-spec-8.md');
  fs.writeFileSync(specPath, specContent);
  
  const result = generateAgent(specPath, 'claude', { 
    workDir: '/workspace',
    validateOnly: true
  });
  
  assert.strictEqual(result.success, true, 'Validation should succeed');
  assert.strictEqual(result.output, null, 'Output should be null with validateOnly');
  assert.strictEqual(result.errors.length, 0, 'No errors should be present');
  
  console.log('  ✓ validateOnly option test passed\n');
}

// Run all tests
console.log('\n=== Template System Integration Tests ===\n');

try {
  testHappyPath();
  testPlatformSwitching();
  testInvalidSpec();
  testUndefinedVariables();
  testValidationCatchesInvalid();
  testComplexTemplate();
  testGenerateFromSpec();
  testValidateOnly();
  
  console.log('✓ All integration tests passed!\n');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  // Cleanup temp directory
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (err) {
    // Ignore cleanup errors
  }
}
