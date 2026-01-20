/**
 * Command System Verifier - Validates command system installation and accessibility
 * Implements INSTALL-08 requirement for post-install verification
 * @module command-system/verifier
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { registry } from './registry.js';
import { loadCommands } from './loader.js';

// Import from Phase 1 (CommonJS)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { getConfigPaths } = require('../paths.js');

/**
 * Verify all commands are loaded and properly formatted
 * Checks command count, metadata fields, and registry state
 * @returns {Promise<{success: boolean, commandCount: number, issues: string[]}>} Verification result
 */
export async function verifyCommands() {
  const issues = [];
  
  // Get all registered commands
  const commands = registry.list();
  const commandCount = commands.length;
  
  // Expected command count (24 GSD commands)
  const expectedCount = 24;
  if (commandCount !== expectedCount) {
    issues.push(`Expected ${expectedCount} commands, found ${commandCount}`);
  }
  
  // Verify each command has required metadata
  for (const commandName of commands) {
    const command = registry.get(commandName);
    
    if (!command) {
      issues.push(`Command ${commandName} is listed but not retrievable`);
      continue;
    }
    
    const { metadata, handler } = command;
    
    // Check required metadata fields
    if (!metadata.name && !commandName) {
      issues.push(`Command ${commandName} missing name in metadata`);
    }
    
    if (!metadata.description) {
      issues.push(`Command ${commandName} missing description`);
    }
    
    // Verify handler is a function
    if (typeof handler !== 'function') {
      issues.push(`Command ${commandName} handler is not a function`);
    }
  }
  
  return {
    success: issues.length === 0 && commandCount === expectedCount,
    commandCount,
    issues
  };
}

/**
 * Verify command files are accessible in CLI-specific installation directory
 * Checks that commands exist in the correct location for the given CLI
 * @param {string} cli - CLI name ('claude', 'copilot', or 'codex')
 * @returns {Promise<{accessible: boolean, cli: string, path: string, fileCount: number}>} Accessibility result
 */
export async function verifyCommandAccessibility(cli) {
  try {
    // Get CLI-specific paths
    const paths = getConfigPaths(cli);
    
    // Determine command directory based on CLI
    let commandPath;
    if (cli === 'claude') {
      // Claude global install: ~/Library/Application Support/Claude/get-shit-done/commands/gsd/
      commandPath = join(paths.global, 'get-shit-done', 'commands', 'gsd');
    } else if (cli === 'copilot') {
      // Copilot local install: .github/skills/get-shit-done/commands/gsd/
      commandPath = join(paths.local, 'skills', 'get-shit-done', 'commands', 'gsd');
    } else if (cli === 'codex') {
      // Codex local install: .codex/skills/get-shit-done/commands/gsd/
      commandPath = join(paths.local, 'skills', 'get-shit-done', 'commands', 'gsd');
    } else {
      return {
        accessible: false,
        cli,
        path: 'unknown',
        fileCount: 0,
        error: `Unknown CLI: ${cli}`
      };
    }
    
    // Check if directory exists
    if (!existsSync(commandPath)) {
      return {
        accessible: false,
        cli,
        path: commandPath,
        fileCount: 0,
        error: 'Command directory does not exist'
      };
    }
    
    // Count .md files in directory
    const files = await readdir(commandPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    return {
      accessible: mdFiles.length > 0,
      cli,
      path: commandPath,
      fileCount: mdFiles.length
    };
    
  } catch (error) {
    return {
      accessible: false,
      cli,
      path: 'error',
      fileCount: 0,
      error: error.message
    };
  }
}
