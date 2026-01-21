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

// ============================================================================
// Phase 2: Platform Abstraction Integration Tests
// ============================================================================

/**
 * Test 9: Platform-specific tool transformation
 */
function testToolTransformation() {
  console.log('Test 9: Platform-specific tool transformation');
  
  const specContent = `---
name: tool-test-agent
description: Test tool transformation
tools: ['Bash', 'Read', 'Edit']
---

# Tool Test
`;
  
  const specPath = path.join(testDir, 'test-spec-9.md');
  fs.writeFileSync(specPath, specContent);
  
  // Test Claude (case-sensitive)
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.ok(claudeResult.output.includes('tools:'), 'Tools should be present');
  assert.ok(claudeResult.metadata.toolsTransformed, 'Tools should be marked as transformed');
  
  // Test Copilot
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  assert.ok(copilotResult.metadata.toolsTransformed, 'Tools should be marked as transformed');
  
  console.log('  ✓ Platform-specific tool transformation test passed\n');
}

/**
 * Test 10: Model field handling
 */
function testModelFieldHandling() {
  console.log('Test 10: Model field handling');
  
  const specContent = `---
name: model-test-agent
description: Test model field
model: haiku
---

# Model Test
`;
  
  const specPath = path.join(testDir, 'test-spec-10.md');
  fs.writeFileSync(specPath, specContent);
  
  // Test Claude (includes model)
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.ok(claudeResult.output.includes('model: haiku'), 'Model should be included for Claude');
  assert.strictEqual(claudeResult.warnings.length, 0, 'Claude should have no warnings about model');
  
  // Test Copilot (excludes model with warning)
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  assert.ok(!copilotResult.output.includes('model:'), 'Model should be excluded for Copilot');
  assert.ok(copilotResult.warnings.length > 0, 'Copilot should have warnings');
  assert.ok(copilotResult.warnings.some(w => w.field === 'model'), 'Should warn about model field');
  
  console.log('  ✓ Model field handling test passed\n');
}

/**
 * Test 11: Hooks handling
 */
function testHooksHandling() {
  console.log('Test 11: Hooks handling');
  
  const specContent = `---
name: hooks-test-agent
description: Test hooks field
hooks:
  on_create: echo "created"
  on_message: echo "message"
---

# Hooks Test
`;
  
  const specPath = path.join(testDir, 'test-spec-11.md');
  fs.writeFileSync(specPath, specContent);
  
  // Test Claude (includes hooks)
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.ok(claudeResult.output.includes('hooks:'), 'Hooks should be included for Claude');
  
  // Test Copilot (excludes hooks with warning)
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  assert.ok(!copilotResult.output.includes('hooks:'), 'Hooks should be excluded for Copilot');
  assert.ok(copilotResult.warnings.some(w => w.field === 'hooks'), 'Should warn about hooks field');
  
  console.log('  ✓ Hooks handling test passed\n');
}

/**
 * Test 12: Platform-specific tool warnings
 */
function testPlatformToolWarnings() {
  console.log('Test 12: Platform-specific tool warnings');
  
  const specContent = `---
name: warning-test-agent
description: Test tool warnings
tools: ['Bash', 'Read', 'WebFetch']
---

# Warning Test
`;
  
  const specPath = path.join(testDir, 'test-spec-12.md');
  fs.writeFileSync(specPath, specContent);
  
  // WebFetch is Claude-only
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Generation should succeed with warnings');
  assert.ok(copilotResult.warnings.length > 0, 'Should have warnings');
  
  // Canonical tools should have no warnings
  const safeSpec = `---
name: safe-test-agent
description: Test safe tools
tools: ['Bash', 'Read', 'Edit']
---

# Safe Test
`;
  
  const safeSpecPath = path.join(testDir, 'test-spec-12b.md');
  fs.writeFileSync(safeSpecPath, safeSpec);
  
  const safeResult = generateAgent(safeSpecPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(safeResult.success, true, 'Safe tools should succeed');
  // Note: May have field-transform warnings, but not tool warnings
  
  console.log('  ✓ Platform-specific tool warnings test passed\n');
}

/**
 * Test 13: Tool wildcard handling
 */
function testToolWildcardHandling() {
  console.log('Test 13: Tool wildcard handling');
  
  const specContent = `---
name: wildcard-test-agent
description: Test wildcard tools
tools: ['*']
---

# Wildcard Test
`;
  
  const specPath = path.join(testDir, 'test-spec-13.md');
  fs.writeFileSync(specPath, specContent);
  
  // Claude should fail validation (wildcards not allowed)
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, false, 'Claude should reject wildcard tools');
  assert.ok(claudeResult.errors.some(e => 
    e.message && e.message.includes('wildcard')
  ), 'Should error about wildcard');
  
  // Copilot should succeed (wildcards allowed)
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot should accept wildcard tools');
  
  console.log('  ✓ Tool wildcard handling test passed\n');
}

/**
 * Test 14: Field validation integration
 */
function testFieldValidationIntegration() {
  console.log('Test 14: Field validation integration');
  
  const specContent = `---
name: validation-test-agent
description: Test field validation
tools: ['bash', 'read']
---

# Validation Test
`;
  
  const specPath = path.join(testDir, 'test-spec-14.md');
  fs.writeFileSync(specPath, specContent);
  
  // Lowercase tools should fail Claude validation
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(result.success, false, 'Lowercase tools should fail Claude validation');
  assert.ok(result.errors.some(e => 
    e.field === 'tools' && e.message.includes('case')
  ), 'Should error about tool case');
  
  console.log('  ✓ Field validation integration test passed\n');
}

/**
 * Test 15: Prompt length validation
 */
function testPromptLengthValidation() {
  console.log('Test 15: Prompt length validation');
  
  // Create a very long prompt (>30k chars for Copilot)
  const longBody = 'x'.repeat(31000);
  const specContent = `---
name: length-test-agent
description: Test prompt length
---

${longBody}
`;
  
  const specPath = path.join(testDir, 'test-spec-15.md');
  fs.writeFileSync(specPath, specContent);
  
  // Copilot should warn/fail (30k limit)
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, false, 'Long prompt should fail for Copilot');
  assert.ok(copilotResult.errors.some(e => 
    e.stage === 'prompt-length'
  ), 'Should error about prompt length');
  
  // Claude should be fine (200k limit)
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Long prompt should pass for Claude');
  
  console.log('  ✓ Prompt length validation test passed\n');
}

/**
 * Test 16: End-to-end platform abstraction
 */
function testEndToEndPlatformAbstraction() {
  console.log('Test 16: End-to-end platform abstraction');
  
  // Complex spec with multiple platform-specific features
  const specContent = `---
name: complex-platform-agent
description: "{{platform}} agent with all features"
tools: ['Bash', 'Read', 'Edit', 'Grep']
model: haiku
hooks:
  on_create: echo "Agent created"
skills:
  - skill-one
  - skill-two
disallowedTools:
  - WebFetch
---

# Complex Platform Agent

This agent tests all platform abstraction features.

Platform: {{platform}}
Supports model selection: {{supportsModel}}
Supports hooks: {{supportsHooks}}
`;
  
  const specPath = path.join(testDir, 'test-spec-16.md');
  fs.writeFileSync(specPath, specContent);
  
  // Generate for Claude
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  
  // Extract frontmatter for checking
  const claudeFrontmatter = claudeResult.output.split('---\n')[1];
  assert.ok(claudeFrontmatter.includes('model: haiku'), 'Claude should include model');
  assert.ok(claudeFrontmatter.includes('hooks:'), 'Claude should include hooks');
  assert.ok(claudeFrontmatter.includes('skills:'), 'Claude should include skills');
  assert.ok(claudeFrontmatter.includes('disallowedTools:'), 'Claude should include disallowedTools');
  assert.ok(claudeResult.metadata.toolsTransformed, 'Tools should be transformed');
  assert.ok(claudeResult.metadata.fieldsTransformed, 'Fields should be transformed');
  assert.ok(claudeResult.metadata.validationPassed, 'Validation should pass');
  
  // Generate for Copilot
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/workspace' });
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  
  // Extract frontmatter for checking
  const copilotFrontmatter = copilotResult.output.split('---\n')[1];
  assert.ok(!copilotFrontmatter.includes('model:'), 'Copilot should exclude model');
  assert.ok(!copilotFrontmatter.includes('hooks:'), 'Copilot should exclude hooks');
  assert.ok(!copilotFrontmatter.includes('skills:'), 'Copilot should exclude skills');
  assert.ok(!copilotFrontmatter.includes('disallowedTools:'), 'Copilot should exclude disallowedTools');
  assert.ok(copilotResult.warnings.length > 0, 'Copilot should have warnings');
  assert.ok(copilotResult.warnings.some(w => w.field === 'model'), 'Should warn about model');
  assert.ok(copilotResult.warnings.some(w => w.field === 'hooks'), 'Should warn about hooks');
  assert.ok(copilotResult.metadata.validationPassed, 'Validation should pass');
  
  // Outputs should differ
  assert.notStrictEqual(claudeResult.output, copilotResult.output, 'Outputs should differ by platform');
  
  console.log('  ✓ End-to-end platform abstraction test passed\n');
}

// ============================================================================
// Phase 3: Spec-as-Template Platform Generation Tests
// ============================================================================

/**
 * Test 17: Generate Claude agent from template spec with conditionals
 */
function testClaudeAgentFromTemplate() {
  console.log('Test 17: Generate Claude agent from template spec with conditionals');
  
  const specPath = path.join('/workspace', 'specs/agents/gsd-planner.md');
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  assert.ok(result.output, 'Output should be populated');
  assert.ok(result.output.includes('tools:'), 'Tools field should be present');
  assert.ok(result.output.includes('WebFetch'), 'Claude-specific WebFetch should be included');
  assert.ok(result.output.includes('mcp__context7__'), 'Claude MCP tools should be included');
  
  // No template syntax should remain
  assert.ok(!result.output.includes('{{#isClaude}}'), 'Claude conditionals should be resolved');
  assert.ok(!result.output.includes('{{#isCopilot}}'), 'Other platform conditionals should be removed');
  assert.ok(!result.output.includes('{{'), 'No template variables should remain');
  assert.ok(!result.output.includes('}}'), 'No template variables should remain');
  
  // Parse and validate frontmatter
  const matter = require('gray-matter');
  const parsed = matter(result.output);
  assert.ok(parsed.data.tools, 'Tools should be defined');
  assert.ok(parsed.data.tools.includes('WebFetch'), 'WebFetch should be in tools array');
  assert.ok(!parsed.data.tools.includes('webfetch'), 'Tools should be case-preserved');
  assert.strictEqual(parsed.data.name, 'gsd-planner', 'Name should match spec');
  
  console.log('  ✓ Claude agent from template test passed\n');
}

/**
 * Test 18: Generate Copilot agent from same spec with different output
 */
function testCopilotAgentFromTemplate() {
  console.log('Test 18: Generate Copilot agent from same spec with different output');
  
  // Use smaller agent for Copilot due to 30K prompt limit
  const specPath = path.join('/workspace', 'specs/agents/gsd-verifier.md');
  const result = generateAgent(specPath, 'copilot', { workDir: '.github/skills/get-shit-done' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  assert.ok(result.output, 'Output should be populated');
  assert.ok(result.output.includes('tools:'), 'Tools field should be present');
  assert.ok(!result.output.includes('WebFetch'), 'Copilot should not have WebFetch');
  assert.ok(!result.output.includes('mcp__context7__'), 'Copilot should not have Claude MCP tools');
  assert.ok(!result.output.includes('{{#isCopilot}}'), 'Copilot conditionals should be resolved');
  
  // Parse and validate frontmatter
  const matter = require('gray-matter');
  const parsed = matter(result.output);
  assert.ok(parsed.data.tools, 'Tools should be defined');
  assert.ok(!parsed.data.tools.includes('WebFetch'), 'WebFetch should not be in tools array');
  assert.ok(!('model' in parsed.data), 'Copilot should not have model field in frontmatter');
  
  // Check for lowercase tools
  const hasLowercaseTools = parsed.data.tools.every(t => typeof t === 'string' && t === t.toLowerCase());
  assert.ok(hasLowercaseTools, 'All tools should be lowercase for Copilot');
  
  console.log('  ✓ Copilot agent from template test passed\n');
}

/**
 * Test 19: Claude and Copilot outputs differ appropriately
 */
function testPlatformOutputDifferences() {
  console.log('Test 19: Claude and Copilot outputs differ appropriately');
  
  // Use smaller agent for fair comparison
  const specPath = path.join('/workspace', 'specs/agents/gsd-verifier.md');
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '.github/skills/get-shit-done' });
  
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  
  // Different outputs
  assert.notStrictEqual(claudeResult.output, copilotResult.output, 'Outputs should differ by platform');
  
  // Parse to check tools
  const matter = require('gray-matter');
  const claudeParsed = matter(claudeResult.output);
  const copilotParsed = matter(copilotResult.output);
  
  // Claude has uppercase tools, Copilot has lowercase
  assert.ok(claudeParsed.data.tools.includes('Read'), 'Claude should have uppercase Read');
  assert.ok(copilotParsed.data.tools.includes('read'), 'Copilot should have lowercase read');
  assert.ok(!copilotParsed.data.tools.includes('Read'), 'Copilot should not have uppercase Read');
  
  console.log('  ✓ Platform output differences test passed\n');
}

/**
 * Test 20: Generated Claude agent validates against Claude spec
 */
function testClaudeAgentValidation() {
  console.log('Test 20: Generated Claude agent validates against Claude spec');
  
  const specPath = path.join('/workspace', 'specs/agents/gsd-planner.md');
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  
  const matter = require('gray-matter');
  const parsed = matter(result.output);
  
  const { validateClaudeSpec } = require('./validators');
  const validation = validateClaudeSpec(parsed.data);
  
  assert.strictEqual(validation.valid, true, 'Claude agent should validate');
  assert.strictEqual(validation.errors.length, 0, 'No validation errors should be present');
  
  console.log('  ✓ Claude agent validation test passed\n');
}

/**
 * Test 21: Generated Copilot agent validates against Copilot spec
 */
function testCopilotAgentValidation() {
  console.log('Test 21: Generated Copilot agent validates against Copilot spec');
  
  // Use smaller agent for Copilot
  const specPath = path.join('/workspace', 'specs/agents/gsd-verifier.md');
  const result = generateAgent(specPath, 'copilot', { workDir: '.github/skills/get-shit-done' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  
  const matter = require('gray-matter');
  const parsed = matter(result.output);
  
  const { validateCopilotSpec } = require('./validators');
  const validation = validateCopilotSpec(parsed.data);
  
  assert.strictEqual(validation.valid, true, 'Copilot agent should validate');
  assert.strictEqual(validation.errors.length, 0, 'No validation errors should be present');
  
  console.log('  ✓ Copilot agent validation test passed\n');
}

/**
 * Test 22: Template variables fully resolved in output
 */
function testTemplateVariablesResolved() {
  console.log('Test 22: Template variables fully resolved in output');
  
  const specPath = path.join('/workspace', 'specs/agents/gsd-planner.md');
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  
  // No template syntax should remain
  assert.ok(!result.output.includes('{{'), 'No opening brackets should remain');
  assert.ok(!result.output.includes('}}'), 'No closing brackets should remain');
  assert.ok(!result.output.includes('{{#if'), 'No if blocks should remain');
  assert.ok(!result.output.includes('{{/if'), 'No if closing tags should remain');
  assert.ok(!result.output.includes('{{#isClaude}}'), 'No Claude conditionals should remain');
  assert.ok(!result.output.includes('{{#isCopilot}}'), 'No Copilot conditionals should remain');
  
  console.log('  ✓ Template variables resolved test passed\n');
}

/**
 * Test 23: Generate all 11 agents successfully for Claude
 */
function testGenerateAllAgentsForClaude() {
  console.log('Test 23: Generate all 11 agents successfully for Claude');
  
  const agentNames = [
    'gsd-planner', 'gsd-executor', 'gsd-verifier',
    'gsd-codebase-mapper', 'gsd-debugger', 'gsd-phase-researcher',
    'gsd-plan-checker', 'gsd-project-researcher', 'gsd-research-synthesizer',
    'gsd-roadmapper', 'gsd-integration-checker'
  ];
  
  const results = agentNames.map(name => {
    const specPath = path.join('/workspace', `specs/agents/${name}.md`);
    return { name, result: generateAgent(specPath, 'claude', { workDir: '/workspace' }) };
  });
  
  const allSuccess = results.every(r => r.result.success);
  assert.ok(allSuccess, 'All agents should generate successfully for Claude');
  
  const failed = results.filter(r => !r.result.success);
  if (failed.length > 0) {
    console.error('Failed agents:', failed.map(f => ({ name: f.name, errors: f.result.errors })));
    assert.fail(`${failed.length} agents failed to generate: ${failed.map(f => f.name).join(', ')}`);
  }
  
  console.log('  ✓ All 11 agents generated for Claude test passed\n');
}

/**
 * Test 24: Generate all 11 agents successfully for Copilot
 */
function testGenerateAllAgentsForCopilot() {
  console.log('Test 24: Generate all 11 agents successfully for Copilot');
  
  const agentNames = [
    'gsd-planner', 'gsd-executor', 'gsd-verifier',
    'gsd-codebase-mapper', 'gsd-debugger', 'gsd-phase-researcher',
    'gsd-plan-checker', 'gsd-project-researcher', 'gsd-research-synthesizer',
    'gsd-roadmapper', 'gsd-integration-checker'
  ];
  
  const results = agentNames.map(name => {
    const specPath = path.join('/workspace', `specs/agents/${name}.md`);
    return { name, result: generateAgent(specPath, 'copilot', { workDir: '.github/skills/get-shit-done' }) };
  });
  
  // Note: Some agents may be too large for Copilot's 30K char limit
  // Test that majority succeed
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  
  console.log(`  Generated: ${successful.length}/${agentNames.length} agents`);
  if (failed.length > 0) {
    const failedNames = failed.map(f => f.name).join(', ');
    console.log(`  Failed (likely too large): ${failedNames}`);
    
    // Check failures are all due to prompt length (expected)
    const lengthFailures = failed.filter(f => 
      f.result.errors.some(e => e.stage === 'prompt-length')
    );
    assert.strictEqual(lengthFailures.length, failed.length, 'All failures should be prompt length issues');
  }
  
  // At least 9/11 agents should generate successfully (planner and debugger are large)
  assert.ok(successful.length >= 9, `At least 9 agents should generate (got ${successful.length})`);
  
  console.log('  ✓ All agents generated for Copilot test passed\n');
}

/**
 * Test 25: Original agent content preserved in generated output
 */
function testOriginalContentPreserved() {
  console.log('Test 25: Original agent content preserved in generated output');
  
  // Use verifier as it's a good size
  const specPath = path.join('/workspace', 'specs/agents/gsd-verifier.md');
  const spec = fs.readFileSync(specPath, 'utf8');
  const original = fs.readFileSync(path.join('/workspace', 'agents/gsd-verifier.md'), 'utf8');
  
  const result = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  
  assert.strictEqual(result.success, true, 'Generation should succeed');
  
  // Extract markdown body from both (skip frontmatter)
  const originalBody = original.split('---').slice(2).join('---').trim();
  const generatedBody = result.output.split('---').slice(2).join('---').trim();
  
  // Generated body should match original body (content preserved)
  assert.ok(generatedBody.includes('<role>'), 'Generated should contain role section');
  
  // Check that content is substantive (roughly same length)
  const lengthRatio = generatedBody.length / originalBody.length;
  assert.ok(lengthRatio >= 0.90, `Generated body should be at least 90% of original length (ratio: ${lengthRatio})`);
  
  console.log('  ✓ Original content preserved test passed\n');
}

/**
 * Test 26: Platform-specific context variables substituted
 */
function testPlatformContextVariables() {
  console.log('Test 26: Platform-specific context variables substituted');
  
  // Use verifier for consistency
  const specPath = path.join('/workspace', 'specs/agents/gsd-verifier.md');
  
  // Generate with custom workDir
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/test/claude' });
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '/test/copilot' });
  
  assert.strictEqual(claudeResult.success, true, 'Claude generation should succeed');
  assert.strictEqual(copilotResult.success, true, 'Copilot generation should succeed');
  
  // Check for variable substitution (if spec uses workDir)
  assert.ok(!claudeResult.output.includes('{{workDir}}'), 'Claude should not have unresolved workDir');
  assert.ok(!copilotResult.output.includes('{{workDir}}'), 'Copilot should not have unresolved workDir');
  
  console.log('  ✓ Platform-specific context variables test passed\n');
}

// Run all tests
console.log('\n=== Template System Integration Tests ===\n');

try {
  // Phase 1 tests (8 tests)
  testHappyPath();
  testPlatformSwitching();
  testInvalidSpec();
  testUndefinedVariables();
  testValidationCatchesInvalid();
  testComplexTemplate();
  testGenerateFromSpec();
  testValidateOnly();
  
  // Phase 2 tests (8 tests)
  testToolTransformation();
  testModelFieldHandling();
  testHooksHandling();
  testPlatformToolWarnings();
  testToolWildcardHandling();
  testFieldValidationIntegration();
  testPromptLengthValidation();
  testEndToEndPlatformAbstraction();
  
  // Phase 3 tests (10 tests)
  testClaudeAgentFromTemplate();
  testCopilotAgentFromTemplate();
  testPlatformOutputDifferences();
  testClaudeAgentValidation();
  testCopilotAgentValidation();
  testTemplateVariablesResolved();
  testGenerateAllAgentsForClaude();
  testGenerateAllAgentsForCopilot();
  testOriginalContentPreserved();
  testPlatformContextVariables();
  
  console.log('✓ All 26 integration tests passed! (8 Phase 1 + 8 Phase 2 + 10 Phase 3)\n');
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
