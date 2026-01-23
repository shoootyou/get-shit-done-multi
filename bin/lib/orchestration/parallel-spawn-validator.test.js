/**
 * Unit tests for parallel-spawn-validator.js
 * 
 * Tests validation of parallel agent spawning patterns
 */

const assert = require('assert');
const validator = require('./parallel-spawn-validator');

async function runTests() {
  console.log('Testing parallel-spawn-validator...\n');
  
  let testCount = 0;
  
  // Test 1: Module loads and exports functions
  testCount++;
  console.log(`Test ${testCount}: Module exports all required functions`);
  assert.strictEqual(typeof validator.validateParallelSpawning, 'function', 'Should export validateParallelSpawning');
  assert.strictEqual(typeof validator.measureExecutionTime, 'function', 'Should export measureExecutionTime');
  assert.strictEqual(typeof validator.calculateSequentialEstimate, 'function', 'Should export calculateSequentialEstimate');
  assert.strictEqual(typeof validator.detectSpawnedAgents, 'function', 'Should export detectSpawnedAgents');
  assert.strictEqual(typeof validator.validateParallelTiming, 'function', 'Should export validateParallelTiming');
  console.log('  ✓ Passed\n');
  
  // Test 2: measureExecutionTime measures duration
  testCount++;
  console.log(`Test ${testCount}: measureExecutionTime measures duration`);
  const result = await validator.measureExecutionTime(async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
    return 'test result';
  });
  
  assert.ok(result.duration >= 50, 'Duration should be at least 50ms');
  assert.ok(result.duration < 100, 'Duration should be less than 100ms');
  assert.strictEqual(result.result, 'test result', 'Should return function result');
  console.log(`  ✓ Passed (measured ${result.duration.toFixed(2)}ms)\n`);
  
  // Test 3: calculateSequentialEstimate sums durations
  testCount++;
  console.log(`Test ${testCount}: calculateSequentialEstimate sums durations`);
  const agentDurations = [
    { agent: 'agent1', duration: 100 },
    { agent: 'agent2', duration: 200 },
    { agent: 'agent3', duration: 150 }
  ];
  
  const estimate = validator.calculateSequentialEstimate(agentDurations);
  assert.strictEqual(estimate, 450, 'Should sum all durations');
  console.log('  ✓ Passed\n');
  
  // Test 4: detectSpawnedAgents extracts agent names from Task() patterns
  testCount++;
  console.log(`Test ${testCount}: detectSpawnedAgents extracts agent names`);
  const orchestratorOutput = `
Task(prompt="Research stack", subagent_type="gsd-project-researcher", description="Stack research")
Task(prompt="Research features", subagent_type="gsd-project-researcher", description="Features research")
Task(prompt="Research architecture", subagent_type="gsd-architecture-researcher", description="Architecture research")
`;
  
  const agents = validator.detectSpawnedAgents(orchestratorOutput);
  assert.strictEqual(agents.length, 2, 'Should detect 2 unique agents'); // 2 unique agent types
  assert.ok(agents.includes('gsd-project-researcher'), 'Should detect gsd-project-researcher');
  assert.ok(agents.includes('gsd-architecture-researcher'), 'Should detect gsd-architecture-researcher');
  console.log('  ✓ Passed\n');
  
  // Test 5: detectSpawnedAgents handles empty input
  testCount++;
  console.log(`Test ${testCount}: detectSpawnedAgents handles empty input`);
  const emptyAgents = validator.detectSpawnedAgents('');
  const nullAgents = validator.detectSpawnedAgents(null);
  
  assert.strictEqual(emptyAgents.length, 0, 'Empty string should return empty array');
  assert.strictEqual(nullAgents.length, 0, 'Null should return empty array');
  console.log('  ✓ Passed\n');
  
  // Test 6: validateParallelTiming detects parallel execution
  testCount++;
  console.log(`Test ${testCount}: validateParallelTiming detects parallel execution`);
  const parallelResult = validator.validateParallelTiming(100, 400, 0.7); // 100ms vs 400ms sequential
  
  assert.strictEqual(parallelResult.isParallel, true, 'Should detect parallel execution');
  assert.strictEqual(parallelResult.ratio, 0.25, 'Ratio should be 0.25');
  assert.ok(parallelResult.message.includes('parallel'), 'Message should mention parallel');
  console.log('  ✓ Passed\n');
  
  // Test 7: validateParallelTiming detects sequential execution
  testCount++;
  console.log(`Test ${testCount}: validateParallelTiming detects sequential execution`);
  const sequentialResult = validator.validateParallelTiming(350, 400, 0.7); // 350ms vs 400ms sequential
  
  assert.strictEqual(sequentialResult.isParallel, false, 'Should detect sequential execution');
  assert.ok(sequentialResult.message.includes('sequential'), 'Message should mention sequential');
  console.log('  ✓ Passed\n');
  
  // Test 8: validateParallelTiming handles no estimate
  testCount++;
  console.log(`Test ${testCount}: validateParallelTiming handles no estimate`);
  const noEstimate = validator.validateParallelTiming(100, 0, 0.7);
  
  assert.strictEqual(noEstimate.isParallel, null, 'Should return null when no estimate');
  assert.ok(noEstimate.message.includes('Cannot validate'), 'Message should explain no estimate');
  console.log('  ✓ Passed\n');
  
  // Test 9: validateParallelSpawning with successful parallel execution
  testCount++;
  console.log(`Test ${testCount}: validateParallelSpawning with successful parallel execution`);
  const mockParallelExec = async () => {
    // Simulate parallel execution (fast)
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      agents: ['agent1', 'agent2', 'agent3']
    };
  };
  
  const parallelValidation = await validator.validateParallelSpawning(mockParallelExec, {
    expectedAgents: ['agent1', 'agent2', 'agent3'],
    sequentialEstimate: 300, // Would take 300ms if sequential
    parallelThreshold: 0.7
  });
  
  assert.strictEqual(parallelValidation.success, true, 'Validation should succeed');
  assert.strictEqual(parallelValidation.parallel, true, 'Should detect parallel execution');
  assert.strictEqual(parallelValidation.agents.length, 3, 'Should detect all 3 agents');
  console.log(`  ✓ Passed (duration: ${parallelValidation.duration.toFixed(2)}ms)\n`);
  
  // Test 10: validateParallelSpawning with missing agents
  testCount++;
  console.log(`Test ${testCount}: validateParallelSpawning with missing agents`);
  const mockMissingAgents = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return {
      agents: ['agent1', 'agent2'] // Missing agent3
    };
  };
  
  const missingValidation = await validator.validateParallelSpawning(mockMissingAgents, {
    expectedAgents: ['agent1', 'agent2', 'agent3'],
    sequentialEstimate: 100
  });
  
  assert.strictEqual(missingValidation.success, false, 'Should fail with missing agents');
  assert.deepStrictEqual(missingValidation.missing, ['agent3'], 'Should identify missing agent');
  assert.ok(missingValidation.message.includes('Missing agents'), 'Message should mention missing agents');
  console.log('  ✓ Passed\n');
  
  // Test 11: validateParallelSpawning with execution error
  testCount++;
  console.log(`Test ${testCount}: validateParallelSpawning with execution error`);
  const mockError = async () => {
    throw new Error('Test execution error');
  };
  
  const errorValidation = await validator.validateParallelSpawning(mockError, {
    expectedAgents: ['agent1']
  });
  
  assert.strictEqual(errorValidation.success, false, 'Should fail on execution error');
  assert.ok(errorValidation.error, 'Should include error message');
  assert.ok(errorValidation.message.includes('Execution failed'), 'Message should mention failure');
  console.log('  ✓ Passed\n');
  
  // Test 12: validateParallelSpawning with sequential execution detection
  testCount++;
  console.log(`Test ${testCount}: validateParallelSpawning detects sequential execution`);
  const mockSequentialExec = async () => {
    // Simulate sequential execution (slow)
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      agents: ['agent1', 'agent2']
    };
  };
  
  const sequentialValidation = await validator.validateParallelSpawning(mockSequentialExec, {
    expectedAgents: ['agent1', 'agent2'],
    sequentialEstimate: 200, // Would take 200ms if sequential
    parallelThreshold: 0.7 // 150ms >= 140ms threshold
  });
  
  assert.strictEqual(sequentialValidation.success, false, 'Should fail for sequential execution');
  assert.strictEqual(sequentialValidation.parallel, false, 'Should detect sequential pattern');
  console.log(`  ✓ Passed (duration: ${sequentialValidation.duration.toFixed(2)}ms)\n`);
  
  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`✓ All ${testCount} tests passed`);
  console.log('parallel-spawn-validator.js is working correctly');
}

// Run tests
runTests().catch(err => {
  console.error('\n✗ Test failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
