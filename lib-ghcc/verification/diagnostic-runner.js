/**
 * Diagnostic Test Runner - Executes tests and formats output
 * Runs diagnostic tests with pass/fail/warn status indicators
 * 
 * @module verification/diagnostic-runner
 */

/**
 * Run a collection of diagnostic tests
 * Executes tests sequentially and formats output with status icons
 * 
 * @param {DiagnosticTest[]} tests - Array of diagnostic test instances
 * @returns {Promise<{passed: number, failed: number, warned: number, results: Array}>}
 * @example
 * const tests = [
 *   new CLIInstalledTest('Claude Code', 'claude'),
 *   new CommandAvailableTest()
 * ];
 * const summary = await runDiagnostics(tests);
 * console.log(`✓ ${summary.passed} passed`);
 */
async function runDiagnostics(tests) {
  console.log('Running GSD installation diagnostics...\n');
  
  const results = [];
  let passed = 0;
  let failed = 0;
  let warned = 0;
  
  for (const test of tests) {
    console.log(`Checking: ${test.description}...`);
    
    try {
      const result = await test.run();
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        throw new Error('Test must return an object');
      }
      if (!['pass', 'fail', 'warn'].includes(result.status)) {
        throw new Error(`Invalid status: ${result.status}`);
      }
      
      // Track counts
      if (result.status === 'pass') passed++;
      else if (result.status === 'fail') failed++;
      else if (result.status === 'warn') warned++;
      
      // Store result
      results.push({
        test: test.name,
        status: result.status,
        message: result.message,
        fixes: result.fixes || []
      });
      
      // Pretty print result
      const icon = result.status === 'pass' ? '✓' : 
                   result.status === 'warn' ? '⚠' : '✗';
      console.log(`  ${icon} ${result.message}`);
      
      // Show fixes for failures and warnings
      if ((result.status === 'fail' || result.status === 'warn') && result.fixes && result.fixes.length > 0) {
        console.log('\n  Suggested fixes:');
        result.fixes.forEach((fix, idx) => {
          console.log(`    ${idx + 1}. ${fix}`);
        });
      }
      
      console.log(''); // Blank line between tests
      
    } catch (error) {
      // Test threw an error
      failed++;
      results.push({
        test: test.name,
        status: 'fail',
        message: `Test error: ${error.message}`,
        fixes: ['Report this issue at https://github.com/croonix/get-shit-done/issues']
      });
      
      console.log(`  ✗ Test error: ${error.message}\n`);
    }
  }
  
  return {
    passed,
    failed,
    warned,
    results
  };
}

module.exports = {
  runDiagnostics
};
