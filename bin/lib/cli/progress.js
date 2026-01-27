// bin/lib/cli/progress.js

import cliProgress from 'cli-progress';
import chalk from 'chalk';

/**
 * Create multi-bar progress display
 * @returns {Object} Multi-bar instance
 */
export function createMultiBar() {
  return new cliProgress.MultiBar({
    format: '  ' + chalk.cyan('{bar}') + ' | {phase} | {percentage}% | {value}/{total}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: true
  });
}

/**
 * Create single progress bar
 * @param {string} phase - Phase name
 * @param {number} total - Total items
 * @returns {Object} Progress bar instance
 */
export function createProgressBar(multiBar, phase, total) {
  return multiBar.create(total, 0, { phase });
}

/**
 * Update progress
 * @param {Object} bar - Progress bar instance
 * @param {number} value - Current value
 */
export function updateProgress(bar, value) {
  bar.update(value);
}

/**
 * Complete progress
 * @param {Object} bar - Progress bar instance
 */
export function completeProgress(bar) {
  bar.stop();
}

/**
 * Stop all progress bars
 * @param {Object} multiBar - Multi-bar instance
 */
export function stopAllProgress(multiBar) {
  multiBar.stop();
}
