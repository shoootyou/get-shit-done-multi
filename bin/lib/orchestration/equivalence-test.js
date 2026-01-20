/**
 * equivalence-test.js
 * 
 * Cross-CLI equivalence testing for agent invocation.
 * Verifies that same inputs produce same outputs across Claude, Copilot, and Codex.
 * 
 * Satisfies AGENT-04 requirement: Agent results must be equivalent across CLIs.
 * 
 * Equivalence testing with real CLIs:
 * - Success: Same agent on different CLIs produces semantically equivalent outputs
 * - Partial: Some CLIs succeed, others fail (CLI availability/config issues)
 * - Failure: Different outputs from same agent (indicates adapter bugs)
 */

const { invokeAgent } = require('./agent-invoker');
const { AgentRegistry } = require('./agent-registry');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);

/**
 * Test equivalence of agent outputs across CLIs
 * 
 * @param {string} agentName - Name of agent to test
 * @param {string} testPrompt - Prompt to send to agent
 * @param {string[]} clis - CLIs to test (default: all three)
 * @returns {Promise<{equivalent: boolean, results: object, differences: string[]}>}
 */
async function testEquivalence(agentName, testPrompt, clis = ['claude', 'copilot', 'codex']) {
  const results = {};
  const differences = [];

  console.log(`\nTesting equivalence for agent: ${agentName}`);
  console.log(`Prompt: "${testPrompt.substring(0, 60)}..."`);
  console.log(`CLIs: ${clis.join(', ')}`);

  // Invoke agent on each CLI
  for (const cli of clis) {
    try {
      const result = await invokeAgent(agentName, testPrompt, { mockCli: cli });
      results[cli] = result;
      
      // Check if invocation succeeded
      if (result.success) {
        console.log(`  ${cli}: ✅ (${result.duration}ms)`);
      } else {
        console.log(`  ${cli}: ❌ ${result.error || 'Invocation failed'}`);
        // Log stderr if available for debugging
        if (result.stderr) {
          console.log(`       stderr: ${result.stderr.substring(0, 100)}...`);
        }
      }
    } catch (err) {
      results[cli] = {
        success: false,
        error: err.message,
        duration: 0
      };
      console.log(`  ${cli}: ❌ Error: ${err.message}`);
    }
  }

  // Compare results for equivalence
  const successfulResults = Object.entries(results).filter(([_, r]) => r.success);
  
  if (successfulResults.length < 2) {
    differences.push('Insufficient successful results to compare (need at least 2)');
    return { equivalent: false, results, differences };
  }

  // Extract result content for comparison
  const resultContents = successfulResults.map(([cli, r]) => ({
    cli,
    content: typeof r.result === 'string' ? r.result : JSON.stringify(r.result)
  }));

  // Compare each pair
  for (let i = 0; i < resultContents.length - 1; i++) {
    const a = resultContents[i];
    const b = resultContents[i + 1];
    
    // Exact match
    if (a.content === b.content) {
      console.log(`  ✅ ${a.cli} === ${b.cli} (exact match)`);
      continue;
    }
    
    // Normalize whitespace and compare
    const aNorm = a.content.replace(/\s+/g, ' ').trim();
    const bNorm = b.content.replace(/\s+/g, ' ').trim();
    
    if (aNorm === bNorm) {
      console.log(`  ✅ ${a.cli} ≈ ${b.cli} (whitespace differences only)`);
      continue;
    }
    
    // Check structural similarity (for object results)
    try {
      const aObj = JSON.parse(a.content);
      const bObj = JSON.parse(b.content);
      
      const aKeys = Object.keys(aObj).sort();
      const bKeys = Object.keys(bObj).sort();
      
      if (JSON.stringify(aKeys) === JSON.stringify(bKeys)) {
        console.log(`  ⚠️  ${a.cli} ~ ${b.cli} (same structure, different values)`);
        differences.push(`${a.cli} and ${b.cli} have same structure but different values`);
      } else {
        console.log(`  ❌ ${a.cli} ≠ ${b.cli} (different structure)`);
        differences.push(`${a.cli} and ${b.cli} have different structures`);
      }
    } catch (parseErr) {
      // Not JSON, just different strings
      console.log(`  ❌ ${a.cli} ≠ ${b.cli} (content mismatch)`);
      differences.push(`${a.cli} and ${b.cli} have different content`);
    }
  }

  const equivalent = differences.length === 0;
  
  return {
    equivalent,
    results,
    differences
  };
}

/**
 * Run equivalence test suite
 * Tests common agent scenarios across CLIs
 * 
 * @returns {Promise<{total: number, passed: number, failed: number}>}
 */
async function runEquivalenceTests() {
  console.log('Running Cross-CLI Equivalence Tests');
  console.log('='.repeat(60));
  
  // Check which CLIs are available before testing
  const availableCLIs = [];
  
  console.log('\nChecking CLI availability...');
  
  // Check Claude CLI
  try {
    await execFileAsync('claude-code', ['--version'], { timeout: 5000 });
    availableCLIs.push('claude');
    console.log('  ✅ Claude CLI available');
  } catch (err) {
    console.log('  ⚠️  Claude CLI not available, skipping Claude tests');
  }
  
  // Check Copilot CLI (gh copilot)
  try {
    await execFileAsync('gh', ['copilot', '--version'], { timeout: 5000 });
    availableCLIs.push('copilot');
    console.log('  ✅ Copilot CLI available');
  } catch (err) {
    console.log('  ⚠️  Copilot CLI not available, skipping Copilot tests');
  }
  
  // Check Codex CLI
  try {
    await execFileAsync('codex', ['--version'], { timeout: 5000 });
    availableCLIs.push('codex');
    console.log('  ✅ Codex CLI available');
  } catch (err) {
    console.log('  ⚠️  Codex CLI not available, skipping Codex tests');
  }
  
  // Need at least 2 CLIs for equivalence testing
  if (availableCLIs.length < 2) {
    console.log('\n⚠️  Need at least 2 CLIs installed for equivalence testing');
    console.log(`   Available: ${availableCLIs.length > 0 ? availableCLIs.join(', ') : 'none'}`);
    console.log('   Install Claude CLI, GitHub CLI with copilot extension, or Codex CLI');
    return { success: false, reason: 'insufficient_clis', total: 0, passed: 0, failed: 0 };
  }
  
  console.log(`\nTesting with: ${availableCLIs.join(', ')}\n`);
  
  let total = 0;
  let passed = 0;
  let failed = 0;

  // Test 1: gsd-executor with simple prompt
  try {
    total++;
    console.log(`\nTest 1: gsd-executor agent`);
    
    const result = await testEquivalence(
      'gsd-executor',
      'Execute plan: .planning/phases/01-foundation/01-01-PLAN.md',
      availableCLIs
    );
    
    if (result.equivalent || result.differences.length === 0) {
      console.log('✅ Test 1: gsd-executor produces equivalent results');
      passed++;
    } else {
      console.log('❌ Test 1: gsd-executor results differ across CLIs');
      result.differences.forEach(d => console.log(`   - ${d}`));
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 1: Error:', err.message);
    failed++;
  }

  // Test 2: gsd-planner with phase description
  try {
    total++;
    console.log(`\nTest 2: gsd-planner agent`);
    
    const result = await testEquivalence(
      'gsd-planner',
      'Create plan for implementing authentication system with JWT tokens',
      availableCLIs
    );
    
    if (result.equivalent || result.differences.length === 0) {
      console.log('✅ Test 2: gsd-planner produces equivalent results');
      passed++;
    } else {
      console.log('❌ Test 2: gsd-planner results differ across CLIs');
      result.differences.forEach(d => console.log(`   - ${d}`));
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 2: Error:', err.message);
    failed++;
  }

  // Test 3: gsd-verifier with verification criteria
  try {
    total++;
    console.log(`\nTest 3: gsd-verifier agent`);
    
    const result = await testEquivalence(
      'gsd-verifier',
      'Verify phase goal: Authentication system is complete and secure',
      availableCLIs
    );
    
    if (result.equivalent || result.differences.length === 0) {
      console.log('✅ Test 3: gsd-verifier produces equivalent results');
      passed++;
    } else {
      console.log('❌ Test 3: gsd-verifier results differ across CLIs');
      result.differences.forEach(d => console.log(`   - ${d}`));
      failed++;
    }
  } catch (err) {
    console.log('❌ Test 3: Error:', err.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Equivalence Test Summary:');
  console.log(`  Total: ${total}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('='.repeat(60));

  console.log('\n✅ Tests now use real CLI adapters for cross-CLI comparison.\n');

  return { total, passed, failed, success: failed === 0 };
}

// Export functions
module.exports = { testEquivalence, runEquivalenceTests };

// Run if executed directly
if (require.main === module) {
  runEquivalenceTests()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('Equivalence test error:', err);
      process.exit(1);
    });
}
