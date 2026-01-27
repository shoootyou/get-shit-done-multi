// bin/lib/platforms/platform-paths.js

import os from 'os';
import path from 'path';

/**
 * Platform directory mappings
 * Defines where each platform stores GSD installations
 */
export const platformDirs = {
  claude: { global: '.claude', local: '.claude' },
  copilot: { global: '.copilot', local: '.github' },
  codex: { global: '.codex', local: '.codex' }
};

/**
 * Shared constants
 */
export const SHARED_DIR = 'get-shit-done';
export const MANIFEST_FILE = '.gsd-install-manifest.json';

/**
 * Get platform directory name for a scope
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @param {boolean} isGlobal - Global vs local scope
 * @returns {string} Directory name (e.g., '.claude', '.github')
 */
export function getPlatformDir(platform, isGlobal) {
  const dirs = platformDirs[platform];
  if (!dirs) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  return isGlobal ? dirs.global : dirs.local;
}

/**
 * Get full installation path for a platform
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @param {boolean} isGlobal - Global vs local scope
 * @returns {string} Full path to installation directory
 */
export function getInstallPath(platform, isGlobal) {
  const platformDir = getPlatformDir(platform, isGlobal);
  const baseDir = isGlobal ? os.homedir() : process.cwd();
  return path.join(baseDir, platformDir, SHARED_DIR);
}

/**
 * Get full manifest path for a platform
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @param {boolean} isGlobal - Global vs local scope
 * @returns {string} Full path to manifest file
 */
export function getManifestPath(platform, isGlobal) {
  return path.join(getInstallPath(platform, isGlobal), MANIFEST_FILE);
}

/**
 * Get all global manifest paths
 * @returns {string[]} Array of global manifest paths
 */
export function getAllGlobalPaths() {
  return Object.keys(platformDirs).map(platform => 
    getManifestPath(platform, true)
  );
}

/**
 * Get all local manifest paths
 * @returns {string[]} Array of local manifest paths
 */
export function getAllLocalPaths() {
  return Object.keys(platformDirs).map(platform => 
    getManifestPath(platform, false)
  );
}

/**
 * Get platform directory for path reference (without ~/ or ./)
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @returns {string} Directory reference (e.g., '.claude', '.github')
 */
export function getPathReference(platform) {
  // For path references, we use local directory (most common case)
  return platformDirs[platform]?.local || `.${platform}`;
}

/**
 * Derive platform from a manifest path
 * @param {string} manifestPath - Full path to manifest file
 * @returns {string} Platform ID (claude, copilot, codex) or 'custom'
 */
export function derivePlatformFromPath(manifestPath) {
  const parts = manifestPath.split(path.sep);
  
  // Find platform directory in path
  const platformDir = parts.find(p => 
    p === '.claude' || p === '.copilot' || p === '.codex' || p === '.github'
  );
  
  if (!platformDir) {
    return 'custom';
  }
  
  // Map .github to copilot (local copilot uses .github)
  if (platformDir === '.github') {
    return 'copilot';
  }
  
  // Remove leading dot
  return platformDir.substring(1);
}
