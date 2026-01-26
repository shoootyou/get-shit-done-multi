// bin/lib/cli/logger.js

import chalk from 'chalk';

/**
 * Log info message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 */
export function info(message, indent = 0) {
  const prefix = ' '.repeat(indent);
  console.log(prefix + chalk.blue('ℹ'), message);
}

/**
 * Log success message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 */
export function success(message, indent = 0) {
  const prefix = ' '.repeat(indent);
  console.log(prefix + chalk.green('✓'), message);
}

/**
 * Log warning message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 */
export function warn(message, indent = 0) {
  const prefix = ' '.repeat(indent);
  console.warn(prefix + chalk.yellow('⚠'), message);
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
 * Log verbose in-progress message
 * @param {string} message - Message to log
 * @param {boolean} isVerbose - Verbose mode flag
 */
export function verboseInProgress(message, isVerbose) {
  if (isVerbose) {
    process.stdout.write(chalk.blue('  → ') + message);
  }
}

/**
 * Log verbose completed message (completes in-progress line)
 * @param {boolean} isVerbose - Verbose mode flag
 */
export function verboseComplete(isVerbose) {
  if (isVerbose) {
    process.stdout.write(' ' + chalk.green('✓') + '\n');
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
 * Print banner with ASCII art
 */
export function banner() {
  console.log();
  console.log(chalk.cyan('   ██████╗ ███████╗██████╗ '));
  console.log(chalk.cyan('  ██╔════╝ ██╔════╝██╔══██╗'));
  console.log(chalk.cyan('  ██║  ███╗███████╗██║  ██║'));
  console.log(chalk.cyan('  ██║   ██║╚════██║██║  ██║'));
  console.log(chalk.cyan('  ╚██████╔╝███████║██████╔╝'));
  console.log(chalk.cyan('   ╚═════╝ ╚══════╝╚═════╝'));
  console.log(chalk.bold.white('  Get Shit Done v2.0.0'));
  console.log(chalk.gray('  A meta-prompting, context engineering and spec-driven development system.'));
  console.log(chalk.gray('   * Forked from TÂCHES/get-shit-done'));
  console.log(chalk.gray('   * Maintained by shoootyou/get-shit-done-multi'));
  console.log();
}

/**
 * Print final summary
 * @param {Object} stats - Installation statistics
 */
export function summary(stats) {
  console.log();
  success(`${stats.skills} skills, ${stats.agents} agents installed to ${stats.target}`, 1);
  info(`Open your AI CLI and run '/gsd-help' to get started`, 1);
}

/**
 * Print section title (for progress phases)
 * @param {string} title - Section title
 */
export function sectionTitle(title) {
  console.log();
  console.log(' ' + chalk.bold.cyan(title));
}
