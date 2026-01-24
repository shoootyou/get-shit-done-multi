#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const stripAnsi = require('strip-ansi');
const diff = require('diff');

// Commands safe to run without affecting project state
const safeCommands = [
  'gsd-help',
  'gsd-verify-installation',
  'gsd-list-milestones',
  'gsd-whats-new',
  'gsd-list-phase-assumptions',
  'gsd-check-todos',
  // Added for expanded TEST-08 coverage (15 commands total)
  'gsd-progress',
  'gsd-pause-work',
  'gsd-resume-work',
  'gsd-archive-milestone',
  'gsd-restore-milestone',
  'gsd-audit-milestone',
  'gsd-complete-milestone',
  'gsd-update',
  'gsd-add-todo'
];

async function testRegression(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Regression Testing: ${platform}`);
  console.log('='.repeat(60));
  
  const testDir = path.join(__dirname, '..', 'test-environments', `${platform}-test`, 'get-shit-done');
  const results = [];
  
  for (const command of safeCommands) {
    console.log(`\n📋 Testing: ${command}`);
    
    try {
      // Note: This is a simplified regression test
      // Full implementation would need platform-specific invocation
      // and careful output comparison
      
      // For now, verify command exists in generated output
      const platformPaths = {
        copilot: '.github/copilot/skills',
        claude: '.claude/get-shit-done',
        codex: '.codex/skills'
      };
      
      const skillFile = path.join(testDir, platformPaths[platform], `${command}.md`);
      
      if (fs.existsSync(skillFile)) {
        console.log(`  ✅ Generated file exists`);
        
        const content = fs.readFileSync(skillFile, 'utf8');
        const hasName = content.includes(`name: ${command}`);
        const hasDescription = content.includes('description:');
        
        if (hasName && hasDescription) {
          console.log(`  ✅ File structure valid`);
          results.push({
            command,
            platform,
            success: true
          });
        } else {
          console.log(`  ❌ File structure invalid`);
          results.push({
            command,
            platform,
            success: false,
            error: 'Missing required fields'
          });
        }
      } else {
        console.log(`  ❌ Generated file not found`);
        results.push({
          command,
          platform,
          success: false,
          error: 'File not found'
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({
        command,
        platform,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🔍 Regression Testing Suite\n');
  console.log(`Testing ${safeCommands.length} safe commands across 3 platforms\n`);
  
  const platforms = ['copilot', 'claude', 'codex'];
  const allResults = [];
  
  for (const platform of platforms) {
    const results = await testRegression(platform);
    allResults.push(...results);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Regression Test Summary');
  console.log('='.repeat(60));
  
  const successCount = allResults.filter(r => r.success).length;
  const totalTests = allResults.length;
  
  console.log(`\n✅ Passed: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount < totalTests) {
    console.log('\nFailed tests:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.platform}/${r.command}: ${r.error}`);
    });
  }
  
  // Write results
  const resultsPath = path.join(__dirname, '..', 'test-environments', 'regression-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📄 Results written to: test-environments/regression-results.json`);
  
  if (successCount < totalTests) {
    process.exit(1);
  }
  
  console.log('\n✅ All regression tests passed!');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Regression test error:', err);
    process.exit(1);
  });
}

module.exports = { testRegression, safeCommands };
