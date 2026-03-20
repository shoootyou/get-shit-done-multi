#!/usr/bin/env node

/**
 * get-shit-done-multi installer
 * Entry point for npx get-shit-done-multi
 */

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { readFile } from "fs/promises";
import chalk from 'chalk';
import { banner } from './lib/cli/banner-manager.js';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from package.json (ESM-safe)
const pkgPath = resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

// Show banner and deprecation notice
banner(pkg.version, false);

console.log();
console.log(chalk.yellow.bold('  ⚠  This package has been deprecated'));
console.log();
console.log(chalk.white('  GitHub Copilot support and /gsd-autonomous have been merged'));
console.log(chalk.white('  into the official repository.'));
console.log();
console.log(chalk.white('  Please switch to the official package:'));
console.log(chalk.cyan.bold('  → https://github.com/gsd-build/get-shit-done'));
console.log();
console.log(chalk.white('  To install:'));
console.log(chalk.green('    npx get-shit-done-cc@latest'));
console.log();
console.log(chalk.white('  For GitHub Copilot:'));
console.log(chalk.green('    npx get-shit-done-cc@latest --copilot'));
console.log();
console.log(chalk.dim('  This repository is archived and will no longer receive updates.'));
console.log();

process.exit(0);
