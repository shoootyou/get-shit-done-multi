// bin/lib/updater/update-messages.js

import * as logger from '../cli/logger.js';

/**
 * Show message when no installation is found
 * @param {string[]} platforms - Array of platform keys (claude, copilot, codex)
 * @param {number} indent - Number of spaces to indent (default: 1)
 */
export function showNoInstallationMessage(platforms, indent = 1) {
  logger.blockTitle('No Installation Found', { width: 80 });
  logger.info('GSD is not installed at this location', indent);
  console.log('');
  logger.info('To install GSD, run one of these commands:', indent);
  logger.info('  npx get-shit-done-multi --claude --global', indent + 1);
  logger.info('  npx get-shit-done-multi --copilot --local', indent + 1);
  logger.info('  npx get-shit-done-multi --codex --global', indent + 1);
  console.log('');
  logger.info('Or run in interactive mode:', indent);
  logger.info('  npx get-shit-done-multi', indent + 1);
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
  logger.info('Example: npx get-shit-done-multi --claude --global', indent + 1);
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
