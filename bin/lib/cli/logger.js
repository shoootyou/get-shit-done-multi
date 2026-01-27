// bin/lib/cli/logger.js

import chalk from 'chalk';
import { getPlatformName } from '../platforms/platform-names.js';

/**
 * Log info message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function listItem(message, indent = 0, fullColor = false) {
  const prefix = ' '.repeat(indent);
  if (fullColor) {
    console.log(prefix + '• ' + message);
  } else {
    console.log(prefix + '•', message);
  }
}

/**
 * Log info message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function info(message, indent = 0, fullColor = false) {
  const prefix = ' '.repeat(indent);
  if (fullColor) {
    console.log(prefix + chalk.blue('ℹ ' + message));
  } else {
    console.log(prefix + chalk.blue('ℹ'), message);
  }
}

/**
 * Log success message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function success(message, indent = 0, fullColor = false) {
  const prefix = ' '.repeat(indent);
  if (fullColor) {
    console.log(prefix + chalk.green('✓ ' + message));
  } else {
    console.log(prefix + chalk.green('✓'), message);
  }
}

/**
 * Log warning message with optional indentation
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function warn(message, indent = 0, fullColor = false) {
  const prefix = ' '.repeat(indent);
  if (fullColor) {
    console.warn(prefix + chalk.yellow('⚠ ' + message));
  } else {
    console.warn(prefix + chalk.yellow('⚠'), message);
  }
}

/**
 * Log error message
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function error(message, indent = 0, fullColor = false) {
  const prefix = ' '.repeat(indent);
  if (fullColor) {
    console.error(prefix + chalk.red('✗ ' + message));
  } else {
    console.error(prefix + chalk.red('✗'), message);
  }
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
  console.log(' ' + chalk.bold.cyan(title));
  console.log(' ' + chalk.cyan('─'.repeat(title.length)));
}

/**
 * Print big block title (for separating major processes)
 * @param {string} title - Block title
 * @param {object} [opts]
 * @param {'double'|'single'} [opts.style='single'] - Border style
 * @param {number} [opts.width=0] - If 0, auto-fit to title length (with padding)
 * @param {number} [opts.pad=2] - Spaces around the title inside the block
 * @param {'left'|'center'} [opts.align='left'] - Title alignment inside the block
 */
export function blockTitle(title, opts = {}) {
  const {
    style = 'single',
    width = 50,
    pad = 0,
    align = 'left',
  } = opts;

  const chars =
    style === 'single'
      ? { top: '─', bottom: '─' }
      : { top: '═', bottom: '═' };

  const clean = String(title ?? '').trim();

  // Get terminal width (accounting for leading space indent of 1)
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.max(terminalWidth - 1, 10); // Reserve 1 for indent, min 10

  // Calculate desired width
  const minW = Math.max(clean.length + pad * 2, 1);
  let w = Math.max(minW, width || 0);

  // Constrain to terminal width
  if (w > maxWidth) {
    w = maxWidth;
  }

  // Truncate title if it's too long for the available space
  const maxTitleLength = Math.max(w - pad * 2, 1);
  const truncatedTitle = clean.length > maxTitleLength
    ? clean.substring(0, maxTitleLength - 1) + '…'
    : clean;

  const lineTop = chars.top.repeat(w);
  const lineBottom = chars.bottom.repeat(w);

  const contentW = Math.max(w - pad * 2, 0);
  const safeAlign = align === 'center' ? 'center' : 'left';

  let middle;
  if (safeAlign === 'center' && contentW >= truncatedTitle.length) {
    const remaining = contentW - truncatedTitle.length;
    const leftExtra = Math.floor(remaining / 2);
    const rightExtra = remaining - leftExtra;
    middle =
      ' '.repeat(pad + leftExtra) +
      truncatedTitle +
      ' '.repeat(pad + rightExtra);
  } else {
    // default: left aligned
    middle =
      ' '.repeat(pad) +
      truncatedTitle +
      ' '.repeat(Math.max(w - pad - truncatedTitle.length, 0));
  }

  console.log(' ' + chalk.dim(lineTop));
  console.log(' ' + chalk.bold.cyan(middle));
  console.log(' ' + chalk.dim(lineBottom));
}

/**
 * Print banner with ASCII art
 * @param {string} appVersion - Version string 
 */
export function banner(appVersion) {
  console.log();
  console.log(chalk.cyan('   ██████╗ ███████╗██████╗     ███╗   ███╗██╗   ██╗██╗  ████████╗██╗'));
  console.log(chalk.cyan('  ██╔════╝ ██╔════╝██╔══██╗    ████╗ ████║██║   ██║██║  ╚══██╔══╝██║'));
  console.log(chalk.cyan('  ██║  ███╗███████╗██║  ██║    ██╔████╔██║██║   ██║██║     ██║   ██║'));
  console.log(chalk.cyan('  ██║   ██║╚════██║██║  ██║    ██║╚██╔╝██║██║   ██║██║     ██║   ██║'));
  console.log(chalk.cyan('  ╚██████╔╝███████║██████╔╝    ██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║'));
  console.log(chalk.cyan('   ╚═════╝ ╚══════╝╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝'));
  console.log();
  console.log(chalk.bold.white(`  Get Shit Done (Multi-Platform) v${appVersion}`));
  console.log(chalk.gray('  Multi-platform meta-prompting, context engineering and spec-driven development system.'));
  console.log(chalk.gray('   * Forked from TÂCHES: glittercowboy/get-shit-done (Claude Code only)'));
  console.log(chalk.gray('   * Extended for Claude Code, GitHub Copilot CLI, and Codex CLI'));
  console.log(chalk.gray('   * Maintained by shoootyou/get-shit-done-multi'));
  console.log();
}

/**
 * Print final summary
 * @param {Object} stats - Installation statistics
 * @param {string} platform - Platform name (claude, copilot, codex)
 */
export function summary(stats, platform) {
  const cliName = getPlatformName(platform);

  console.log();
  success(`${stats.skills} skills, ${stats.agents} agents installed to ${stats.target}`, 1);
  info(`Open ${cliName} and run '/gsd-help' to get started`, 1);
}

/**
 * Print section title (for progress phases)
 * @param {string} title - Section title
 */
export function sectionTitle(title) {
  console.log();
  console.log(' ' + chalk.bold.cyan(title));
  console.log(' ' + chalk.cyan('─'.repeat(title.length)));
}

/**
 * Print section title (for progress phases)
 * @param {string} title - Section title
 */
export function simpleTitle(title) {
  console.log();
  console.log(' ' + chalk.cyan(title));
}

/**
 * Generic subtitle with optional icon
 * @param {string} message - Message to log
 * @param {object} options - Options
 * @param {'warn'|'info'|'error'|'none'} options.type - Subtitle type
 * @param {number} options.indent - Indentation level
 * @param {number} options.width - Maximum width
 * @param {boolean} options.fullColor - Apply color to entire line (default: false, only icon colored)
 */
export function subtitle(message, options = {}) {
  const { type = 'none', indent = 0, width = 80, fullColor = false } = options;

  const terminalWidth = process.stdout.columns || 80;
  const effectiveWidth = Math.min(width, terminalWidth);
  const prefix = '  '.repeat(indent);

  let icon = '';
  let colorFn = chalk.white;

  if (type === 'warn') {
    icon = chalk.yellow('⚠') + ' ';
    colorFn = chalk.yellow;
  } else if (type === 'info') {
    icon = chalk.blue('ℹ') + ' ';
    colorFn = chalk.blue;
  } else if (type === 'error') {
    icon = chalk.red('✗') + ' ';
    colorFn = chalk.red;
  }

  const textPart = "─── " + icon + message + " ";
  const visibleLength = prefix.length + 4 + (icon ? 2 : 0) + message.length + 1;
  const remainingWidth = effectiveWidth - visibleLength;
  const dashes = remainingWidth > 0 ? '─'.repeat(remainingWidth) : '';

  if (fullColor && type !== 'none') {
    // Full line in color (icon + text + dashes)
    console.log(' ' + prefix + colorFn('─── ') + icon + colorFn(message + ' ' + dashes));
  } else {
    // Only icon colored, rest in default color
    console.log(' ' + prefix + textPart + dashes);
  }
}

/**
 * Log error subtitle with optional indentation and trailing dashes
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {number} width - Maximum width (default: terminal columns or 80)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function errorSubtitle(message, indent = 0, width = 80, fullColor = false) {
  subtitle(message, { type: 'error', indent, width, fullColor });
}

/**
 * Log warning subtitle with optional indentation and trailing dashes
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {number} width - Maximum width (default: terminal columns or 80)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function warnSubtitle(message, indent = 0, width = 80, fullColor = false) {
  subtitle(message, { type: 'warn', indent, width, fullColor });
}

/**
 * Log informational subtitle with optional indentation and trailing dashes
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {number} width - Maximum width (default: terminal columns or 80)
 * @param {boolean} fullColor - Apply color to entire line (default: false)
 */
export function infoSubtitle(message, indent = 0, width = 80, fullColor = false) {
  subtitle(message, { type: 'info', indent, width, fullColor });
}

/**
 * Log simple subtitle message with optional indentation and trailing dashes
 * @param {string} message - Message to log
 * @param {number} indent - Number of spaces to indent (default: 0)
 * @param {number} width - Maximum width (default: terminal columns or 80)
 */
export function simpleSubtitle(message, indent = 0, width = 80) {
  subtitle(message, { type: 'none', indent, width });
}