const fs = require('fs-extra');
const path = require('path');

/**
 * Create backup in .old-gsd-system/YYYY-MM-DD/ structure
 * Per RESEARCH.md decision: Use folder per date to preserve history
 */
async function createBackup(sourcePath, options = {}) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const backupBase = path.join(process.cwd(), '.old-gsd-system');
  const backupPath = path.join(backupBase, today);
  
  // Check if today's backup already exists
  const exists = await fs.pathExists(backupPath);
  if (exists && !options.overwrite) {
    throw new Error(`Backup already exists for ${today}. Use --overwrite to replace.`);
  }
  
  // Create backup with atomic copy
  await fs.copy(sourcePath, backupPath, {
    preserveTimestamps: true,
    errorOnExist: !options.overwrite,
    overwrite: options.overwrite
  });
  
  // Verify backup
  const sourceFiles = await countFiles(sourcePath);
  const backupFiles = await countFiles(backupPath);
  
  if (sourceFiles !== backupFiles) {
    throw new Error('Backup verification failed: file count mismatch');
  }
  
  return {
    backupPath,
    filesBackedUp: sourceFiles,
    date: today
  };
}

async function countFiles(dir) {
  const files = await fs.readdir(dir, { recursive: true });
  return files.filter(f => {
    const stat = fs.statSync(path.join(dir, f));
    return stat.isFile();
  }).length;
}

async function addToGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignore = await fs.readFile(gitignorePath, 'utf8').catch(() => '');
  
  if (!gitignore.includes('.old-gsd-system')) {
    gitignore += '\n# GSD migration backup\n.old-gsd-system/\n';
    await fs.writeFile(gitignorePath, gitignore);
    return true;
  }
  return false;
}

module.exports = { createBackup, addToGitignore };
