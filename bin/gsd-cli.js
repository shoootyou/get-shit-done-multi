#!/usr/bin/env node

/**
 * GSD CLI Entry Point
 * Main entry point for GSD command execution across all CLIs
 * @module gsd-cli
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { loadCommands } from './lib/command-system/loader.js';
import { executeCommand } from './lib/command-system/executor.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main CLI execution function
 */
async function main() {
  try {
    // Construct path to commands directory
    const commandsDir = join(__dirname, '..', 'commands', 'gsd');
    
    // Load all commands from filesystem
    const commandCount = await loadCommands(commandsDir);
    
    // Parse command-line arguments
    const { positionals } = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      strict: false
    });
    
    // Check if command was provided
    if (positionals.length === 0) {
      console.error('❌ No command provided\n');
      console.error('Usage: gsd-cli <command> [args...]\n');
      console.error('Example: gsd-cli gsd:help\n');
      console.error('\nRun "gsd-cli gsd:help" to see all available commands.');
      process.exit(1);
    }
    
    // Extract command name and arguments
    const commandName = positionals[0];
    const commandArgs = positionals.slice(1);
    
    // Execute the command
    await executeCommand(commandName, commandArgs);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main function with top-level await
main();
