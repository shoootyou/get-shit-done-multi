// bin/lib/validation/cli-validator.js

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
    
    throw new Error(
      'Cannot use --custom-path with multiple platforms.\n' +
      '\n' +
      'The --custom-path option is designed to install a SINGLE platform to a custom location.\n' +
      'When multiple platforms are specified, each platform installs to its own subdirectory\n' +
      '(.github/, .claude/, .codex/), but --custom-path replaces this entire path, causing\n' +
      'all platforms to overwrite the same directory.\n' +
      '\n' +
      'Solution: Run separate commands for each platform:\n' +
      `  npx get-shit-done-multi --${platforms[0]} --custom-path ${customPath}\n` +
      `  npx get-shit-done-multi --${platforms[1]} --custom-path <other-path>\n` +
      '\n' +
      'Or use default paths (each platform gets its own directory):\n' +
      `  cd ${customPath}\n` +
      `  npx get-shit-done-multi ${platformList} --local`
    );
  }
}
