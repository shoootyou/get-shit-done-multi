/**
 * Unit tests for reference-resolver.js
 * Tests @-reference validation and variable interpolation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const resolver = require('./reference-resolver');

async function runTests() {
  console.log('Testing reference-resolver...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Module loads and exports functions
  try {
    assert.strictEqual(typeof resolver.validateReferences, 'function', 
      'Should export validateReferences');
    assert.strictEqual(typeof resolver.interpolateVariables, 'function', 
      'Should export interpolateVariables');
    assert.strictEqual(typeof resolver.extractVariables, 'function', 
      'Should export extractVariables');
    assert.strictEqual(typeof resolver.validateAndInterpolate, 'function', 
      'Should export validateAndInterpolate');
    assert.strictEqual(typeof resolver.extractReferences, 'function', 
      'Should export extractReferences');
    assert.strictEqual(typeof resolver.resolveReferencePath, 'function', 
      'Should export resolveReferencePath');
    console.log('✓ Test 1: Module exports correct interface');
    passed++;
  } catch (err) {
    console.error('✗ Test 1 failed:', err.message);
    failed++;
  }

  // Test 2: Extract @-references from prompt
  try {
    const prompt = 'Load @.planning/STATE.md and @.planning/ROADMAP.md';
    const references = resolver.extractReferences(prompt);
    assert.strictEqual(references.length, 2, 'Should find 2 references');
    assert(references.includes('.planning/STATE.md'), 'Should include STATE.md');
    assert(references.includes('.planning/ROADMAP.md'), 'Should include ROADMAP.md');
    console.log('✓ Test 2: Extract @-references from prompt');
    passed++;
  } catch (err) {
    console.error('✗ Test 2 failed:', err.message);
    failed++;
  }

  // Test 3: Validate existing files
  try {
    const prompt = 'Load @.planning/STATE.md';
    const validation = resolver.validateReferences(prompt, '.planning');
    assert.strictEqual(validation.valid, true, 'Should validate existing file');
    assert.strictEqual(validation.references.length, 1, 'Should find 1 reference');
    assert.strictEqual(validation.errors.length, 0, 'Should have no errors');
    console.log('✓ Test 3: Validate existing files');
    passed++;
  } catch (err) {
    console.error('✗ Test 3 failed:', err.message);
    failed++;
  }

  // Test 4: Detect missing files
  try {
    const prompt = 'Load @.planning/NONEXISTENT.md';
    const validation = resolver.validateReferences(prompt, '.planning');
    assert.strictEqual(validation.valid, false, 'Should mark as invalid');
    assert.strictEqual(validation.errors.length, 1, 'Should have 1 error');
    assert(validation.errors[0].includes('not found'), 'Error should mention file not found');
    console.log('✓ Test 4: Detect missing files');
    passed++;
  } catch (err) {
    console.error('✗ Test 4 failed:', err.message);
    failed++;
  }

  // Test 5: Interpolate {var} format
  try {
    const template = 'Execute {plan_path} and load file';
    const variables = { plan_path: '.planning/phases/01-foundation/01-01-PLAN.md' };
    const result = resolver.interpolateVariables(template, variables);
    assert(!result.includes('{plan_path}'), 'Should replace {plan_path}');
    assert(result.includes('.planning/phases/01-foundation/01-01-PLAN.md'), 
      'Should contain interpolated value');
    console.log('✓ Test 5: Interpolate {var} format');
    passed++;
  } catch (err) {
    console.error('✗ Test 5 failed:', err.message);
    failed++;
  }

  // Test 6: Interpolate @{var} format
  try {
    const template = 'Load @{plan_path} for context';
    const variables = { plan_path: '.planning/STATE.md' };
    const result = resolver.interpolateVariables(template, variables);
    assert(!result.includes('@{plan_path}'), 'Should replace @{plan_path}');
    assert(result.includes('.planning/STATE.md'), 'Should contain interpolated value');
    console.log('✓ Test 6: Interpolate @{var} format');
    passed++;
  } catch (err) {
    console.error('✗ Test 6 failed:', err.message);
    failed++;
  }

  // Test 7: Interpolation order - @{var} after {var}
  try {
    const template = 'Execute {plan_path} and load @{plan_path}';
    const variables = { plan_path: '.planning/STATE.md' };
    const result = resolver.interpolateVariables(template, variables);
    assert(!result.includes('{plan_path}'), 'Should replace {plan_path}');
    assert(!result.includes('@{plan_path}'), 'Should replace @{plan_path}');
    // Count occurrences of the value
    const occurrences = (result.match(/\.planning\/STATE\.md/g) || []).length;
    assert.strictEqual(occurrences, 2, 'Should have 2 occurrences of interpolated value');
    console.log('✓ Test 7: Interpolation order correct');
    passed++;
  } catch (err) {
    console.error('✗ Test 7 failed:', err.message);
    failed++;
  }

  // Test 8: Handle undefined variables
  try {
    const template = 'Execute {undefined_var}';
    const variables = {};
    const result = resolver.interpolateVariables(template, variables);
    assert(result.includes('{undefined_var}'), 'Should keep placeholder for undefined variable');
    console.log('✓ Test 8: Handle undefined variables');
    passed++;
  } catch (err) {
    console.error('✗ Test 8 failed:', err.message);
    failed++;
  }

  // Test 9: Extract variables from template
  try {
    const template = 'Execute {plan_path} and load @{state_path}';
    const extracted = resolver.extractVariables(template);
    // Note: @{state_path} contains {state_path}, so both are extracted
    assert.strictEqual(extracted.standard.length, 2, 'Should extract 2 standard variables (including one from @{var})');
    assert.strictEqual(extracted.reference.length, 1, 'Should extract 1 reference variable');
    assert(extracted.standard.includes('plan_path'), 'Should include plan_path');
    assert(extracted.standard.includes('state_path'), 'Should include state_path from @{state_path}');
    assert(extracted.reference.includes('state_path'), 'Should include state_path in reference');
    console.log('✓ Test 9: Extract variables from template');
    passed++;
  } catch (err) {
    console.error('✗ Test 9 failed:', err.message);
    failed++;
  }

  // Test 10: Resolve relative paths
  try {
    const reference = 'STATE.md';
    const resolved = resolver.resolveReferencePath(reference, '.planning');
    assert(resolved.includes('.planning'), 'Should include base directory');
    assert(resolved.includes('STATE.md'), 'Should include filename');
    console.log('✓ Test 10: Resolve relative paths');
    passed++;
  } catch (err) {
    console.error('✗ Test 10 failed:', err.message);
    failed++;
  }

  // Test 11: Resolve absolute paths
  try {
    const reference = '/workspace/.planning/STATE.md';
    const resolved = resolver.resolveReferencePath(reference, '.planning');
    assert(!resolved.startsWith('/'), 'Should remove leading slash');
    assert(resolved.startsWith('workspace'), 'Should start with workspace');
    console.log('✓ Test 11: Resolve absolute paths');
    passed++;
  } catch (err) {
    console.error('✗ Test 11 failed:', err.message);
    failed++;
  }

  // Test 12: Resolve dot-relative paths
  try {
    const reference = '.planning/STATE.md';
    const resolved = resolver.resolveReferencePath(reference, '.planning');
    assert.strictEqual(resolved, '.planning/STATE.md', 'Should preserve dot-relative path');
    console.log('✓ Test 12: Resolve dot-relative paths');
    passed++;
  } catch (err) {
    console.error('✗ Test 12 failed:', err.message);
    failed++;
  }

  // Test 13: validateAndInterpolate combines both operations
  try {
    const prompt = 'Execute @{plan_path}\n\nContext: @.planning/STATE.md';
    const variables = { plan_path: '.planning/ROADMAP.md' };
    const result = resolver.validateAndInterpolate(prompt, variables, '.planning');
    
    assert.strictEqual(result.valid, true, 'Should validate successfully');
    assert(!result.interpolated.includes('@{plan_path}'), 'Should interpolate variable');
    assert.strictEqual(result.references.length, 2, 'Should find 2 references');
    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
    console.log('✓ Test 13: validateAndInterpolate combines operations');
    passed++;
  } catch (err) {
    console.error('✗ Test 13 failed:', err.message);
    failed++;
  }

  // Test 14: validateAndInterpolate detects missing files after interpolation
  try {
    const prompt = 'Execute @{plan_path}';
    const variables = { plan_path: '.planning/NONEXISTENT.md' };
    const result = resolver.validateAndInterpolate(prompt, variables, '.planning');
    
    assert.strictEqual(result.valid, false, 'Should mark as invalid');
    assert.strictEqual(result.errors.length, 1, 'Should have 1 error');
    assert(result.errors[0].includes('not found'), 'Should report file not found');
    console.log('✓ Test 14: validateAndInterpolate detects missing files');
    passed++;
  } catch (err) {
    console.error('✗ Test 14 failed:', err.message);
    failed++;
  }

  // Test 15: Empty prompt handling
  try {
    const validation = resolver.validateReferences('', '.planning');
    assert.strictEqual(validation.valid, false, 'Should mark empty prompt as invalid');
    assert.strictEqual(validation.errors.length, 1, 'Should have 1 error');
    console.log('✓ Test 15: Handle empty prompt');
    passed++;
  } catch (err) {
    console.error('✗ Test 15 failed:', err.message);
    failed++;
  }

  // Test 16: Multiple references in single line
  try {
    const prompt = 'Load @.planning/STATE.md, @.planning/ROADMAP.md, @.planning/PROJECT.md';
    const validation = resolver.validateReferences(prompt, '.planning');
    assert.strictEqual(validation.references.length, 3, 'Should find 3 references');
    assert.strictEqual(validation.valid, true, 'Should validate all existing files');
    console.log('✓ Test 16: Handle multiple references in single line');
    passed++;
  } catch (err) {
    console.error('✗ Test 16 failed:', err.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
