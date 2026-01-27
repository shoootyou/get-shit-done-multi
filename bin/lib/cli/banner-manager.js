// bin/lib/cli/banner-manager.js

import * as logger from './logger.js';
import { getTemplatesDirectory } from '../paths/path-resolver.js';
import chalk from 'chalk';

/**
 * Show application banner with context information
 * Should be called once at the start of any installation flow
 * 
 * @param {string} scriptDir - Script directory path
 * @param {string} version - Application version
 * @param {boolean} attribution - Whether to show attribution
 */
export function showBannerWithContext(scriptDir, version, attribution) {
  banner(version, attribution);

  const templatesDir = getTemplatesDirectory(scriptDir);
  logger.info(`Templates: ${templatesDir}`, 1);
  console.log(); // Jump line after banner
}


/**
 * Print banner with ASCII art
 * @param {string} appVersion - Version string 
 * @param {boolean} attribution - Whether to show attribution
 */
export function banner(appVersion, attribution = true) {
  console.log();
  console.log(chalk.cyan('   ██████╗ ███████╗██████╗     ███╗   ███╗██╗   ██╗██╗  ████████╗██╗'));
  console.log(chalk.cyan('  ██╔════╝ ██╔════╝██╔══██╗    ████╗ ████║██║   ██║██║  ╚══██╔══╝██║'));
  console.log(chalk.cyan('  ██║  ███╗███████╗██║  ██║    ██╔████╔██║██║   ██║██║     ██║   ██║'));
  console.log(chalk.cyan('  ██║   ██║╚════██║██║  ██║    ██║╚██╔╝██║██║   ██║██║     ██║   ██║'));
  console.log(chalk.cyan('  ╚██████╔╝███████║██████╔╝    ██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║'));
  console.log(chalk.cyan('   ╚═════╝ ╚══════╝╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝'));
  console.log();
  console.log(chalk.bold.white(`  Get Shit Done (Multi-Platform) v${appVersion}`));
  if (attribution) {
    console.log(chalk.gray('  Multi-platform meta-prompting, context engineering and spec-driven development system.'));
    console.log(chalk.gray('   * Forked from TÂCHES: glittercowboy/get-shit-done (Claude Code only)'));
    console.log(chalk.gray('   * Extended for Claude Code, GitHub Copilot CLI, and Codex CLI'));
    console.log(chalk.gray('   * Maintained by shoootyou/get-shit-done-multi'));
  }
  console.log();
}
