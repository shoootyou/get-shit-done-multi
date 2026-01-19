/**
 * CLI installation detection utilities
 * Uses only Node.js built-ins (no npm dependencies)
 */

const fs = require('fs');
const { getConfigPaths } = require('./paths');

/**
 * Detect which CLIs are currently installed on the system
 * Checks for presence of global configuration directories
 * @returns {{claude: boolean, copilot: boolean, codex: boolean}} Installation status for each CLI
 */
function detectInstalledCLIs() {
  const clis = ['claude', 'copilot', 'codex'];
  const detected = {};
  
  for (const cli of clis) {
    try {
      const { global } = getConfigPaths(cli);
      detected[cli] = fs.existsSync(global);
    } catch (error) {
      // If getConfigPaths throws, mark as not installed
      detected[cli] = false;
    }
  }
  
  return detected;
}

/**
 * Generate a human-readable message about detected CLIs
 * @param {{claude: boolean, copilot: boolean, codex: boolean}} detected - Detection results from detectInstalledCLIs()
 * @returns {string} Formatted message with checkmarks for installed CLIs
 */
function getDetectedCLIsMessage(detected) {
  const cliNames = {
    claude: 'Claude Code',
    copilot: 'GitHub Copilot CLI',
    codex: 'Codex CLI'
  };
  
  const installedCLIs = Object.entries(detected)
    .filter(([_, isInstalled]) => isInstalled)
    .map(([cli, _]) => cliNames[cli]);
  
  if (installedCLIs.length === 0) {
    return 'No CLIs detected';
  }
  
  // Format with checkmarks
  const formatted = Object.entries(detected)
    .map(([cli, isInstalled]) => {
      const mark = isInstalled ? '✓' : '✗';
      return `${mark} ${cliNames[cli]}`;
    })
    .join(', ');
  
  return `Detected: ${formatted}`;
}

module.exports = {
  detectInstalledCLIs,
  getDetectedCLIsMessage
};
