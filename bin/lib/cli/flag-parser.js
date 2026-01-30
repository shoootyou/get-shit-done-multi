/**
 * CLI flag parsing utilities
 */

import { InstallError, EXIT_CODES } from '../errors/install-error.js';

/**
 * Parse platform flags from CLI options
 * @param {Object} options - Commander options object
 * @param {Object} adapterRegistry - Platform adapter registry
 * @returns {string[]} Array of platform names
 * @throws {InstallError} If unknown platform specified or conflicting flags
 */
export function parsePlatformFlags(options, adapterRegistry) {
  // Handle --all flag (shorthand for all platforms)
  if (options.all) {
    // Check for conflicting individual platform flags
    if (options.claude || options.copilot || options.codex) {
      throw new InstallError(
        'Cannot use --all with individual platform flags (--claude, --copilot, --codex)',
        EXIT_CODES.INVALID_ARGS
      );
    }
    
    return adapterRegistry.getSupportedPlatforms();
  }
  
  // Individual platform selection
  const platforms = [];
  if (options.claude) platforms.push('claude');
  if (options.copilot) platforms.push('copilot');
  if (options.codex) platforms.push('codex');
  
  // Validate platforms
  const supported = adapterRegistry.getSupportedPlatforms();
  for (const platform of platforms) {
    if (!supported.includes(platform)) {
      throw new InstallError(
        `Unknown platform: ${platform}. Supported: ${supported.join(', ')}`,
        EXIT_CODES.INVALID_ARGS
      );
    }
  }
  
  return platforms;
}

/**
 * Parse scope from CLI options
 * @param {Object} options - Commander options object
 * @returns {string} 'global' or 'local'
 * @throws {InstallError} If both --global and --local specified
 */
export function parseScope(options) {
  const isGlobal = options.global === true;
  const isLocal = options.local === true;
  
  if (isGlobal && isLocal) {
    throw new InstallError(
      'Cannot specify both --global and --local',
      EXIT_CODES.INVALID_ARGS
    );
  }
  
  return isGlobal ? 'global' : 'local';
}
