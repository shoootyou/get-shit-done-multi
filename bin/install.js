#!/usr/bin/env node

/**
 * get-shit-done-multi installer
 * Entry point for npx get-shit-done-multi
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { InstallError, EXIT_CODES } from './lib/errors/install-error.js';
import * as logger from './lib/cli/logger.js';
import { adapterRegistry } from './lib/platforms/registry.js';
import { runInteractive } from './lib/cli/interactive.js';
import { installPlatforms, getScriptDir } from './lib/cli/installation-core.js';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

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
    .option('-v, --verbose', 'Show detailed output');
  
  program.parse(process.argv);
  const options = program.opts();
  
  // Determine platforms to install
  const platforms = [];
  if (options.claude) platforms.push('claude');
  if (options.copilot) platforms.push('copilot');
  if (options.codex) platforms.push('codex');
  
  // Check for interactive mode eligibility
  const hasFlags = platforms.length > 0;
  const isInteractive = !hasFlags && process.stdin.isTTY;
  
  if (isInteractive) {
    // Phase 4: Interactive mode
    await runInteractive(options);
    process.exit(0);
  } else if (!hasFlags && !process.stdin.isTTY) {
    // No flags and no TTY - show usage
    logger.error('No platform specified and not running in interactive mode.');
    logger.info('Usage: npx get-shit-done-multi --claude --global');
    logger.info('   or: npx get-shit-done-multi (interactive mode in terminal)');
    process.exit(EXIT_CODES.INVALID_ARGS);
  }
  
  // Validate platforms
  const supported = adapterRegistry.getSupportedPlatforms();
  for (const platform of platforms) {
    if (!supported.includes(platform)) {
      logger.error(`Unknown platform: ${platform}. Supported: ${supported.join(', ')}`);
      process.exit(EXIT_CODES.INVALID_ARGS);
    }
  }
  
  // Determine scope (default: local)
  const isGlobal = options.global === true;
  const isLocal = options.local === true;
  
  if (isGlobal && isLocal) {
    logger.error('Cannot specify both --global and --local');
    process.exit(EXIT_CODES.INVALID_ARGS);
  }
  
  const scope = isGlobal ? 'global' : 'local';
  
  // Use shared installation core (same path as interactive mode)
  await installPlatforms(platforms, scope, {
    scriptDir: __dirname,
    verbose: options.verbose || false,
    useProgressBars: true,
    showBanner: true
  });
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
