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
import { multipleDirectoryErrors } from './lib/errors/directory-error.js';
import * as logger from './lib/cli/logger.js';
import { adapterRegistry } from './lib/platforms/registry.js';
import { runInteractive } from './lib/cli/interactive.js';
import { showUsageError } from './lib/cli/usage.js';
import { parsePlatformFlags, parseScope } from './lib/cli/flag-parser.js';
import { shouldUseInteractiveMode, isValidTTY } from './lib/cli/mode-detector.js';
import { showNextSteps } from './lib/cli/next-steps.js';
import { banner, showTemplatePath } from './lib/cli/banner-manager.js';
import { executeInstallationLoop } from './lib/cli/install-loop.js';
import { handleCheckUpdates } from './lib/updater/check-update.js';
import { detectAllOldVersions } from './lib/version/old-version-detector.js';
import { performMigration } from './lib/migration/migration-manager.js';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from package.json (ESM-safe)
const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

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
    .option('--local', 'Install locally (.claude/, .github/, .codex/)')
    .option('--custom-path <path>', 'Additional path for installations');

  // Other flags
  program
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-v, --verbose', 'Show detailed output')
    .option('--check-updates', 'Check for updates without installing');

  program.parse(process.argv);
  const options = program.opts();

  // Validate --custom-path usage
  const customPathArgs = process.argv.filter(arg =>
    arg.startsWith('--custom-path')
  );

  if (customPathArgs.length > 1) {
    multipleDirectoryErrors();
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
  banner(pkg.version, true);

  // === NEW: Check for old versions across all platforms (Phase 6.1) ===
  const oldVersions = await detectAllOldVersions('.');

  if (oldVersions.length > 0) {
    // Show detected old versions
    console.log();
    logger.warnSubtitle('Old Versions Detected', 0, 80, true);

    for (const old of oldVersions) {
      logger.warn(`${old.platform}: v${old.version} (incompatible with v2.0.0)`, 2);
    }
    console.log();

    // Migrate each platform
    for (const old of oldVersions) {
      const migrationResult = await performMigration(
        old.platform,
        old.version,
        '.',
        { skipPrompts: false }
      );

      if (!migrationResult.success) {
        if (migrationResult.error === 'User declined') {
          p.cancel('Installation cancelled.');
          process.exit(0);
        } else {
          p.cancel(`Migration failed: ${migrationResult.error}`);
          process.exit(1);
        }
      }
    }

    logger.success('All migrations complete. Continuing with v2.0.0 installation...');
    console.log();
  }

  // Show templates path
  showTemplatePath( __dirname);

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

  showNextSteps(platforms);
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
