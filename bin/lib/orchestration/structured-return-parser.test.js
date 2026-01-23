/**
 * Unit tests for structured-return-parser.js
 * 
 * Tests parsing of agent markdown returns with structured status blocks
 */

const assert = require('assert');
const parser = require('./structured-return-parser');

async function runTests() {
  console.log('Testing structured-return-parser...\n');
  
  let testCount = 0;
  
  // Test 1: Valid RESEARCH COMPLETE block
  testCount++;
  console.log(`Test ${testCount}: Valid RESEARCH COMPLETE block`);
  const researchComplete = `## RESEARCH COMPLETE

**Phase:** 1 - Foundation
**Confidence:** HIGH

Research findings documented in RESEARCH.md.`;
  
  const result1 = parser.parseStructuredReturn(researchComplete);
  assert.strictEqual(result1.status, 'research_complete', 'Status should be research_complete');
  assert.ok(result1.content.includes('Phase:'), 'Content should include phase info');
  assert.ok(result1.content.includes('Confidence:'), 'Content should include confidence');
  assert.strictEqual(result1.raw, researchComplete, 'Raw should match input');
  console.log('  ✓ Passed\n');
  
  // Test 2: Valid PLAN COMPLETE block
  testCount++;
  console.log(`Test ${testCount}: Valid PLAN COMPLETE block`);
  const planComplete = `## PLAN COMPLETE

**Plan:** 01-01-PLAN.md
**Tasks:** 3

Ready for execution.`;
  
  const result2 = parser.parseStructuredReturn(planComplete);
  assert.strictEqual(result2.status, 'plan_complete', 'Status should be plan_complete');
  assert.ok(result2.content.includes('Plan:'), 'Content should include plan info');
  console.log('  ✓ Passed\n');
  
  // Test 3: Valid EXECUTION COMPLETE block
  testCount++;
  console.log(`Test ${testCount}: Valid EXECUTION COMPLETE block`);
  const executionComplete = `## EXECUTION COMPLETE

**Tasks:** 3/3
**Duration:** 5.2 minutes

All tasks completed successfully.`;
  
  const result3 = parser.parseStructuredReturn(executionComplete);
  assert.strictEqual(result3.status, 'execution_complete', 'Status should be execution_complete');
  assert.ok(result3.content.includes('Tasks:'), 'Content should include tasks info');
  console.log('  ✓ Passed\n');
  
  // Test 4: Valid RESEARCH BLOCKED block
  testCount++;
  console.log(`Test ${testCount}: Valid RESEARCH BLOCKED block`);
  const researchBlocked = `## RESEARCH BLOCKED

**Blocker:** Missing dependencies

Cannot proceed without package.json.`;
  
  const result4 = parser.parseStructuredReturn(researchBlocked);
  assert.strictEqual(result4.status, 'research_blocked', 'Status should be research_blocked');
  assert.ok(result4.content.includes('Blocker:'), 'Content should include blocker info');
  console.log('  ✓ Passed\n');
  
  // Test 5: Valid CHECKPOINT REACHED block
  testCount++;
  console.log(`Test ${testCount}: Valid CHECKPOINT REACHED block`);
  const checkpointReached = `## CHECKPOINT REACHED

**Type:** human-verify
**Status:** Awaiting approval

Please review the changes.`;
  
  const result5 = parser.parseStructuredReturn(checkpointReached);
  assert.strictEqual(result5.status, 'checkpoint_reached', 'Status should be checkpoint_reached');
  assert.ok(result5.content.includes('Type:'), 'Content should include type info');
  console.log('  ✓ Passed\n');
  
  // Test 6: Malformed markdown (no header)
  testCount++;
  console.log(`Test ${testCount}: Malformed markdown (no header)`);
  const malformed = 'No structured header here\nJust some text';
  
  const result6 = parser.parseStructuredReturn(malformed);
  assert.strictEqual(result6.status, 'unknown', 'Status should be unknown for malformed input');
  assert.strictEqual(result6.content, malformed, 'Content should be entire input');
  console.log('  ✓ Passed\n');
  
  // Test 7: Multiple headers (uses first match)
  testCount++;
  console.log(`Test ${testCount}: Multiple headers (uses first match)`);
  const multiHeader = `## RESEARCH COMPLETE

First section content

## PLAN COMPLETE

Second section content`;
  
  const result7 = parser.parseStructuredReturn(multiHeader);
  assert.strictEqual(result7.status, 'research_complete', 'Should use first matching header');
  assert.ok(result7.content.includes('First section'), 'Content should be from first section');
  assert.ok(!result7.content.includes('Second section'), 'Should not include second section');
  console.log('  ✓ Passed\n');
  
  // Test 8: Empty content after header
  testCount++;
  console.log(`Test ${testCount}: Empty content after header`);
  const emptyContent = `## EXECUTION COMPLETE

## Another Section`;
  
  const result8 = parser.parseStructuredReturn(emptyContent);
  assert.strictEqual(result8.status, 'execution_complete', 'Status should be execution_complete');
  assert.strictEqual(result8.content, '', 'Content should be empty string');
  console.log('  ✓ Passed\n');
  
  // Test 9: Header at end of string
  testCount++;
  console.log(`Test ${testCount}: Header at end of string`);
  const headerAtEnd = `Some preamble text

## PLAN COMPLETE`;
  
  const result9 = parser.parseStructuredReturn(headerAtEnd);
  assert.strictEqual(result9.status, 'plan_complete', 'Should find header at end');
  assert.strictEqual(result9.content, '', 'Content should be empty at end of string');
  console.log('  ✓ Passed\n');
  
  // Test 10: hasStructuredReturn utility
  testCount++;
  console.log(`Test ${testCount}: hasStructuredReturn utility`);
  const hasValid = parser.hasStructuredReturn('## RESEARCH COMPLETE\n\nContent');
  const hasInvalid = parser.hasStructuredReturn('No structured return');
  
  assert.strictEqual(hasValid, true, 'Should detect valid structured return');
  assert.strictEqual(hasInvalid, false, 'Should not detect in plain text');
  console.log('  ✓ Passed\n');
  
  // Test 11: extractAllStructuredReturns with multiple blocks
  testCount++;
  console.log(`Test ${testCount}: extractAllStructuredReturns with multiple blocks`);
  const multiBlock = `## RESEARCH COMPLETE

Research data

## PLAN COMPLETE

Plan data

## EXECUTION COMPLETE

Execution data`;
  
  const results = parser.extractAllStructuredReturns(multiBlock);
  assert.strictEqual(results.length, 3, 'Should extract all 3 blocks');
  assert.strictEqual(results[0].status, 'research_complete', 'First should be research_complete');
  assert.strictEqual(results[1].status, 'plan_complete', 'Second should be plan_complete');
  assert.strictEqual(results[2].status, 'execution_complete', 'Third should be execution_complete');
  console.log('  ✓ Passed\n');
  
  // Test 12: Null/undefined input handling
  testCount++;
  console.log(`Test ${testCount}: Null/undefined input handling`);
  const resultNull = parser.parseStructuredReturn(null);
  const resultUndef = parser.parseStructuredReturn(undefined);
  
  assert.strictEqual(resultNull.status, 'unknown', 'Null should return unknown status');
  assert.strictEqual(resultUndef.status, 'unknown', 'Undefined should return unknown status');
  console.log('  ✓ Passed\n');
  
  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`✓ All ${testCount} tests passed`);
  console.log('structured-return-parser.js is working correctly');
}

// Run tests
runTests().catch(err => {
  console.error('\n✗ Test failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
