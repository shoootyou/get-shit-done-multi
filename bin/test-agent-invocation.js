const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  invokeClaude,
  invokeCopilot,
  isClaudeAvailable,
  isCopilotAvailable
} = require('./lib/test-helpers/cli-invoker');

async function runTests() {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  
  console.log('=== Agent Invocation Smoke Tests ===\n');
  console.log('These tests invoke agents via CLI and validate responses.');
  console.log('Tests require actual CLI installations.\n');
  
  const claudeAvailable = isClaudeAvailable();
  const copilotAvailable = isCopilotAvailable();
  
  console.log('Claude CLI: ' + (claudeAvailable ? '✅ Available' : '❌ Not found'));
  console.log('Copilot CLI: ' + (copilotAvailable ? '✅ Available' : '❌ Not found') + '\n');
  
  if (!claudeAvailable && !copilotAvailable) {
    console.log('⚠️  No CLIs available - skipping all invocation tests');
    console.log('Install Claude CLI or Copilot CLI to run these tests.\n');
    process.exit(0);
  }
  
  // Test agents (subset for smoke tests)
  const testAgents = [
    { name: 'gsd-executor', prompt: 'List files in current directory' },
    { name: 'gsd-planner', prompt: 'What is your role?' }
  ];
  
  // Claude tests
  if (claudeAvailable) {
    console.log('--- Claude CLI Tests ---\n');
    
    for (const agent of testAgents) {
      try {
        console.log('Testing: ' + agent.name);
        
        const result = await invokeClaude(agent.name, agent.prompt, {
          timeout: 30000
        });
        
        // Validate response
        if (result.exitCode === 0) {
          console.log('  ✅ Agent responded (exit 0)');
          passed++;
        } else {
          console.log('  ❌ Agent failed (exit ' + result.exitCode + ')');
          if (result.stderr) {
            console.log('  Error: ' + result.stderr.slice(0, 100));
          }
          failed++;
        }
        
        // Check for tool usage indicators
        const usedTools = result.stdout.includes('bash') || 
                          result.stdout.includes('read') ||
                          result.stdout.includes('executing');
        
        if (usedTools) {
          console.log('  ✅ Tools used in response');
          passed++;
        } else {
          console.log('  ⚠️  No obvious tool usage (may be OK)');
          skipped++;
        }
        
        console.log('  Duration: ' + result.duration + 'ms\n');
        
      } catch (err) {
        console.log('  ❌ Invocation failed: ' + err.message + '\n');
        failed++;
      }
    }
  }
  
  // Copilot tests
  if (copilotAvailable) {
    console.log('--- Copilot CLI Tests ---\n');
    
    // Create temp test directory
    const testDir = path.join(os.tmpdir(), 'copilot-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'test.txt'), 'Hello from test file');
    
    for (const agent of testAgents) {
      try {
        console.log('Testing: ' + agent.name);
        
        const result = await invokeCopilot(agent.name, agent.prompt, {
          timeout: 30000,
          cwd: testDir
        });
        
        // Validate response
        if (result.exitCode === 0) {
          console.log('  ✅ Agent responded (exit 0)');
          passed++;
        } else {
          console.log('  ❌ Agent failed (exit ' + result.exitCode + ')');
          if (result.stderr) {
            console.log('  Error: ' + result.stderr.slice(0, 100));
          }
          failed++;
        }
        
        // Check for tool usage indicators
        const usedTools = result.stdout.includes('search') || 
                          result.stdout.includes('execute') ||
                          result.stdout.includes('edit');
        
        if (usedTools) {
          console.log('  ✅ Tools used in response');
          passed++;
        } else {
          console.log('  ⚠️  No obvious tool usage (may be OK)');
          skipped++;
        }
        
        console.log('  Duration: ' + result.duration + 'ms\n');
        
      } catch (err) {
        console.log('  ❌ Invocation failed: ' + err.message + '\n');
        failed++;
      }
    }
    
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  
  console.log('='.repeat(60));
  console.log('✅ Passed: ' + passed);
  console.log('❌ Failed: ' + failed);
  console.log('⚠️  Skipped: ' + skipped);
  console.log('='.repeat(60));
  
  if (!claudeAvailable && !copilotAvailable) {
    console.log('\n⚠️  Install CLIs to run full test suite');
    process.exit(0);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
