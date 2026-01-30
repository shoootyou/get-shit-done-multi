// bin/lib/platforms/platform-names.js

/**
 * Platform name mappings
 * Maps platform IDs to human-readable names
 */
export const platformNames = {
  claude: 'Claude Code',
  copilot: 'GitHub Copilot CLI',
  codex: 'Codex CLI'
};

/**
 * Get human-readable name for a platform
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @returns {string} Human-readable platform name
 */
export function getPlatformName(platform) {
  return platformNames[platform] || 'your AI CLI';
}

/**
 * Get CLI name for display based on platform(s)
 * @param {string[]} platforms - Array of platform IDs
 * @returns {string} CLI name to display
 */
export function getCliName(platforms) {
  if (platforms.length === 1) {
    return getPlatformName(platforms[0]);
  }
  return 'your AI CLI';
}
