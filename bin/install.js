#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { install } from './lib/installer/installer.js';
import { detectAllInstallations } from './lib/platforms/platform-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('get-shit-done-multi')
  .description('Install GSD skills and agents to AI coding assistants')
  .option('--claude', 'Install to Claude Code (~/.claude/)')
  .option('--local', 'Install to current directory (./.claude/) instead of global (~/.claude/)')
  .option('--no-color', 'Disable colored output')
  .option('-v, --version', 'Show version and detected installations')
  .addHelpText('after', `
Examples:
  $ npx get-shit-done-multi --claude
  $ npx get-shit-done-multi --claude --local
  
Phase 1 supports Claude Code only. Copilot and Codex support coming in Phase 2.
  `)
  .action(async (options) => {
    try {
      // Handle --version manually
      if (options.version) {
        console.log(`get-shit-done-multi v${packageJson.version}\n`);
        
        const installations = await detectAllInstallations();
        if (installations.length > 0) {
          console.log('Detected installations:');
          installations.forEach(inst => {
            console.log(`  - ${inst.platform} (${inst.scope}): ${inst.skillCount} skills at ${inst.path}`);
          });
        } else {
          console.log('No existing installations detected.');
        }
        
        process.exit(0);
      }
      
      await install(options);
      process.exit(0);
    } catch (error) {
      // Error already formatted and logged by installer
      process.exit(1);
    }
  });

// Handle invalid flags with suggestions (Commander does this automatically)
program.showHelpAfterError('(add --help for additional information)');

program.parse();
