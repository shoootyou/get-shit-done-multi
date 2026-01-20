/**
 * Performance Tracker Tests
 * 
 * Simple console-based tests for PerformanceTracker class.
 * No test framework dependency (zero npm dependencies goal).
 */

const { PerformanceTracker } = require('./performance-tracker');
const fs = require('fs').promises;
const path = require('path');

// Test utilities
function assert(condition, message) {
  if (condition) {
    console.log('✅', message);
    return true;
  } else {
    console.log('❌', message);
    return false;
  }
}

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  const withinTolerance = diff <= tolerance;
  if (withinTolerance) {
    console.log('✅', message, `(${actual.toFixed(2)}ms ≈ ${expected}ms ± ${tolerance}ms)`);
  } else {
    console.log('❌', message, `(${actual.toFixed(2)}ms not close to ${expected}ms ± ${tolerance}ms)`);
  }
  return withinTolerance;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test suite
async function runTests() {
  console.log('\n=== Performance Tracker Tests ===\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Tracker instantiation
  console.log('Test 1: Tracker instantiation');
  try {
    const testFile = '.planning/metrics/test-tracker.json';
    const tracker = new PerformanceTracker(testFile);
    
    if (assert(tracker.metricsFile === testFile, 'metricsFile set correctly')) testsPassed++;
    else testsFailed++;
    
    if (assert(tracker.metrics instanceof Map, 'metrics Map exists')) testsPassed++;
    else testsFailed++;
    
    if (assert(typeof tracker.startAgent === 'function', 'startAgent method exists')) testsPassed++;
    else testsFailed++;
    
    if (assert(typeof tracker.endAgent === 'function', 'endAgent method exists')) testsPassed++;
    else testsFailed++;
    
    if (assert(typeof tracker.getAverageTime === 'function', 'getAverageTime method exists')) testsPassed++;
    else testsFailed++;
    
    tracker.dispose();
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
    testsFailed += 5;
  }
  
  // Test 2: Start and end tracking
  console.log('\nTest 2: Start and end tracking');
  try {
    const tracker = new PerformanceTracker('.planning/metrics/test-tracker2.json');
    
    const startMark = tracker.startAgent('test-agent', 'claude');
    await sleep(50); // Simulate work
    const duration = await tracker.endAgent('test-agent', 'claude', startMark);
    
    if (assertClose(duration, 50, 15, 'duration close to 50ms')) testsPassed++;
    else testsFailed++;
    
    if (assert(duration > 0, 'duration is positive')) testsPassed++;
    else testsFailed++;
    
    tracker.dispose();
  } catch (error) {
    console.log('❌ Test 2 failed:', error.message);
    testsFailed += 2;
  }
  
  // Test 3: Average calculation
  console.log('\nTest 3: Average calculation');
  try {
    const tracker = new PerformanceTracker('.planning/metrics/test-tracker3.json');
    
    // Track same agent 3 times
    let mark1 = tracker.startAgent('avg-agent', 'claude');
    await sleep(30);
    await tracker.endAgent('avg-agent', 'claude', mark1);
    
    let mark2 = tracker.startAgent('avg-agent', 'claude');
    await sleep(40);
    await tracker.endAgent('avg-agent', 'claude', mark2);
    
    let mark3 = tracker.startAgent('avg-agent', 'claude');
    await sleep(50);
    await tracker.endAgent('avg-agent', 'claude', mark3);
    
    // Wait for observer to collect metrics
    await sleep(100);
    
    const average = tracker.getAverageTime('avg-agent', 'claude');
    
    if (assert(average !== null, 'average is not null')) testsPassed++;
    else testsFailed++;
    
    if (assertClose(average, 40, 20, 'average close to 40ms')) testsPassed++;
    else testsFailed++;
    
    // Test non-existent agent
    const noAvg = tracker.getAverageTime('no-agent', 'claude');
    if (assert(noAvg === null, 'non-existent agent returns null')) testsPassed++;
    else testsFailed++;
    
    tracker.dispose();
  } catch (error) {
    console.log('❌ Test 3 failed:', error.message);
    testsFailed += 3;
  }
  
  // Test 4: Metric persistence
  console.log('\nTest 4: Metric persistence');
  try {
    const testFile = '.planning/metrics/test-tracker4.json';
    const tracker = new PerformanceTracker(testFile);
    
    const mark = tracker.startAgent('persist-agent', 'copilot');
    await sleep(25);
    await tracker.endAgent('persist-agent', 'copilot', mark);
    
    // Wait for async file write
    await sleep(100);
    
    // Read file directly
    const data = await fs.readFile(testFile, 'utf8');
    const metrics = JSON.parse(data);
    
    if (assert(Array.isArray(metrics), 'metrics is array')) testsPassed++;
    else testsFailed++;
    
    if (assert(metrics.length > 0, 'metrics array not empty')) testsPassed++;
    else testsFailed++;
    
    if (metrics.length > 0) {
      const metric = metrics[0];
      if (assert(metric.agent === 'persist-agent', 'agent name correct')) testsPassed++;
      else testsFailed++;
      
      if (assert(metric.cli === 'copilot', 'CLI name correct')) testsPassed++;
      else testsFailed++;
      
      if (assert(typeof metric.duration === 'number', 'duration is number')) testsPassed++;
      else testsFailed++;
      
      if (assert(typeof metric.timestamp === 'string', 'timestamp is string')) testsPassed++;
      else testsFailed++;
    } else {
      testsFailed += 4;
    }
    
    tracker.dispose();
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
    testsFailed += 6;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${testsPassed + testsFailed} tests`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
