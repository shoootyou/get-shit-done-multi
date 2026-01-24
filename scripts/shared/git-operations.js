const { execSync } = require('child_process');
const fs = require('fs-extra');

/**
 * Rename file with git history preservation
 * Per RESEARCH.md Pitfall 6: Use two-step rename for case-insensitive filesystems
 */
async function gitMv(oldPath, newPath) {
  const isCaseOnlyChange = oldPath.toLowerCase() === newPath.toLowerCase();
  
  try {
    if (isCaseOnlyChange) {
      // Two-step rename for case-insensitive filesystems
      const tempPath = oldPath + '.tmp';
      execSync(`git mv "${oldPath}" "${tempPath}"`, { stdio: 'pipe' });
      execSync(`git mv "${tempPath}" "${newPath}"`, { stdio: 'pipe' });
    } else {
      execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'pipe' });
    }
    return { success: true, method: 'git' };
  } catch (err) {
    // Fallback to fs if not in git or file not tracked
    await fs.rename(oldPath, newPath);
    return { success: true, method: 'fs', warning: 'Not tracked by git' };
  }
}

module.exports = { gitMv };
