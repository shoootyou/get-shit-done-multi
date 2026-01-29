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
import { validateCustomPathWithPlatforms } from './lib/validation/cli-validator.js';
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
import { checkAndMigrateOldVersions } from './lib/migration/migration-orchestrator.js';

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
    .addHelpText('after', '\nRun without flags for interactive mode with beautiful prompts.\nUse --all to install to all platforms at once.');

  // Platform flags
  program
    .option('--claude', 'Install to Claude Code')
    .option('--copilot', 'Install to GitHub Copilot CLI')
    .option('--codex', 'Install to Codex CLI')
    .option('--all', 'Install to all platforms (claude, copilot, codex)');

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

  // Error if --custom-path is specified more than once
  if (customPathArgs.length > 1) {
    multipleDirectoryErrors();
    process.exit(1);
  }

  // Parse platforms (needed for validation)
  const platforms = parsePlatformFlags(options, adapterRegistry);

  // Validate custom-path with multiple platforms (prevent data loss)
  try {
    validateCustomPathWithPlatforms(platforms, options.customPath);
  } catch (error) {
    logger.error(error.message, 2, true);
    process.exit(EXIT_CODES.INVALID_ARGS);
  }

  // Handle --check-updates flag
  if (options.checkUpdates) {
    await handleCheckUpdates(options, pkg);
    process.exit(0);
  }

  // After parsing flags, start the flow starting with the banner
  banner(pkg.version, true);

  // Check for old versions and migrate if needed (Phase 6.1)
  const migrationResult = await checkAndMigrateOldVersions('.', { skipPrompts: false });

  // Handle migration result
  if (!migrationResult.success) {
    if (migrationResult.cancelled) {
      logger.info('Installation cancelled by user.');
      process.exit(0);
    } else {
      logger.error(`Migration failed: ${migrationResult.error}`);
      process.exit(1);
    }
  }

  // Continue with the regular flow after migration
  showTemplatePath(__dirname);

  // Check for interactive mode
  let isInteractive = shouldUseInteractiveMode(platforms, isValidTTY())

  // Execute interactive mode
  if (isInteractive) {
    await runInteractive(pkg.version, {
      verbose: options.verbose || false,
      customPath: options.customPath || null
    });
  }

  // Execute non-interactive mode
  if (!isInteractive) {
    // Validate that at least one platform is specified
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
    logger.error(`Unexpected error: ${error.message}`, 2, true);
    logger.error(error.stack, 2, true);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
});
