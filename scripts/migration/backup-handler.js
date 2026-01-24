const fs = require('fs-extra');
const path = require('path');

/**
 * Create backup in .old-gsd-system/YYYY-MM-DD/ structure
 * Preserves CLI directory structure: .old-gsd-system/YYYY-MM-DD/.claude (or .github, .codex)
 * Per RESEARCH.md decision: Use folder per date to preserve history
 */
async function createBackup(sourcePath, options = {}) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const backupBase = path.join(process.cwd(), '.old-gsd-system', today);
  
  // Extract CLI root directory (.claude, .github, .codex) from sourcePath
  const cliRoot = sourcePath.split(path.sep)[0]; // e.g., ".claude" from ".claude/commands"
  const backupPath = path.join(backupBase, cliRoot);
  
  // If backup exists, remove it (automatic overwrite for same-day re-runs)
  const exists = await fs.pathExists(backupPath);
  if (exists) {
    await fs.remove(backupPath);
  }
  
  // Create backup with atomic copy (preserves full structure)
  await fs.copy(sourcePath, backupPath, {
    preserveTimestamps: true,
    overwrite: true
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
