/**
 * Unit tests for sequential-spawn-validator.js
 * Tests checkpoint continuation pattern validation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const validator = require('./sequential-spawn-validator');

async function runTests() {
  console.log('Testing sequential-spawn-validator...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Module loads and exports functions
  try {
    assert.strictEqual(typeof validator.validateSequentialSpawning, 'function', 
      'Should export validateSequentialSpawning');
    assert.strictEqual(typeof validator.detectCheckpointFile, 'function', 
      'Should export detectCheckpointFile');
    assert.strictEqual(typeof validator.detectRespawnWithReference, 'function', 
      'Should export detectRespawnWithReference');
    assert.strictEqual(typeof validator.verifyContextPassing, 'function', 
      'Should export verifyContextPassing');
    assert.strictEqual(typeof validator.parseCheckpointWorkflow, 'function', 
      'Should export parseCheckpointWorkflow');
    console.log('✓ Test 1: Module exports correct interface');
    passed++;
  } catch (err) {
    console.error('✗ Test 1 failed:', err.message);
    failed++;
  }

  // Test 2: validateSequentialSpawning returns correct structure
  try {
    const result = validator.validateSequentialSpawning('gsd-test', '.continue-here.md', 'test prompt');
    assert.strictEqual(typeof result, 'object', 'Should return object');
    assert.strictEqual(typeof result.success, 'boolean', 'Should have success field');
    assert.strictEqual(typeof result.checkpointFound, 'boolean', 'Should have checkpointFound field');
    assert.strictEqual(typeof result.respawnDetected, 'boolean', 'Should have respawnDetected field');
    assert.strictEqual(typeof result.contextPassed, 'boolean', 'Should have contextPassed field');
    assert(Array.isArray(result.errors), 'Should have errors array');
    console.log('✓ Test 2: validateSequentialSpawning returns correct structure');
    passed++;
  } catch (err) {
    console.error('✗ Test 2 failed:', err.message);
    failed++;
  }

  // Test 3: detectCheckpointFile finds existing checkpoint files
  try {
    // Create a temporary test directory
    const testDir = path.join(__dirname, '.test-checkpoint');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a test checkpoint file
    const checkpointFile = path.join(testDir, '.continue-here.md');
    fs.writeFileSync(checkpointFile, '# Test Checkpoint\nTest content');

    // Test detection
    const found = validator.detectCheckpointFile(testDir, '.continue-here.md');
    assert(found !== null, 'Should find checkpoint file');
    assert(found.includes('.continue-here.md'), 'Should return correct path');

    // Cleanup
    fs.unlinkSync(checkpointFile);
    fs.rmdirSync(testDir);

    console.log('✓ Test 3: detectCheckpointFile finds checkpoint files');
    passed++;
  } catch (err) {
    console.error('✗ Test 3 failed:', err.message);
    failed++;
  }

  // Test 4: detectCheckpointFile returns null for missing files
  try {
    const notFound = validator.detectCheckpointFile('/nonexistent/directory', '.continue-here.md');
    assert.strictEqual(notFound, null, 'Should return null for missing directory');
    console.log('✓ Test 4: detectCheckpointFile handles missing directory');
    passed++;
  } catch (err) {
    console.error('✗ Test 4 failed:', err.message);
    failed++;
  }

  // Test 5: detectRespawnWithReference detects @-references
  try {
    const output = 'Task(agent: "gsd-researcher", prompt: "Continue from @.planning/phases/01-foundation/.continue-here.md")';
    const checkpointPath = '.planning/phases/01-foundation/.continue-here.md';
    const detected = validator.detectRespawnWithReference(output, checkpointPath);
    assert.strictEqual(detected, true, 'Should detect @-reference in output');
    console.log('✓ Test 5: detectRespawnWithReference detects references');
    passed++;
  } catch (err) {
    console.error('✗ Test 5 failed:', err.message);
    failed++;
  }

  // Test 6: detectRespawnWithReference returns false without reference
  try {
    const output = 'Task(agent: "gsd-researcher", prompt: "Some prompt")';
    const checkpointPath = '.planning/phases/01-foundation/.continue-here.md';
    const detected = validator.detectRespawnWithReference(output, checkpointPath);
    assert.strictEqual(detected, false, 'Should return false without reference');
    console.log('✓ Test 6: detectRespawnWithReference returns false without reference');
    passed++;
  } catch (err) {
    console.error('✗ Test 6 failed:', err.message);
    failed++;
  }

  // Test 7: verifyContextPassing detects @-reference in prompt
  try {
    const checkpointPath = '.planning/STATE.md'; // Use existing file
    const respawnPrompt = 'Continue from @.planning/STATE.md with context';
    const verified = validator.verifyContextPassing(checkpointPath, respawnPrompt);
    assert.strictEqual(verified, true, 'Should verify context passing via @-reference');
    console.log('✓ Test 7: verifyContextPassing detects @-reference');
    passed++;
  } catch (err) {
    console.error('✗ Test 7 failed:', err.message);
    failed++;
  }

  // Test 8: parseCheckpointWorkflow counts Task() calls
  try {
    const output = `
      Task(agent: "gsd-researcher", prompt: "First task")
      Some output...
      Task(agent: "gsd-researcher", prompt: "Second task with checkpoint")
    `;
    const workflow = validator.parseCheckpointWorkflow(output);
    assert.strictEqual(workflow.taskCount, 2, 'Should count 2 Task() calls');
    console.log('✓ Test 8: parseCheckpointWorkflow counts Task() calls');
    passed++;
  } catch (err) {
    console.error('✗ Test 8 failed:', err.message);
    failed++;
  }

  // Test 9: parseCheckpointWorkflow detects checkpoint keywords
  try {
    const output = 'Agent output with CHECKPOINT REACHED message';
    const workflow = validator.parseCheckpointWorkflow(output);
    assert.strictEqual(workflow.checkpointDetected, true, 'Should detect checkpoint keyword');
    console.log('✓ Test 9: parseCheckpointWorkflow detects checkpoint keywords');
    passed++;
  } catch (err) {
    console.error('✗ Test 9 failed:', err.message);
    failed++;
  }

  // Test 10: parseCheckpointWorkflow extracts @-references
  try {
    const output = 'Load @.planning/STATE.md and @.planning/ROADMAP.md for context';
    const workflow = validator.parseCheckpointWorkflow(output);
    assert.strictEqual(workflow.references.length, 2, 'Should extract 2 references');
    assert(workflow.references.includes('.planning/STATE.md'), 'Should include STATE.md');
    assert(workflow.references.includes('.planning/ROADMAP.md'), 'Should include ROADMAP.md');
    console.log('✓ Test 10: parseCheckpointWorkflow extracts @-references');
    passed++;
  } catch (err) {
    console.error('✗ Test 10 failed:', err.message);
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
