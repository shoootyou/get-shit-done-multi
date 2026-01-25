const fs = require('fs-extra');
const path = require('path');

/**
 * Detect old GSD structure across all supported CLIs
 * Old structures:
 *   - Copilot: .github/skills/get-shit-done/commands (nested)
 *   - Claude: .claude/commands (old format before skills/)
 *   - Codex: .codex/skills/get-shit-done/commands (nested)
 * New: .github/skills/gsd-*, .claude/get-shit-done/gsd-*, .codex/skills/gsd-*
 */
async function detectOldStructure(platform) {
  const patterns = {
    copilot: '.github/skills/get-shit-done/commands',
    claude: '.claude/commands', // Old Claude format (no get-shit-done parent)
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
