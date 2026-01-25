import { join, resolve, normalize } from 'path';
import { homedir } from 'os';

/**
 * Resolve a path to an absolute normalized path
 * @param {string} inputPath - Path to resolve
 * @returns {string} - Absolute normalized path
 */
export function resolvePath(inputPath) {
  return normalize(resolve(inputPath));
}

/**
 * Normalize a path, expanding ~ to home directory
 * @param {string} inputPath - Path to normalize
 * @returns {string} - Normalized absolute path
 */
export function normalizeHomePath(inputPath) {
  if (inputPath.startsWith('~/')) {
    return resolve(homedir(), inputPath.slice(2));
  }
  if (inputPath === '~') {
    return homedir();
  }
  return resolve(inputPath);
}

/**
 * Get the platform-specific base path
 * @param {string} platform - Platform name ('claude', 'copilot', 'codex')
 * @param {string} scope - Installation scope ('global' or 'local')
 * @returns {string} - Platform base path
 */
export function getPlatformPath(platform, scope) {
  const platformDirs = {
    claude: '.claude',
    copilot: '.copilot',
    codex: '.codex'
  };

  const dir = platformDirs[platform];
  if (!dir) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  if (scope === 'global') {
    return normalizeHomePath(`~/${dir}/`);
  } else if (scope === 'local') {
    return `./${dir}/`;
  } else {
    throw new Error(`Invalid scope: ${scope}. Must be 'global' or 'local'`);
  }
}

/**
 * Get the skills directory path for a platform
 * @param {string} platform - Platform name ('claude', 'copilot', 'codex')
 * @param {string} scope - Installation scope ('global' or 'local')
 * @returns {string} - Skills directory path
 */
export function getSkillsPath(platform, scope) {
  const basePath = getPlatformPath(platform, scope);
  return join(basePath, 'skills', 'gsd');
}
