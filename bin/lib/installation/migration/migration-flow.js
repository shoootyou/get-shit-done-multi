const { detectAllPlatforms } = require('./detect-old-structure');
const { createBackup, addToGitignore } = require('./backup-handler');
const { confirmMigration } = require('./migration-prompts');
const { createProgressBar } = require('../../../scripts/shared/progress-display');
const { cyan, green, yellow, dim, reset } = require('./colors');
const fs = require('fs-extra');

async function runMigration() {
  console.log('\n  🔍 Checking for old GSD structure...\n');
  
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
    // Show relative path from backupBase
    const relativePath = result.backupPath.replace(process.cwd() + '/', '');
    console.log(`  ${green}✓${reset} Backed up ${structure.platform}: ${dim}${relativePath}${reset}`);
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
  console.log(`\n  ${green}✓${reset} Migration complete`);
  console.log(`  ${dim}Backup location: .old-gsd-system/${backupResults[0].date}/${reset}\n`);
  
  return {
    migrated: true,
    platforms: detected.map(d => d.platform),
    backups: backupResults,
    filesProcessed: detected.reduce((sum, d) => sum + d.fileCount, 0)
  };
}

module.exports = { runMigration };
