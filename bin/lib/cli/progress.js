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
 * Display completion line with checkmark
 * @param {string} phase - Phase name (e.g., 'Skills', 'Agents', 'Shared')
 * @param {number} count - Total count
 * @param {number} total - Total items
 */
export function displayCompletionLine(phase, count, total) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 100;
  console.log(`  ${chalk.green('✓')} ${phase} installed | ${percentage}% | ${count}/${total}`);
}
