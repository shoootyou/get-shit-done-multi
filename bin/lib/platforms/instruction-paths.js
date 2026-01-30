// bin/lib/platforms/instruction-paths.js

import os from 'os';
import path from 'path';

/**
 * Instruction file mappings
 * Defines where each platform stores instruction files (scope-aware)
 */
export const instructionFiles = {
  claude: {
    global: '.claude/CLAUDE.md',      // Inside platform dir
    local: 'CLAUDE.md'                 // Project root
  },
  copilot: {
    global: '.copilot/copilot-instructions.md',  // Inside platform dir
    local: '.github/copilot-instructions.md'     // Inside .github/
  },
  codex: {
    global: '.codex/AGENTS.md',       // Inside platform dir
    local: 'AGENTS.md'                 // Project root
  }
};

/**
 * Get full instruction file path for a platform
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @param {boolean} isGlobal - Global vs local scope
 * @returns {string} Absolute path to instruction file
 */
export function getInstructionPath(platform, isGlobal) {
  const files = instructionFiles[platform];
  if (!files) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  const relativePath = isGlobal ? files.global : files.local;
  const baseDir = isGlobal ? os.homedir() : process.cwd();
  
  return path.join(baseDir, relativePath);
}
