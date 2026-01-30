// bin/lib/validation/cli-validator.js

import { getPlatformName } from '../platforms/platform-names.js';
import { getPathReference } from '../platforms/platform-paths.js';

/**
 * CLI argument validation functions
 * Validates combinations of CLI flags and arguments before installation begins
 */

/**
 * Validate that custom-path is not used with multiple platforms
 * 
 * @param {Array<string>} platforms - Selected platforms
 * @param {string|null} customPath - Custom path option
 * @throws {Error} If validation fails
 * 
 * @example
 * // Valid
 * validateCustomPathWithPlatforms(['copilot'], '/tmp/test')
 * 
 * // Invalid - throws error
 * validateCustomPathWithPlatforms(['copilot', 'codex'], '/tmp/test')
 */
export function validateCustomPathWithPlatforms(platforms, customPath) {
  if (customPath && platforms.length > 1) {
    const platformList = platforms.map(p => `--${p}`).join(' ');
    const basePath = String(customPath).replace(/\/+$/, '');
    const perPlatformExamples = platforms
      .map(p => {
        const subdir = getPathReference(p);
        return `  npx get-shit-done-multi --${p} --custom-path ${basePath}/${subdir}`;
      })
      .join('\n');
    const perPlatformDirs = platforms
      .map(p => `  ${getPathReference(p)}/  (${getPlatformName(p)})`)
      .join('\n');

    throw new Error(
      'Invalid flags: --custom-path cannot be used with multiple platforms.\n' +
      '\n' +
      '--custom-path installs exactly ONE platform into ONE directory.\n' +
      'When you select multiple platforms, each platform needs its own directory:\n' +
      `${perPlatformDirs}\n` +
      '\n' +
      'Using --custom-path would force all platforms into the same folder and they would overwrite each other.\n' +
      '\n' +
      'Fix:\n' +
      '  # Run one command per platform\n' +
      `${perPlatformExamples}\n` +
      '\n' +
      'Or:\n' +
      '  # Let the installer create the default subdirectories\n' +
      `  cd ${customPath}\n` +
      `  npx get-shit-done-multi ${platformList} --local`
    );
  }
}
