// bin/lib/updater/update-messages.js

import * as logger from '../cli/logger.js';

/**
 * Show message when no installation is found
 * @param {string[]} platforms - Array of platform keys (claude, copilot, codex)
 */
export function showNoInstallationMessage(platforms) {
  logger.blockTitle('Next Steps', { width: 80 });
  logger.verbose('To install GSD Multi, run one of these commands:', 1);

  let nonePlatforms = false;
  if (!Array.isArray(platforms) || platforms.length === 0) { nonePlatforms = true; }

  if (nonePlatforms || platforms.includes('claude')) {
    logger.listItem('npx get-shit-done-multi --claude --custom-path=/my/custom/path', 3);
  }
  if (nonePlatforms || platforms.includes('copilot')) {
    logger.listItem('npx get-shit-done-multi --copilot --custom-path=/my/custom/path', 3);
  }
  if (nonePlatforms || platforms.includes('codex')) {
    logger.listItem('npx get-shit-done-multi --codex --custom-path=/my/custom/path', 3);
  }

  console.log('');
  logger.verbose('Or run in interactive mode:', 1);
  logger.listItem('npx get-shit-done-multi --custom-path=/my/custom/path', 3);
}

/**
 * Show message when update is available
 * @param {string} platform - Platform name
 * @param {string} currentVersion - Current installed version
 * @param {string} availableVersion - Available version
 * @param {string} updateType - Type of update (minor, major, patch)
 * @param {number} indent - Number of spaces to indent (default: 1)
 */
export function showUpdateAvailableMessage(platform, currentVersion, availableVersion, updateType, indent = 1) {
  logger.blockTitle('Update Available', { width: 80 });
  logger.info(`${platform}: v${currentVersion} → v${availableVersion} (${updateType} update)`, indent);
  console.log('');
  logger.info('To update, run the installer again with the same flags you used initially', indent);
  logger.listItem('Example: npx get-shit-done-multi --claude --global', indent + 1);
}

/**
 * Show summary of installations checked
 * @param {Object} summary - Summary object with counts
 * @param {number} summary.total - Total installations checked
 * @param {number} summary.upToDate - Installations up to date
 * @param {number} summary.needsUpdate - Installations needing update
 * @param {number} summary.notFound - Installations not found
 * @param {number} indent - Number of spaces to indent (default: 1)
 */
export function showCheckUpdatesSummary(summary, indent = 1) {
  console.log('');
  logger.blockTitle('Summary', { width: 80 });
  logger.info(`Checked: ${summary.total} locations`, indent);
  if (summary.upToDate > 0) {
    logger.success(`Up to date: ${summary.upToDate}`, indent);
  }
  if (summary.needsUpdate > 0) {
    logger.warn(`Needs update: ${summary.needsUpdate}`, indent);
  }
  if (summary.notFound > 0) {
    logger.info(`Not installed: ${summary.notFound}`, indent);
  }
}
