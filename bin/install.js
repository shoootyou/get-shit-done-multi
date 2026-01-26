#!/usr/bin/env node

/**
 * get-shit-done-multi installer
 * Entry point for npx get-shit-done-multi
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { InstallError, EXIT_CODES } from './lib/errors/install-error.js';
import * as logger from './lib/cli/logger.js';
import { install } from './lib/installer/orchestrator.js';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const program = new Command();
  
  program
    .name('get-shit-done-multi')
    .version('2.0.0')
    .description('Install get-shit-done skills and agents to AI coding assistants')
    .requiredOption('--claude', 'Install for Claude Code')
    .option('--global', 'Install globally to ~/.claude/ (default: local)')
    .option('--local', 'Install locally to .claude/ (explicit)')
    .option('--verbose', 'Show detailed file-by-file progress')
    .parse(process.argv);

  const options = program.opts();
  
  // Validate flags
  if (!options.claude) {
    logger.error('Missing required flag: --claude');
    logger.info('Usage: npx get-shit-done-multi --claude [--global|--local] [--verbose]');
    process.exit(EXIT_CODES.INVALID_ARGS);
  }
  
  // Determine scope (default to local if neither specified)
  const isGlobal = options.global === true;
  const isLocal = options.local === true;
  
  if (isGlobal && isLocal) {
    logger.error('Cannot specify both --global and --local');
    process.exit(EXIT_CODES.INVALID_ARGS);
  }
  
  // Show banner
  logger.banner();
  logger.info(`Installing to Claude Code (${isGlobal ? 'global' : 'local'})`);
  
  // Run installation
  const stats = await install({
    platform: 'claude',
    isGlobal,
    isVerbose: options.verbose || false,
    scriptDir: __dirname
  });
  
  // Show summary
  logger.summary(stats);
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
