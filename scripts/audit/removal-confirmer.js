// scripts/audit/removal-confirmer.js
const { analyzeAllScripts } = require('./script-analyzer');
const prompts = require('prompts');
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

async function confirmRemovals() {
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
    console.log(chalk.cyan(`\n${script.relativePath}`));
    console.log(`  Purpose: ${chalk.dim(script.purpose)}`);
    console.log(`  Last modified: ${chalk.dim(script.lastModified)}`);
    console.log(`  Size: ${chalk.dim(script.size)}`);
    console.log(`  Usage: ${chalk.dim(script.usage.join(', '))}`);
    
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
  confirmRemovals().then(result => {
    console.log(`Final: ${result.kept} kept, ${result.removed} removed`);
  }).catch(err => {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { confirmRemovals };
