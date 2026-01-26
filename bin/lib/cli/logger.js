// bin/lib/cli/logger.js

import chalk from 'chalk';

/**
 * Log info message
 * @param {string} message - Message to log
 */
export function info(message) {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log success message
 * @param {string} message - Message to log
 */
export function success(message) {
  console.log(chalk.green('✓'), message);
}

/**
 * Log warning message
 * @param {string} message - Message to log
 */
export function warn(message) {
  console.warn(chalk.yellow('⚠'), message);
}

/**
 * Log error message
 * @param {string} message - Message to log
 */
export function error(message) {
  console.error(chalk.red('✗'), message);
}

/**
 * Log verbose message (only if verbose mode)
 * @param {string} message - Message to log
 * @param {boolean} isVerbose - Verbose mode flag
 */
export function verbose(message, isVerbose) {
  if (isVerbose) {
    console.log(chalk.gray('  →'), message);
  }
}

/**
 * Print section header
 * @param {string} title - Section title
 */
export function header(title) {
  console.log();
  console.log(chalk.bold.cyan(title));
  console.log(chalk.cyan('─'.repeat(title.length)));
}

/**
 * Print final summary
 * @param {Object} stats - Installation statistics
 */
export function summary(stats) {
  console.log();
  success(`${stats.skills} skills, ${stats.agents} agents installed to ${stats.target}`);
  info('Try /gsd-help to get started');
}
