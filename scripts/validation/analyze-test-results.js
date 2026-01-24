#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadResults() {
  const resultsDir = path.join(__dirname, '..', 'test-environments');
  
  const files = {
    install: path.join(resultsDir, 'install-results.json'),
    manual: path.join(resultsDir, 'test-results.json'),
    regression: path.join(resultsDir, 'regression-results.json')
  };
  
  const results = {};
  
  for (const [key, file] of Object.entries(files)) {
    if (fs.existsSync(file)) {
      try {
        results[key] = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (error) {
        console.warn(`⚠️  Failed to load ${key} results: ${error.message}`);
        results[key] = null;
      }
    } else {
      console.warn(`⚠️  ${key} results file not found: ${file}`);
      results[key] = null;
    }
  }
  
  return results;
}

function analyzeNpmInstallResults(installResults) {
  if (!installResults || !Array.isArray(installResults)) {
    return {
      totalPlatforms: 0,
      successfulPlatforms: 0,
      totalCommands: 0,
      successfulCommands: 0,
      failures: []
    };
  }
  
  const analysis = {
    totalPlatforms: installResults.length,
    successfulPlatforms: 0,
    totalCommands: 0,
    successfulCommands: 0,
    failures: [],
    platformDetails: []
  };
  
  for (const result of installResults) {
    const platformDetail = {
      platform: result.platform,
      success: result.success,
      commandsGenerated: result.skillsGenerated || 0,
      errors: result.errors || []
    };
    
    analysis.platformDetails.push(platformDetail);
    
    if (result.success) {
      analysis.successfulPlatforms++;
      analysis.successfulCommands += (result.skillsGenerated || 0);
    } else {
      analysis.failures.push({
        platform: result.platform,
        type: 'npm_install_failure',
        severity: 'P0',
        error: result.error || result.errors?.join('; ') || 'Unknown error',
        commands: result.skillsGenerated || 0
      });
    }
    
    analysis.totalCommands += (result.skillsGenerated || 0);
  }
  
  return analysis;
}

function analyzeManualTestResults(manualResults) {
  if (!manualResults || typeof manualResults !== 'object') {
    return {
      totalTested: 0,
      totalPassed: 0,
      totalFailed: 0,
      failures: [],
      platformDetails: []
    };
  }
  
  const analysis = {
    totalTested: 0,
    totalPassed: 0,
    totalFailed: 0,
    failures: [],
    platformDetails: []
  };
  
  for (const [platform, data] of Object.entries(manualResults)) {
    if (typeof data !== 'object') continue;
    
    const tested = data.tested || 0;
    const passed = data.passed || 0;
    const failed = data.failed || 0;
    
    analysis.totalTested += tested;
    analysis.totalPassed += passed;
    analysis.totalFailed += failed;
    
    analysis.platformDetails.push({
      platform,
      tested,
      passed,
      failed
    });
    
    if (data.failures && Array.isArray(data.failures)) {
      for (const failure of data.failures) {
        analysis.failures.push({
          platform,
          type: 'command_execution_failure',
          severity: triageSeverity(failure),
          command: failure.command,
          issue: failure.issue,
          expected: failure.expected,
          actual: failure.actual
        });
      }
    }
  }
  
  return analysis;
}

function triageSeverity(failure) {
  // P0 (blocking): Commands don't work, installation fails, core features broken
  // P1 (non-blocking): Cosmetic issues, minor differences, edge cases
  
  const p0Keywords = [
    'not found', 'cannot find', 'undefined', 'null', 'crash',
    'error', 'fail', 'broken', 'missing', 'does not work'
  ];
  
  const issueText = (failure.issue || '').toLowerCase();
  
  for (const keyword of p0Keywords) {
    if (issueText.includes(keyword)) {
      return 'P0';
    }
  }
  
  return 'P1';
}

function calculateMetrics(installAnalysis, manualAnalysis) {
  const metrics = {
    npmInstallation: {
      rate: installAnalysis.totalPlatforms > 0 
        ? (installAnalysis.successfulPlatforms / installAnalysis.totalPlatforms * 100).toFixed(1)
        : '0.0',
      successful: installAnalysis.successfulPlatforms,
      total: installAnalysis.totalPlatforms
    },
    commandGeneration: {
      rate: (installAnalysis.successfulCommands / 87 * 100).toFixed(1),
      successful: installAnalysis.successfulCommands,
      total: 87
    },
    commandExecution: {
      rate: manualAnalysis.totalTested > 0
        ? (manualAnalysis.totalPassed / manualAnalysis.totalTested * 100).toFixed(1)
        : 'N/A',
      passed: manualAnalysis.totalPassed,
      tested: manualAnalysis.totalTested
    },
    overall: {
      success: installAnalysis.successfulPlatforms === 3 && manualAnalysis.totalFailed === 0,
      grade: calculateGrade(installAnalysis, manualAnalysis)
    }
  };
  
  return metrics;
}

function calculateGrade(installAnalysis, manualAnalysis) {
  const installRate = installAnalysis.totalPlatforms > 0 
    ? (installAnalysis.successfulPlatforms / installAnalysis.totalPlatforms)
    : 0;
  
  const commandRate = installAnalysis.successfulCommands / 87;
  
  const manualRate = manualAnalysis.totalTested > 0
    ? (manualAnalysis.totalPassed / manualAnalysis.totalTested)
    : 1;
  
  const overall = (installRate * 0.4) + (commandRate * 0.3) + (manualRate * 0.3);
  
  if (overall >= 0.95) return 'A';
  if (overall >= 0.85) return 'B';
  if (overall >= 0.75) return 'C';
  if (overall >= 0.65) return 'D';
  return 'F';
}

function generateReport(installAnalysis, manualAnalysis, metrics) {
  console.log('\n' + '='.repeat(70));
  console.log('NPM INSTALLATION TEST RESULTS ANALYSIS');
  console.log('='.repeat(70));
  
  console.log('\n📊 METRICS:');
  console.log(`  npm Installation: ${metrics.npmInstallation.successful}/${metrics.npmInstallation.total} platforms (${metrics.npmInstallation.rate}%)`);
  console.log(`  Command Generation: ${metrics.commandGeneration.successful}/${metrics.commandGeneration.total} commands (${metrics.commandGeneration.rate}%)`);
  console.log(`  Command Execution: ${metrics.commandExecution.passed}/${metrics.commandExecution.tested} tested (${metrics.commandExecution.rate}%)`);
  console.log(`  Overall Grade: ${metrics.overall.grade}`);
  
  console.log('\n📦 NPM INSTALLATION DETAILS:');
  for (const detail of installAnalysis.platformDetails) {
    const status = detail.success ? '✅' : '❌';
    console.log(`  ${status} ${detail.platform}: ${detail.commandsGenerated}/29 commands`);
    if (detail.errors.length > 0) {
      detail.errors.forEach(err => console.log(`      - ${err}`));
    }
  }
  
  if (manualAnalysis.platformDetails.length > 0) {
    console.log('\n🧪 MANUAL TESTING DETAILS:');
    for (const detail of manualAnalysis.platformDetails) {
      console.log(`  ${detail.platform}: ${detail.passed}/${detail.tested} passed`);
    }
  }
  
  const allFailures = [...installAnalysis.failures, ...manualAnalysis.failures];
  const p0Failures = allFailures.filter(f => f.severity === 'P0');
  const p1Failures = allFailures.filter(f => f.severity === 'P1');
  
  if (allFailures.length > 0) {
    console.log('\n❌ FAILURES:');
    console.log(`  P0 (Blocking): ${p0Failures.length}`);
    console.log(`  P1 (Non-blocking): ${p1Failures.length}`);
    
    if (p0Failures.length > 0) {
      console.log('\n  P0 Failures:');
      p0Failures.forEach((f, i) => {
        console.log(`    ${i + 1}. [${f.platform}] ${f.type}`);
        console.log(`       ${f.error || f.issue}`);
      });
    }
    
    if (p1Failures.length > 0) {
      console.log('\n  P1 Failures:');
      p1Failures.forEach((f, i) => {
        console.log(`    ${i + 1}. [${f.platform}] ${f.command || f.type}`);
        console.log(`       ${f.issue}`);
      });
    }
  } else {
    console.log('\n✅ NO FAILURES - All tests passed!');
  }
  
  console.log('\n' + '='.repeat(70));
  
  return {
    metrics,
    installAnalysis,
    manualAnalysis,
    failures: allFailures,
    p0Failures,
    p1Failures,
    needsPhase71: p0Failures.length > 0
  };
}

async function main() {
  console.log('🔍 Analyzing npm installation test results...\n');
  
  const results = loadResults();
  
  if (!results.install) {
    console.error('❌ No installation results found. Run: node scripts/test-npm-install.js');
    process.exit(1);
  }
  
  const installAnalysis = analyzeNpmInstallResults(results.install);
  const manualAnalysis = analyzeManualTestResults(results.manual);
  const metrics = calculateMetrics(installAnalysis, manualAnalysis);
  
  const report = generateReport(installAnalysis, manualAnalysis, metrics);
  
  // Write analysis to file
  const analysisPath = path.join(__dirname, '..', 'test-environments', 'analysis-results.json');
  fs.writeFileSync(analysisPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Analysis written to: test-environments/analysis-results.json`);
  
  if (report.needsPhase71) {
    console.log('\n⚠️  P0 failures detected. Phase 7.1 gap closure required.');
  } else {
    console.log('\n✅ Phase 7 complete! Ready to proceed.');
  }
  
  return report;
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Analysis failed:', err.message);
    process.exit(1);
  });
}

module.exports = { 
  analyzeNpmInstallResults, 
  analyzeManualTestResults,
  calculateMetrics,
  triageSeverity
};
