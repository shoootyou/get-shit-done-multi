// bin/lib/cli/next-steps.js

import * as logger from './logger.js';

/**
 * Platform name mapping
 */
const platformNames = {
  claude: 'Claude Code',
  copilot: 'GitHub Copilot CLI',
  codex: 'Codex CLI'
};

/**
 * Get platform display name
 * @param {string} platform - Platform key (claude, copilot, codex)
 * @returns {string} Display name
 */
function getPlatformName(platform) {
  return platformNames[platform] || 'your AI CLI';
}

/**
 * Show next steps after installation
 * 
 * Displays command guidance with correct prefix based on platform:
 * - Codex CLI (solo): uses $gsd- prefix
 * - Claude Code / GitHub Copilot CLI: uses /gsd- prefix
 * - Multiple platforms: uses /gsd- prefix (common denominator)
 * 
 * @param {string[]} platforms - Array of platform keys (claude, copilot, codex)
 * @param {number} indent - Number of spaces to indent (default: 0)
 */
export function showNextSteps(platforms, indent = 0) {
  // Determine command prefix based on platforms
  // Codex uses $gsd-, others use /gsd-
  const isCodexOnly = platforms.length === 1 && platforms[0] === 'codex';
  const prefix = isCodexOnly ? '$gsd-' : '/gsd-';
  
  // Dynamic CLI name based on number of platforms
  const cliName = platforms.length === 1 
    ? getPlatformName(platforms[0]) 
    : 'your AI CLI';
  
  // Show next steps with proper indentation
  logger.info(`Open ${cliName} and run ${prefix}help to see available commands`, indent);
  logger.info(`Try ${prefix}diagnose to validate your setup`, indent);
  logger.info(`Explore skills with ${prefix}list-skills`, indent);
}
