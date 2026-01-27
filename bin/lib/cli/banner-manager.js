// bin/lib/cli/banner-manager.js

import * as logger from './logger.js';
import { getTemplatesDirectory } from '../paths/path-resolver.js';
import chalk from 'chalk';

/**
 * Print banner with ASCII art and optional context
 * @param {string} appVersion - Version string 
 * @param {boolean} attribution - Whether to show attribution (default: true)
 * @param {string|null} scriptDir - Optional script directory to show templates path
 */
export function banner(appVersion, attribution = true, scriptDir = null) {
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
  
  // Show templates directory if scriptDir provided
  if (scriptDir) {
    const templatesDir = getTemplatesDirectory(scriptDir);
    logger.info(`Templates: ${templatesDir}`, 1);
  }
  
  console.log();
}

/**
 * @deprecated Use banner() with scriptDir parameter instead
 * Show application banner with context information
 */
export function showBannerWithContext(scriptDir, version, attribution) {
  banner(version, attribution, scriptDir);
}
