/**
 * Interactive mode detection utilities
 */

/**
 * Check if interactive mode should be used
 * @param {string[]} platforms - Array of platform names
 * @param {boolean} hasValidTTY - Whether stdin is a valid TTY
 * @returns {boolean} True if interactive mode should be used
 */
export function shouldUseInteractiveMode(platforms, hasValidTTY) {
  return platforms.length === 0 && hasValidTTY;
}

/**
 * Check if stdin is a valid TTY
 * @returns {boolean} True if process.stdin.isTTY is true
 */
export function isValidTTY() {
  return process.stdin.isTTY === true;
}
