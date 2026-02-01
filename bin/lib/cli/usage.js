/**
 * Usage display utilities
 */

import * as logger from './logger.js';

/**
 * Show usage error when no platform specified in non-interactive mode
 */
export function showUsageError() {
  logger.error('No platform specified and not running in interactive mode.');
  logger.info('Usage: npx get-shit-done-multi --claude --global');
  logger.info('   or: npx get-shit-done-multi (interactive mode in terminal)');
}
