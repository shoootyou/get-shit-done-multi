const { detectAllPlatforms } = require('./detect-old-structure');
const { createBackup, addToGitignore } = require('./backup-handler');
const { confirmMigration } = require('./migration-prompts');
const { createProgressBar } = require('../shared/progress-display');
const fs = require('fs-extra');
const chalk = require('chalk');

async function runMigration() {
  console.log('\n🔍 Checking for old GSD structure...\n');
  
  // 1. Detection
  const detected = await detectAllPlatforms();
  
  if (detected.length === 0) {
    console.log('  ' + chalk.green('✓ No migration needed - already on new structure\n'));
    return { migrated: false, reason: 'no-old-structure' };
  }
  
  // 2. Confirmation
  const proceed = await confirmMigration(detected);
  if (!proceed) {
    console.log(chalk.yellow('\n⚠  Migration cancelled by user'));
    return { migrated: false, reason: 'user-declined' };
  }
  
  // 3. Backup
  console.log(chalk.cyan('\n📦 Creating backup...\n'));
  const backupResults = [];
  
  for (const structure of detected) {
    const result = await createBackup(structure.path);
    backupResults.push({ platform: structure.platform, ...result });
    console.log(chalk.green(`✓ Backed up ${structure.platform}: ${result.backupPath}`));
  }
  
  // 4. Add to .gitignore
  const gitignoreUpdated = await addToGitignore();
  if (gitignoreUpdated) {
    console.log(chalk.green('✓ Added .old-gsd-system/ to .gitignore'));
  }
  
  // 5. Remove old structure
  console.log(chalk.cyan('\n🗑  Removing old structure...\n'));
  const progressBar = createProgressBar('Cleaning up', detected.length);
  progressBar.start(detected.length, 0);
  
  for (let i = 0; i < detected.length; i++) {
    await fs.remove(detected[i].path);
    progressBar.update(i + 1);
  }
  progressBar.stop();
  
  // 6. Success message
  console.log(chalk.green('\n✅ Migration complete!'));
  console.log(chalk.dim(`\n   Old files backed up to: .old-gsd-system/${backupResults[0].date}/`));
  console.log(chalk.dim(`   Run installation again to set up new structure\n`));
  
  return {
    migrated: true,
    platforms: detected.map(d => d.platform),
    backups: backupResults,
    filesProcessed: detected.reduce((sum, d) => sum + d.fileCount, 0)
  };
}

module.exports = { runMigration };
