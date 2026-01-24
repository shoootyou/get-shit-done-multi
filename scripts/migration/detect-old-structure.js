const fs = require('fs-extra');
const path = require('path');

/**
 * Detect old GSD structure across all supported CLIs
 * Old: .github/skills/get-shit-done/commands (nested structure)
 * New: .github/skills/gsd-* (multiple skill folders in skills/)
 */
async function detectOldStructure(platform) {
  const patterns = {
    copilot: '.github/skills/get-shit-done/commands',
    claude: '.claude/get-shit-done/commands',
    codex: '.codex/skills/get-shit-done/commands'
  };
  
  const oldPath = patterns[platform];
  if (!oldPath) return null;
  
  const hasOld = await fs.pathExists(oldPath);
  if (!hasOld) return null;
  
  // Verify it's actually old structure (has commands folder)
  const files = await fs.readdir(oldPath).catch(() => []);
  
  return {
    platform,
    path: oldPath,
    fileCount: files.length,
    detected: true
  };
}

async function detectAllPlatforms() {
  const platforms = ['copilot', 'claude', 'codex'];
  const results = await Promise.all(
    platforms.map(p => detectOldStructure(p))
  );
  return results.filter(r => r !== null);
}

module.exports = { detectOldStructure, detectAllPlatforms };
