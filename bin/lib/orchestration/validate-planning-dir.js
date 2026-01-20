#!/usr/bin/env node

/**
 * validate-planning-dir.js
 * 
 * User-facing validation tool for .planning/ directory structure.
 * Verifies directory is CLI-compatible before switching CLIs.
 */

const { ResultValidator } = require('./result-validator');
const fs = require('fs').promises;

async function main() {
  console.log('Validating .planning/ directory structure...\n');
  
  const validator = new ResultValidator('.planning');
  
  // Structure check
  console.log('📁 Directory Structure');
  console.log('─'.repeat(50));
  const structureResult = await validator.validateStructure();
  console.log(`Status: ${structureResult.valid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (structureResult.errors.length > 0) {
    console.log('\nErrors found:');
    structureResult.errors.forEach(e => console.log(`  ❌ ${e}`));
  } else {
    console.log('All required files and directories present');
  }
  
  // JSON validation
  console.log('\n📄 JSON Files');
  console.log('─'.repeat(50));
  const jsonFiles = ['config.json'];
  let jsonValid = true;
  
  for (const file of jsonFiles) {
    const result = await validator.validateJSON(file);
    console.log(`  ${file}: ${result.valid ? '✅' : '❌'}`);
    if (!result.valid) {
      console.log(`    ${result.error}`);
      jsonValid = false;
    }
  }
  
  if (jsonValid) {
    console.log('All JSON files are valid');
  }
  
  // Phase validation
  console.log('\n📦 Phase Directories');
  console.log('─'.repeat(50));
  
  try {
    const phases = await fs.readdir('.planning/phases');
    let phaseIssues = 0;
    
    for (const phase of phases) {
      if (phase.startsWith('.')) continue; // Skip hidden files
      
      const phaseStat = await fs.stat(`.planning/phases/${phase}`);
      if (!phaseStat.isDirectory()) continue;
      
      const result = await validator.validateAgentOutput(`phases/${phase}`);
      
      if (result.valid && result.warnings.length === 0) {
        console.log(`  ${phase}: ✅`);
      } else if (result.valid && result.warnings.length > 0) {
        console.log(`  ${phase}: ⚠️  (${result.warnings.length} warnings)`);
        result.warnings.forEach(w => console.log(`    ⚠️  ${w}`));
      } else {
        console.log(`  ${phase}: ❌ (${result.errors.length} errors)`);
        result.errors.forEach(e => console.log(`    ❌ ${e}`));
        phaseIssues++;
      }
    }
    
    if (phaseIssues === 0) {
      console.log('\nAll phase directories validated');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('  No phases directory found (project may be in initial setup)');
    } else {
      console.log(`  Error reading phases: ${err.message}`);
    }
  }
  
  // Overall summary
  console.log('\n' + '='.repeat(50));
  
  const overallValid = structureResult.valid && jsonValid;
  
  if (overallValid) {
    console.log('✅ Validation complete - .planning/ structure is CLI-compatible');
    console.log('\nYou can safely switch between Claude, Copilot, and Codex CLIs.');
  } else {
    console.log('❌ Validation found issues - .planning/ structure needs fixes');
    console.log('\nFix the errors above before switching CLIs.');
  }
  
  console.log('='.repeat(50));
  
  // Exit with error code if validation failed
  process.exit(overallValid ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Validation failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
