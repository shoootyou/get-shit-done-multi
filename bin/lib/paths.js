/**
 * Cross-platform path utilities for GSD CLI installation
 * Uses only Node.js built-ins (no npm dependencies)
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

/**
 * Get configuration paths for a specific CLI
 * @param {string} cli - CLI name: 'claude', 'copilot', or 'codex'
 * @returns {{global: string, local: string}} Global and local config paths
 */
function getConfigPaths(cli) {
  const home = os.homedir();
  const cwd = process.cwd();
  
  const paths = {
    claude: {
      global: path.join(home, '.claude'),
      local: path.join(cwd, '.claude')
    },
    copilot: {
      global: path.join(home, '.config', 'github-copilot-cli'),
      local: path.join(cwd, '.github')
    },
    codex: {
      global: path.join(home, '.codex'),
      local: path.join(cwd, '.codex')
    }
  };
  
  if (!paths[cli]) {
    throw new Error(`Unknown CLI: ${cli}. Expected 'claude', 'copilot', or 'codex'`);
  }
  
  return paths[cli];
}

/**
 * Expand tilde (~/) in file paths to home directory
 * @param {string} filePath - Path that may contain ~/
 * @returns {string} Expanded path with home directory
 */
function expandTilde(filePath) {
  if (!filePath) {
    return filePath;
  }
  
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  
  return filePath;
}

/**
 * Ensure directory exists, creating parent directories as needed
 * Idempotent - succeeds if directory already exists
 * @param {string} dirPath - Directory path to create
 * @returns {boolean} True if directory exists or was created, false on error
 */
function ensureDirExists(dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error.message);
    return false;
  }
}

module.exports = {
  getConfigPaths,
  expandTilde,
  ensureDirExists
};
