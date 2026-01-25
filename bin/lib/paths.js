/**
 * Cross-platform path utilities for GSD CLI installation
 * Uses fs-extra for enhanced directory operations
 */

const path = require('path');
const os = require('os');
const fs = require('fs-extra');

/**
 * Get configuration path for a specific CLI platform and scope
 * @param {string} platform - Platform name: 'claude', 'copilot', or 'codex'
 * @param {string} scope - Installation scope: 'global' or 'local'
 * @param {string|null} [configDir=null] - Optional custom config directory
 * @returns {string} Configuration path for the specified platform and scope
 * @throws {Error} If platform is unknown or if codex global is requested
 */
function getConfigPaths(platform, scope, configDir = null) {
  const home = os.homedir();
  const cwd = process.cwd();
  
  // Platform subdirectories for config-dir mode
  const platformSubdirs = {
    claude: '.claude',
    copilot: '.github',
    codex: '.codex'
  };
  
  if (!platformSubdirs[platform]) {
    throw new Error(`Unknown platform: ${platform}. Expected 'claude', 'copilot', or 'codex'`);
  }
  
  // Custom config directory overrides all other logic
  if (configDir) {
    return path.join(path.resolve(configDir), platformSubdirs[platform]);
  }
  
  // Codex does not support global installation
  if (platform === 'codex' && scope === 'global') {
    throw new Error('Global installation not supported for codex');
  }
  
  // Global paths (breaking change: Claude now uses ~/.claude/)
  if (scope === 'global') {
    const globalPaths = {
      claude: path.join(home, '.claude'),
      copilot: path.join(home, '.copilot'),
      codex: null  // Explicit null - should never reach here due to check above
    };
    return globalPaths[platform];
  }
  
  // Local paths
  if (scope === 'local') {
    const localPaths = {
      claude: path.join(cwd, '.claude'),
      copilot: path.join(cwd, '.github'),
      codex: path.join(cwd, '.codex')
    };
    return localPaths[platform];
  }
  
  throw new Error(`Invalid scope: ${scope}. Expected 'global' or 'local'`);
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

/**
 * Ensure installation directory exists with permission checking
 * @param {string} targetPath - Directory path to create
 * @param {string} scope - Installation scope ('global' or 'local')
 * @returns {Promise<{success: boolean, error?: string, suggestion?: string}>}
 */
async function ensureInstallDir(targetPath, scope) {
  try {
    await fs.ensureDir(targetPath);
    return { success: true };
  } catch (error) {
    // Permission errors
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      let suggestion = '';
      if (scope === 'global') {
        suggestion = 'Try using --local for a project-specific installation, or run with appropriate permissions.';
      } else {
        suggestion = 'Check directory permissions or choose a different location with --config-dir.';
      }
      
      return {
        success: false,
        error: `Permission denied: Cannot create directory ${targetPath}`,
        suggestion
      };
    }
    
    // Other errors
    return {
      success: false,
      error: `Failed to create directory ${targetPath}: ${error.message}`,
      suggestion: 'Verify the path is valid and accessible.'
    };
  }
}

module.exports = {
  getConfigPaths,
  expandTilde,
  ensureDirExists,
  ensureInstallDir
};
