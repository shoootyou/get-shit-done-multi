/**
 * CLI installation detection utilities
 * Uses only Node.js built-ins (no npm dependencies)
 */

const fs = require('fs');
const { getConfigPaths } = require('../../configuration/paths');

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
 * Detect which CLI is currently executing this code
 * Uses environment variables and execution context to determine runtime
 * @returns {string} One of: 'claude-code', 'copilot-cli', 'codex-cli', or 'unknown'
 */
function detectCLI() {
  // Check for Claude Code environment
  if (process.env.CLAUDE_CODE || process.env.CLAUDE_CLI) {
    return 'claude-code';
  }
  
  // Check for GitHub Copilot CLI environment
  if (process.env.GITHUB_COPILOT_CLI || process.env.COPILOT_CLI) {
    return 'copilot-cli';
  }
  
  // Check for Codex CLI environment
  if (process.env.CODEX_CLI) {
    return 'codex-cli';
  }
  
  // Fallback: check which CLI has skills installed and we're running from there
  const installed = detectInstalledCLIs();
  
  // Check if running from a skill directory
  const cwd = process.cwd();
  if (cwd.includes('.claude') || cwd.includes('Claude')) {
    return 'claude-code';
  }
  if (cwd.includes('.copilot') || cwd.includes('copilot')) {
    return 'copilot-cli';
  }
  if (cwd.includes('.codex') || cwd.includes('codex')) {
    return 'codex-cli';
  }
  
  // If only one CLI is installed, assume that's the one running
  const installedCount = Object.values(installed).filter(Boolean).length;
  if (installedCount === 1) {
    if (installed.claude) return 'claude-code';
    if (installed.copilot) return 'copilot-cli';
    if (installed.codex) return 'codex-cli';
  }
  
  // Default to Claude Code as it's the primary target
  return 'claude-code';
}

module.exports = {
  detectInstalledCLIs,
  detectCLI
};
