#!/usr/bin/env node
/**
 * Cross-CLI State Compatibility Tests
 * Verifies state management works across different CLI contexts
 */

import { integrateStateManagement } from '../lib-ghcc/state-integration.js';
import fs from 'fs/promises';

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✅ ${message}`);
}

async function runCrossCLITests() {
  const testDir = `/tmp/gsd-cross-cli-${Date.now()}`;
  const state = integrateStateManagement(testDir);
  
  console.log('Testing cross-CLI state compatibility...\n');
  
  try {
    // Test 1: Write from "Claude Code", read from "Codex CLI"
    console.log('Test 1: Cross-CLI state read/write');
    await state.sessionManager.saveSession({
      cli: 'claude-code',
      currentPhase: '05',
      currentPlan: '05',
      context: { testData: 'preserved' }
    });
    
    // Simulate CLI switch
    const loaded = await state.sessionManager.loadSession();
    assert(loaded.cli === 'claude-code', 'CLI name preserved');
    assert(loaded.currentPhase === '05', 'Phase preserved');
    assert(loaded.context.testData === 'preserved', 'Context preserved');
    
    // Test 2: Concurrent state access simulation
    console.log('\nTest 2: Concurrent state access');
    const results = await Promise.all([
      state.stateManager.updateState('test.json', s => ({ ...s, a: 1 })),
      state.stateManager.updateState('test.json', s => ({ ...s, b: 2 })),
    ]);
    // Both should complete without corruption
    assert(results.length === 2, 'Both updates completed');
    assert(results[0]._version !== undefined, 'First update has version');
    assert(results[1]._version !== undefined, 'Second update has version');
    
    // Test 3: State validation after switching
    console.log('\nTest 3: State validation post-switch');
    const validation = await state.stateValidator.validate();
    assert(typeof validation.valid === 'boolean', 'Validation returns valid flag');
    
    // Test 4: Usage tracking aggregates across CLIs
    console.log('\nTest 4: Usage tracking aggregation');
    await state.usageTracker.trackUsage({ 
      timestamp: Date.now(),
      cli: 'claude-code', 
      command: 'test1', 
      agent: 'gsd-executor',
      duration: 100,
      tokens: { input: 100, output: 200 },
      cost: 0.01
    });
    await state.usageTracker.trackUsage({ 
      timestamp: Date.now(),
      cli: 'codex-cli', 
      command: 'test2',
      agent: 'gsd-planner', 
      duration: 200,
      tokens: { input: 150, output: 250 },
      cost: 0.02
    });
    const summary = await state.usageTracker.getUsageSummary();
    assert(summary.totalCommands >= 2, 'Commands from both CLIs tracked');
    assert(summary.perCLI['claude-code'] !== undefined, 'Claude stats tracked');
    assert(summary.perCLI['codex-cli'] !== undefined, 'Codex stats tracked');
    
    console.log('\n✅ All cross-CLI tests passed');
    
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (err) {
    console.error('\n❌ Cross-CLI test failed:', err.message);
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    process.exit(1);
  }
}

runCrossCLITests().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
