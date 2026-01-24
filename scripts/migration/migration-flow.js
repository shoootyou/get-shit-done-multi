const { detectAllPlatforms } = require('./detect-old-structure');
const { createBackup, addToGitignore } = require('./backup-handler');
const { confirmMigration } = require('./migration-prompts');
const { createProgressBar } = require('../shared/progress-display');
const { cyan, green, yellow, dim, reset } = require('../shared/colors');
const fs = require('fs-extra');

async function runMigration() {
  console.log('\n🔍 Checking for old GSD structure...\n');
  
  // 1. Detection
  const detected = await detectAllPlatforms();
  
  if (detected.length === 0) {
    console.log(`  ${green}✓${reset} No migration needed - already on new structure\n`);
    return { migrated: false, reason: 'no-old-structure' };
  }
  
  // 2. Confirmation
  const proceed = await confirmMigration(detected);
  if (!proceed) {
    console.log(`\n  ${yellow}⚠${reset}  Migration cancelled by user`);
    return { migrated: false, reason: 'user-declined' };
  }
  
  // 3. Backup
  console.log(`\n  ${cyan}Backup:${reset}`);
  const backupResults = [];
  
  for (const structure of detected) {
    const result = await createBackup(structure.path);
    backupResults.push({ platform: structure.platform, ...result });
    console.log(`  ${green}✓${reset} Backed up ${structure.platform}: ${dim}${result.backupPath}${reset}`);
  }
  
  // 4. Add to .gitignore
  const gitignoreUpdated = await addToGitignore();
  if (gitignoreUpdated) {
    console.log(`  ${green}✓${reset} Added .old-gsd-system/ to .gitignore`);
  }
  
  // 5. Remove old structure
  console.log(`\n  ${cyan}Cleanup:${reset}`);
  const progressBar = createProgressBar('  Removing old files', detected.length);
  progressBar.start(detected.length, 0);
  
  for (let i = 0; i < detected.length; i++) {
    await fs.remove(detected[i].path);
    progressBar.update(i + 1);
  }
  progressBar.stop();
  
  // 6. Success message
  console.log(`\n  ${green}✅ Migration complete!${reset}`);
  console.log(`  ${dim}Old files backed up to: .old-gsd-system/${backupResults[0].date}/${reset}`);
  console.log(`  ${dim}Run installation again to set up new structure${reset}\n`);
  
  return {
    migrated: true,
    platforms: detected.map(d => d.platform),
    backups: backupResults,
    filesProcessed: detected.reduce((sum, d) => sum + d.fileCount, 0)
  };
}

module.exports = { runMigration };
