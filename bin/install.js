#!/usr/bin/env node

/**
 * get-shit-done-multi installer
 * Entry point for npx get-shit-done-multi
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { readFile } from "fs/promises";
import { InstallError, EXIT_CODES } from './lib/errors/install-error.js';
import * as logger from './lib/cli/logger.js';
import { adapterRegistry } from './lib/platforms/registry.js';
import { runInteractive } from './lib/cli/interactive.js';
import { showUsageError } from './lib/cli/usage.js';
import { parsePlatformFlags, parseScope } from './lib/cli/flag-parser.js';
import { shouldUseInteractiveMode, isValidTTY } from './lib/cli/mode-detector.js';
import { showNextSteps } from './lib/cli/next-steps.js';
import { showBannerWithContext } from './lib/cli/banner-manager.js';
import { executeInstallationLoop } from './lib/cli/install-loop.js';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from package.json (ESM-safe)
const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

/**
 * Handle --check-updates flag
 * @param {object} options - Command line options
 * @param {object} pkg - Package.json object
 */
async function handleCheckUpdates(options, pkg) {
  const { findInstallations } = await import('./lib/version/installation-finder.js');
  const { readManifestWithRepair } = await import('./lib/version/manifest-reader.js');
  const { compareVersions, formatPlatformOption } = await import('./lib/version/version-checker.js');
  
  const currentVersion = pkg.version;
  const customPaths = options.customPath ? [options.customPath] : [];
  
  // Show banner
  logger.banner(currentVersion);
  console.log('');
  
  if (options.verbose) {
    logger.info('Discovery process:');
    logger.info('  Checking global paths:');
    logger.info('    ~/.claude/get-shit-done/');
    logger.info('    ~/.copilot/get-shit-done/');
    logger.info('    ~/.codex/get-shit-done/');
    logger.info('  Checking local paths:');
    logger.info('    ./.claude/get-shit-done/');
    logger.info('    ./.github/get-shit-done/');
    logger.info('    ./.codex/get-shit-done/');
    if (customPaths.length > 0) {
      logger.info('  Custom paths:');
      customPaths.forEach(p => logger.info(`    ${p}`));
    }
    console.log('');
  }
  
  logger.info('Checking installations...');
  console.log('');
  
  // Check global installations
  const globalFound = await findInstallations('global', customPaths, options.verbose);
  
  if (globalFound.length > 0) {
    logger.info('Global installations:');
    for (const install of globalFound) {
      if (options.verbose) {
        logger.info(`  Found: ${install.path}`);
      }
      const manifestResult = await readManifestWithRepair(install.path, options.verbose);
      if (manifestResult.success) {
        if (options.verbose) {
          logger.info(`  Manifest read successfully`);
          logger.info(`  Version: ${manifestResult.manifest.gsd_version}`);
        }
        // Use platform from manifest if we have 'custom' placeholder
        const platform = install.platform === 'custom' 
          ? manifestResult.manifest.platform || 'unknown'
          : install.platform;
        
        const versionStatus = compareVersions(
          manifestResult.manifest.gsd_version,
          currentVersion
        );
        logger.info(`  ${formatStatusLine(platform, versionStatus, options.verbose)}`);
      } else {
        logger.warn(`  ✗ ${install.platform === 'custom' ? 'custom path' : install.platform}: ${manifestResult.reason}`);
      }
    }
  } else {
    logger.info('Global installations: none');
  }
  
  console.log('');
  
  // Check local installations
  const localFound = await findInstallations('local', customPaths, options.verbose);
  
  if (localFound.length > 0) {
    logger.info('Local installations:');
    for (const install of localFound) {
      if (options.verbose) {
        logger.info(`  Found: ${install.path}`);
      }
      const manifestResult = await readManifestWithRepair(install.path, options.verbose);
      if (manifestResult.success) {
        if (options.verbose) {
          logger.info(`  Manifest read successfully`);
          logger.info(`  Version: ${manifestResult.manifest.gsd_version}`);
        }
        // Use platform from manifest if we have 'custom' placeholder
        const platform = install.platform === 'custom' 
          ? manifestResult.manifest.platform || 'unknown'
          : install.platform;
        
        const versionStatus = compareVersions(
          manifestResult.manifest.gsd_version,
          currentVersion
        );
        logger.info(`  ${formatStatusLine(platform, versionStatus, options.verbose)}`);
      } else {
        logger.warn(`  ✗ ${install.platform === 'custom' ? 'custom path' : install.platform}: ${manifestResult.reason}`);
      }
    }
  } else {
    logger.info('Local installations: none');
  }
}

/**
 * Format status line for --check-updates display
 * @param {string} platform - Platform name
 * @param {object} versionStatus - Version status from compareVersions
 * @param {boolean} verbose - Verbose mode
 * @returns {string} Formatted status line
 */
function formatStatusLine(platform, versionStatus, verbose) {
  // Get platform display name
  const names = {
    'claude': 'Claude Code',
    'copilot': 'GitHub Copilot',
    'codex': 'Codex'
  };
  const baseName = names[platform] || platform;
  
  if (versionStatus.status === 'up_to_date') {
    const display = `${baseName} (v${versionStatus.installed})`;
    return verbose 
      ? `✓ ${display} (up to date)`
      : `✓ ${display}`;
  }
  
  if (versionStatus.status === 'update_available') {
    const display = `${baseName} (v${versionStatus.installed} → v${versionStatus.current})`;
    return `⬆ ${display} (${versionStatus.updateType} update available)`;
  }
  
  if (versionStatus.status === 'major_update') {
    const display = `${baseName} (v${versionStatus.installed} → v${versionStatus.current} ⚠️  major)`;
    return `⚠️  ${display} (major update available)`;
  }
  
  return `? ${baseName}: ${versionStatus.status}`;
}

async function main() {
  const program = new Command();

  program
    .name('get-shit-done-multi')
    .version(pkg.version)
    .description('Install get-shit-done skills and agents to AI coding assistants')
    .addHelpText('after', '\nRun without flags for interactive mode with beautiful prompts.');

  // Platform flags
  program
    .option('--claude', 'Install to Claude Code')
    .option('--copilot', 'Install to GitHub Copilot CLI')
    .option('--codex', 'Install to Codex CLI');

  // Scope flags
  program
    .option('--global', 'Install globally (~/.claude/, ~/.copilot/, ~/.codex/)')
    .option('--local', 'Install locally (.claude/, .github/, .codex/)');

  // Other flags
  program
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('--dry-run', 'Show what would be installed without writing files')
    .option('-v, --verbose', 'Show detailed output')
    .option('--check-updates', 'Check for updates without installing')
    .option('--custom-path <path>', 'Additional search path for installations');

  program.parse(process.argv);
  const options = program.opts();

  // Validate --custom-path usage
  const customPathArgs = process.argv.filter(arg => 
    arg.startsWith('--custom-path')
  );

  if (customPathArgs.length > 1) {
    console.error('');
    console.error('Error: --custom-path can only be specified once.');
    console.error('To check additional paths, run the installer separately for each path.');
    console.error('');
    console.error('Example:');
    console.error('  npx get-shit-done-multi --custom-path=/path1');
    console.error('  npx get-shit-done-multi --custom-path=/path2');
    console.error('');
    process.exit(1);
  }

  // Handle --check-updates flag
  if (options.checkUpdates) {
    await handleCheckUpdates(options, pkg);
    process.exit(0);
  }

  // Parse platforms
  const platforms = parsePlatformFlags(options, adapterRegistry);

  // Show banner with version and context
  showBannerWithContext(__dirname, pkg.version);

  // Check for interactive mode
  if (shouldUseInteractiveMode(platforms, isValidTTY())) {
    await runInteractive(pkg.version, {
      verbose: options.verbose || false,
      customPath: options.customPath || null
    });
  } else {
    // Non-interactive without flags - show usage
    if (platforms.length === 0 && !isValidTTY()) {
      showUsageError();
      process.exit(EXIT_CODES.INVALID_ARGS);
    }

    // Parse scope and execute installation loop
    const scope = parseScope(options);
    await executeInstallationLoop(platforms, scope, pkg.version, {
      scriptDir: __dirname,
      verbose: options.verbose || false,
      customPath: options.customPath || null
    });
  }

  showNextSteps(platforms, 1);
}

// Execute with proper error handling
main().catch(error => {
  if (error instanceof InstallError) {
    logger.error(error.message);
    if (error.details) {
      logger.verbose(JSON.stringify(error.details, null, 2), true);
    }
    process.exit(error.code);
  } else {
    logger.error(`Unexpected error: ${error.message}`);
    console.error(error.stack);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
});
