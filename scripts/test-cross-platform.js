#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute test script and capture result
 * @param {string} scriptPath - Path to test script
 * @param {string} name - Test suite name
 * @returns {Promise<Object>} - { success, duration, output }
 */
function runTestSuite(scriptPath, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${name}`);
    console.log('='.repeat(60));
    
    const proc = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    proc.on('close', (exitCode) => {
      const duration = Date.now() - startTime;
      const success = exitCode === 0;
      
      resolve({ success, duration, exitCode });
    });
    
    proc.on('error', (err) => {
      console.error(`Failed to run ${name}: ${err.message}`);
      resolve({ success: false, duration: 0, exitCode: 1, error: err.message });
    });
  });
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Cross-Platform Testing & Validation Suite              ║
║                                                           ║
║   Validates template → agent → install → invoke           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
  
  const suites = [
    {
      name: 'Agent Generation Tests',
      script: path.join(__dirname, 'test-agent-generation.js'),
      description: 'Validates all 11 agents generate correctly for both platforms'
    },
    {
      name: 'Agent Installation Tests',
      script: path.join(__dirname, 'test-agent-installation.js'),
      description: 'Validates installation to correct platform directories'
    },
    {
      name: 'Agent Invocation Tests',
      script: path.join(__dirname, 'test-agent-invocation.js'),
      description: 'Validates agents respond via CLI (requires CLI installation)'
    }
  ];
  
  const results = [];
  let totalDuration = 0;
  
  for (const suite of suites) {
    console.log(`\n📋 ${suite.description}`);
    
    const result = await runTestSuite(suite.script, suite.name);
    results.push({ ...suite, ...result });
    totalDuration += result.duration;
  }
  
  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const duration = `${(result.duration / 1000).toFixed(2)}s`;
    console.log(`${status} - ${result.name} (${duration})`);
  }
  
  console.log('='.repeat(60));
  
  const totalPassed = results.filter(r => r.success).length;
  const totalFailed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal: ${results.length} suites`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  if (totalFailed > 0) {
    console.log(`\n⚠️  ${totalFailed} test suite(s) failed`);
    console.log('Review output above for details.\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All cross-platform tests passed!\n');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { main };
