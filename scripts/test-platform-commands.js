#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of 29 GSD commands to test
const commands = [
  // High complexity (3)
  'gsd-new-project',
  'gsd-execute-phase',
  'gsd-new-milestone',
  
  // Medium complexity (4)
  'gsd-plan-phase',
  'gsd-research-phase',
  'gsd-debug',
  'gsd-map-codebase',
  
  // Simple commands (22)
  'gsd-help',
  'gsd-progress',
  'gsd-verify-work',
  'gsd-discuss-phase',
  'gsd-pause-work',
  'gsd-resume-work',
  'gsd-add-phase',
  'gsd-insert-phase',
  'gsd-remove-phase',
  'gsd-add-todo',
  'gsd-check-todos',
  'gsd-complete-milestone',
  'gsd-audit-milestone',
  'gsd-plan-milestone-gaps',
  'gsd-archive-milestone',
  'gsd-restore-milestone',
  'gsd-list-milestones',
  'gsd-list-phase-assumptions',
  'gsd-verify-installation',
  'gsd-whats-new',
  'gsd-update'
];

async function testPlatformCommands(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Manual Command Testing: ${platform}`);
  console.log('='.repeat(60));
  console.log();
  console.log(`Test environment: test-environments/${platform}-test/get-shit-done`);
  console.log();
  console.log('Instructions:');
  console.log('1. Open terminal in test environment');
  console.log('2. Test each command below');
  console.log('3. Verify command is discovered and executes');
  console.log('4. Note any failures or unexpected behavior');
  console.log();
  console.log('Platform-specific invocation:');
  
  if (platform === 'copilot') {
    console.log('  GitHub Copilot: Type command name, press Tab for autocomplete');
  } else if (platform === 'claude') {
    console.log('  Claude Code: Type /gsd- and use autocomplete');
  } else if (platform === 'codex') {
    console.log('  Codex CLI: Type $gsd- and use autocomplete');
  }
  
  console.log();
  console.log('Commands to test:');
  console.log('-'.repeat(60));
  
  commands.forEach((cmd, idx) => {
    console.log(`${idx + 1}. ${cmd}`);
  });
  
  console.log();
  console.log('Expected behavior:');
  console.log('- Command appears in autocomplete');
  console.log('- Help text displays correctly');
  console.log('- Command executes (even if requires args/context)');
  console.log();
  console.log('⚠️  This is a MANUAL testing checkpoint');
  console.log('📝 Document failures in test-environments/test-results.json');
  console.log();
}

async function main() {
  console.log('🧪 Platform Command Testing Guide\n');
  console.log('This script provides instructions for MANUAL command testing.\n');
  console.log('Why manual? Commands require context and human judgment to verify behavior.\n');
  
  const platforms = ['copilot', 'claude', 'codex'];
  
  for (const platform of platforms) {
    await testPlatformCommands(platform);
    
    if (platform !== platforms[platforms.length - 1]) {
      console.log('\nPress Enter to continue to next platform...');
      // In actual use, would wait for input
      // For now, just show instructions
    }
  }
  
  console.log('='.repeat(60));
  console.log('Testing Complete');
  console.log('='.repeat(60));
  console.log();
  console.log('Next steps:');
  console.log('1. Update test-environments/test-results.json with findings');
  console.log('2. Run regression tests: node scripts/test-regression.js');
  console.log('3. Proceed to Plan 3 for analysis and reporting');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Script error:', err);
    process.exit(1);
  });
}

module.exports = { commands };
