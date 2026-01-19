/**
 * Test suite for ResultValidator
 * Uses console-based assertions (no test framework dependency)
 */

const { ResultValidator } = require('./result-validator');
const fs = require('fs').promises;
const path = require('path');

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('Running ResultValidator tests...\n');

  // Test 1: Structure validation on existing .planning/
  try {
    const validator = new ResultValidator('.planning');
    const result = await validator.validateStructure();
    
    if (result && typeof result.valid === 'boolean' && Array.isArray(result.errors)) {
      console.log('✅ Test 1: Structure validation returns correct format');
      console.log(`   Valid: ${result.valid}, Errors: ${result.errors.length}`);
      passed++;
    } else {
      console.log('❌ Test 1: Structure validation returned unexpected format');
      console.log('   Result:', result);
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 1: Structure validation threw error:', err.message);
    failed++;
  }

  // Test 2: Structure validation on missing directory
  try {
    const validator = new ResultValidator('/nonexistent-test-dir-xyz');
    const result = await validator.validateStructure();
    
    if (!result.valid && result.errors.length > 0) {
      console.log('✅ Test 2: Structure validation correctly detects missing directory');
      console.log(`   Errors found: ${result.errors.length}`);
      passed++;
    } else {
      console.log('❌ Test 2: Expected errors for missing directory but got valid=true or no errors');
      console.log('   Result:', result);
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 2: Validation threw error:', err.message);
    failed++;
  }

  // Test 3: JSON validation on valid file
  try {
    // Create temp JSON file
    const tempDir = '/tmp/validator-test-' + Date.now();
    await fs.mkdir(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'test.json');
    await fs.writeFile(tempFile, JSON.stringify({ test: true, data: [1, 2, 3] }, null, 2));
    
    const validator = new ResultValidator(tempDir);
    const result = await validator.validateJSON('test.json');
    
    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
    
    if (result.valid === true) {
      console.log('✅ Test 3: JSON validation passes for valid JSON file');
      passed++;
    } else {
      console.log('❌ Test 3: Expected valid=true for valid JSON');
      console.log('   Result:', result);
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 3: JSON validation test error:', err.message);
    failed++;
  }

  // Test 4: JSON validation on invalid file
  try {
    // Create temp file with malformed JSON
    const tempDir = '/tmp/validator-test-' + Date.now();
    await fs.mkdir(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, 'invalid.json');
    await fs.writeFile(tempFile, '{ invalid json missing bracket');
    
    const validator = new ResultValidator(tempDir);
    const result = await validator.validateJSON('invalid.json');
    
    // Cleanup
    await fs.unlink(tempFile);
    await fs.rmdir(tempDir);
    
    if (result.valid === false && result.error && result.error.includes('Invalid JSON')) {
      console.log('✅ Test 4: JSON validation detects malformed JSON');
      console.log(`   Error: ${result.error.substring(0, 60)}...`);
      passed++;
    } else {
      console.log('❌ Test 4: Expected validation to fail for malformed JSON');
      console.log('   Result:', result);
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 4: Malformed JSON test error:', err.message);
    failed++;
  }

  // Test 5: Agent output validation
  try {
    // Check if .planning/phases/04-agent-translation/ exists
    const phasePath = '.planning/phases/04-agent-translation';
    try {
      await fs.stat(phasePath);
      
      const validator = new ResultValidator('.planning');
      const result = await validator.validateAgentOutput('phases/04-agent-translation');
      
      if (result && typeof result.valid === 'boolean' && Array.isArray(result.errors) && Array.isArray(result.warnings)) {
        console.log('✅ Test 5: Agent output validation returns correct format');
        console.log(`   Valid: ${result.valid}, Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
        passed++;
      } else {
        console.log('❌ Test 5: Agent output validation returned unexpected format');
        console.log('   Result:', result);
        failed++;
      }
    } catch (statErr) {
      // Phase directory doesn't exist - test the error case
      const validator = new ResultValidator('.planning');
      const result = await validator.validateAgentOutput('phases/nonexistent-phase');
      
      if (!result.valid && result.errors.length > 0) {
        console.log('✅ Test 5: Agent output validation correctly handles missing phase');
        console.log(`   Errors: ${result.errors.length}`);
        passed++;
      } else {
        console.log('❌ Test 5: Expected errors for missing phase directory');
        console.log('   Result:', result);
        failed++;
      }
    }
  } catch (err) {
    console.log('❌ Test 5: Agent output validation error:', err.message);
    failed++;
  }

  // Test 6: validateAll() comprehensive check
  try {
    const validator = new ResultValidator('.planning');
    const result = await validator.validateAll();
    
    if (result && typeof result.valid === 'boolean' && 
        Array.isArray(result.structureErrors) && 
        Array.isArray(result.jsonErrors) &&
        Array.isArray(result.phaseErrors)) {
      console.log('✅ Test 6: validateAll() returns comprehensive results');
      console.log(`   Valid: ${result.valid}`);
      console.log(`   Structure errors: ${result.structureErrors.length}`);
      console.log(`   JSON errors: ${result.jsonErrors.length}`);
      console.log(`   Phase errors: ${result.phaseErrors.length}`);
      passed++;
    } else {
      console.log('❌ Test 6: validateAll() returned unexpected format');
      console.log('   Result:', result);
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 6: validateAll() error:', err.message);
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

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
