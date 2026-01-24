// scripts/audit/removal-confirmer.js
const { analyzeAllScripts } = require('./script-analyzer');
const prompts = require('prompts');
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

// Test mode flag - uses /tmp copy if --test-mode
const TEST_MODE = process.argv.includes('--test-mode');
const WORKSPACE_ROOT = TEST_MODE ? '/tmp/gsd-audit-test' : process.cwd();

async function setupTestEnvironment() {
  const testDir = '/tmp/gsd-audit-test';
  
  console.log(chalk.cyan(`\n📦 Setting up test environment in ${testDir}...\n`));
  
  // Clean and create test directory
  await fs.remove(testDir);
  await fs.ensureDir(testDir);
  
  // Copy workspace to test directory
  const sourceDir = '/workspace';
  await fs.copy(sourceDir, testDir, {
    filter: (src) => {
      // Skip node_modules, .git, and other large/system directories
      const name = path.basename(src);
      const skipDirs = [
        'node_modules', 
        '.git', 
        'test-environments',
        '.sandbox-cache',
        '__pycache__',
        '.pytest_cache',
        'coverage'
      ];
      
      // Skip if directory name matches
      if (skipDirs.includes(name)) return false;
      
      // Skip hidden files/dirs in root (except .planning, .github)
      if (name.startsWith('.') && src === path.join(sourceDir, name)) {
        return ['.planning', '.github'].includes(name);
      }
      
      return true;
    }
  });
  
  console.log(chalk.green(`✓ Test environment created at ${testDir}`));
  console.log(chalk.dim(`  Use --test-mode to run against this copy\n`));
  
  return testDir;
}

async function confirmRemovals() {
  // Setup test environment if requested
  if (TEST_MODE) {
    if (!await fs.pathExists(WORKSPACE_ROOT)) {
      console.log(chalk.yellow('⚠  Test environment not found. Creating...'));
      await setupTestEnvironment();
    }
    
    console.log(chalk.cyan(`\n🧪 RUNNING IN TEST MODE - working in ${WORKSPACE_ROOT}\n`));
    process.chdir(WORKSPACE_ROOT);
  }
  
  console.log(chalk.cyan('\n🔍 Analyzing project scripts...\n'));
  
  const scripts = await analyzeAllScripts();
  
  // Separate essential from non-essential
  const essential = scripts.filter(s => s.essential);
  const nonEssential = scripts.filter(s => !s.essential);
  
  console.log(chalk.green(`✓ ${essential.length} essential scripts (will keep)`));
  console.log(chalk.yellow(`⚠ ${nonEssential.length} non-essential scripts (audit needed)\n`));
  
  if (essential.length > 0) {
    console.log(chalk.dim('Essential scripts:'));
    essential.forEach(s => {
      console.log(chalk.dim(`  - ${s.relativePath} (${s.usage.join(', ')})`));
    });
    console.log();
  }
  
  if (nonEssential.length === 0) {
    console.log(chalk.green('\n✅ No non-essential scripts found\n'));
    return { kept: essential.length, removed: 0, removals: [] };
  }
  
  const toRemove = [];
  const toKeep = [];
  
  console.log(chalk.yellow('Auditing non-essential scripts:\n'));
  
  for (const script of nonEssential) {
    console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
    console.log(chalk.cyan.bold(`📄 ${script.relativePath}`));
    console.log(chalk.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
    
    console.log(chalk.white.bold('📝 Purpose:'));
    console.log(`   ${chalk.dim(script.purpose)}\n`);
    
    console.log(chalk.white.bold('📊 Metadata:'));
    console.log(`   Last modified: ${chalk.dim(script.lastModified)}`);
    console.log(`   Size: ${chalk.dim(script.size)}\n`);
    
    console.log(chalk.white.bold('🔗 Consumed by (who uses this):'));
    if (script.usage[0] === 'Not detected') {
      console.log(chalk.red(`   ⚠  No consumers detected`));
    } else {
      script.usage.forEach(u => console.log(`   ${chalk.green('✓')} ${u}`));
    }
    console.log();
    
    console.log(chalk.white.bold('⚙️  Invokes (what this uses):'));
    if (script.invocations[0] === 'None detected') {
      console.log(chalk.dim(`   No dependencies`));
    } else {
      script.invocations.forEach(inv => console.log(`   ${chalk.blue('→')} ${inv}`));
    }
    console.log();
    
    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Action?',
      choices: [
        { title: 'Keep', value: 'keep' },
        { title: 'Remove', value: 'remove' },
        { title: 'Skip for now', value: 'skip' }
      ],
      initial: 0
    });
    
    if (response.action === 'remove') {
      toRemove.push(script);
    } else if (response.action === 'keep') {
      toKeep.push(script);
    }
  }
  
  if (toRemove.length === 0) {
    console.log(chalk.green('\n✓ No files marked for removal\n'));
    return { kept: essential.length + toKeep.length, removed: 0, removals: [] };
  }
  
  // Final confirmation
  console.log(chalk.yellow(`\n⚠  About to remove ${toRemove.length} files:\n`));
  toRemove.forEach(s => console.log(`  - ${s.relativePath}`));
  
  const finalConfirm = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Proceed with removal?',
    initial: false
  });
  
  if (!finalConfirm.proceed) {
    console.log(chalk.yellow('\n⚠  Removal cancelled\n'));
    return { kept: essential.length + toKeep.length, removed: 0, removals: [] };
  }
  
  // Create DEPRECATED.md
  await createDeprecatedDoc(toRemove);
  
  // Remove files
  console.log(chalk.cyan('\n🗑  Removing files...\n'));
  for (const script of toRemove) {
    await fs.remove(script.path);
    console.log(chalk.red(`✓ Removed: ${script.relativePath}`));
  }
  
  console.log(chalk.green(`\n✅ Removed ${toRemove.length} files\n`));
  console.log(chalk.dim(`Documentation: .planning/phases/08.1-*/DEPRECATED.md\n`));
  
  return {
    kept: essential.length + toKeep.length,
    removed: toRemove.length,
    removals: toRemove
  };
}

async function createDeprecatedDoc(removals) {
  const content = `# Deprecated Files - Phase 8.1

**Removal Date:** ${new Date().toISOString().split('T')[0]}

## Overview

These files were removed during Phase 8.1 documentation cleanup and script audit. They were identified as non-essential based on the following criteria:

- Not used in package.json scripts
- Not called by install.js or core functionality
- Not referenced in documentation
- Not part of CI/CD workflow

## Removed Files

| File | Purpose | Last Modified | Size | Reason |
|------|---------|---------------|------|--------|
${removals.map(r => `| ${r.relativePath} | ${r.purpose} | ${r.lastModified} | ${r.size} | ${r.usage[0] === 'Not detected' ? 'Unused' : 'Non-essential'} |`).join('\n')}

## Recovery

If any of these files are needed in the future, they can be recovered from git history:

\`\`\`bash
# Find file in history
git log --all --full-history -- path/to/file

# Restore file from specific commit
git checkout <commit-hash> -- path/to/file
\`\`\`

---
*Generated during Phase 8.1 script audit*
`;

  const phaseDir = '.planning/phases/08.1-documentation-cleanup-and-fixes';
  await fs.ensureDir(phaseDir);
  await fs.writeFile(path.join(phaseDir, 'DEPRECATED.md'), content);
}

// Run if called directly
if (require.main === module) {
  // Show help if requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
${chalk.cyan.bold('GSD Script Audit Tool')}

${chalk.white('Usage:')}
  node scripts/audit/removal-confirmer.js [options]

${chalk.white('Options:')}
  --test-mode    Run in test mode (uses /tmp/gsd-audit-test copy)
  --setup-test   Create test environment in /tmp
  -h, --help     Show this help

${chalk.white('Description:')}
  Interactive script audit tool that analyzes all scripts in the project
  and helps identify non-essential files safe for removal.

${chalk.white('Essential criteria (kept if ANY true):')}
  • Used in package.json scripts
  • Called by install.js or core libs
  • Referenced in user documentation
  • Part of CI/CD workflow

${chalk.white('Test mode:')}
  1. Run: node scripts/audit/removal-confirmer.js --setup-test
  2. Then: node scripts/audit/removal-confirmer.js --test-mode
  3. Test environment created in /tmp/gsd-audit-test (safe to modify)
`);
    process.exit(0);
  }
  
  // Setup test environment only
  if (process.argv.includes('--setup-test')) {
    setupTestEnvironment().then(() => {
      console.log(chalk.green('\n✅ Test environment ready!'));
      console.log(chalk.dim('   Run with --test-mode to use it\n'));
    }).catch(err => {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    });
    return;
  }
  
  // Run audit
  confirmRemovals().then(result => {
    console.log(chalk.green(`\n✅ Final: ${result.kept} kept, ${result.removed} removed\n`));
  }).catch(err => {
    console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
    process.exit(1);
  });
}

module.exports = { confirmRemovals, setupTestEnvironment };
