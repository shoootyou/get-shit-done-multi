// bin/lib/installer/orchestrator.js

/**
 * File Orchestrator
 * 
 * Responsibilities:
 * - Load templates based on platform/scope
 * - Process files (copy, modify, generate)
 * - Create installation manifests
 * - Manage file transactions
 * 
 * Non-responsibilities (handled in pre-flight):
 * - Path validation (see preflight/pre-flight-validator.js)
 * - Disk space checks
 * - Permission verification
 * - Template existence checks
 */

import { join, basename, dirname } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import { resolveTargetDirectory, getTemplatesDirectory, validatePath } from '../paths/path-resolver.js';
import { copyDirectory, ensureDirectory, writeFile, pathExists } from '../io/file-operations.js';
import { renderTemplate, findUnknownVariables, replaceVariables } from '../rendering/template-renderer.js';
import { cleanFrontmatter } from '../rendering/frontmatter-cleaner.js';
import { createMultiBar, displayCompletionLine } from '../cli/progress.js';
import { installAgents } from './install-agents.js';
import { installSkills } from './install-skills.js';
import { installShared } from './install-shared.js';
import { installPlatformInstructions } from './install-platform-instructions.js';
import * as logger from '../cli/logger.js';
import { missingTemplates, invalidPath } from '../errors/install-error.js';
import { readdir, readFile, writeFile as fsWriteFile } from 'fs/promises';
import yaml from 'js-yaml';
import { detectExistingInstallation } from '../validation/pre-install-checks.js';
import { generateManifestData, writeManifest } from '../manifests/writer.js';
import { compareVersions } from '../version/version-checker.js';
import { readManifest } from '../manifests/reader.js';
import { repairManifest } from '../manifests/repair.js';
import { isRepairableError } from '../manifests/schema.js';
import { confirm } from '@clack/prompts';
import { detectOldVersion } from '../version/old-version-detector.js';
import { performMigration } from '../migration/migration-manager.js';
import { isSymlink, resolveSymlinkSingleLevel } from '../paths/symlink-resolver.js';

/**
 * Main installation orchestrator
 * @param {string} appVersion - Application version
 * @param {Object} options - Installation options
 * @param {string} options.platform - Platform name (claude/copilot/codex)
 * @param {PlatformAdapter} options.adapter - Platform adapter instance
 * @param {boolean} options.isGlobal - Global vs local installation
 * @param {boolean} options.isVerbose - Verbose output
 * @param {string} options.scriptDir - Script directory path
 * @param {string} [options.targetDir] - Override target directory (for testing)
 * @param {boolean} [options.skipPrompts] - Skip confirmation prompts (for -y flag)
 * @returns {Promise<Object>} Installation statistics
 */
export async function install(appVersion, options) {
  const { platform, adapter, isGlobal, isVerbose, scriptDir, targetDir: targetDirOverride, skipPrompts } = options;

  // Determine target directory
  const targetBase = adapter.getTargetDir(isGlobal);
  const targetDir = targetDirOverride || (isGlobal
    ? join(homedir(), targetBase.replace('~/', ''))
    : targetBase);

  const templatesDir = getTemplatesDirectory(scriptDir);

  // === NEW: Symlink detection and confirmation (Phase 7) ===
  await checkSymlinkAndConfirm(targetDir, skipPrompts);

  // === NEW: Old version migration check (Phase 6.1) ===
  const oldVersionResult = await detectOldVersion(platform, targetDir);

  if (oldVersionResult.isOld) {
    const migrationResult = await performMigration(
      platform,
      oldVersionResult.version,
      targetDir,
      { skipPrompts }
    );

    if (!migrationResult.success) {
      // Migration failed or user declined
      if (migrationResult.error === 'User declined') {
        logger.info('Installation cancelled. Your v1.x installation remains unchanged.', 2);
        process.exit(0);
      } else {
        logger.error(`Migration failed: ${migrationResult.error}`, 2);
        logger.warn('Your v1.x installation remains unchanged.', 2);
        process.exit(1);
      }
    }

    // Migration successful - continue with regular installation
    logger.success('Migration complete. Proceeding with v2.0.0 installation...');
    console.log();
  }

  // === NEW: Version validation gate (Phase 6) ===
  await validateVersionBeforeInstall(platform, targetDir, appVersion, { skipPrompts });

  // Get command prefix and path reference for variable replacement
  const commandPrefix = adapter.getCommandPrefix();
  const pathReference = adapter.getPathReference();

  const templateVars = {
    PLATFORM_ROOT: pathReference,
    COMMAND_PREFIX: commandPrefix,
    VERSION: `${appVersion}`,
    PLATFORM_NAME: platform
  };

  // Always show these informational lines - they provide useful context
  logger.info(`Target directory: ${targetDir}`, 2);
  logger.info(`Command prefix: ${commandPrefix}`, 2);

  // Detect existing installation (info only, doesn't fail)
  const existingInstall = await detectExistingInstallation(targetDir);

  // Collect warnings for display
  const allWarnings = [];

  // Add existing installation warnings
  if (existingInstall) {
    allWarnings.push(`Existing installation detected (v${existingInstall.version})`);
    allWarnings.push('Installation will overwrite existing files');
  }

  // Display warnings in a single block
  if (allWarnings.length > 0) {
    if (!isVerbose) {
      // Non-verbose: simple list with ⚠ symbol
      allWarnings.forEach(warning => logger.warn(warning, 2));
    } else {
      // Verbose: subtitle + list items
      console.log();
      logger.warnSubtitle('Warnings', 0, 80, true);
      allWarnings.forEach(warning => logger.listItem(warning, 2));
    }
  } else if (isVerbose) {
    // Only show "no warnings" in verbose mode
    console.log();
    logger.infoSubtitle('Info');
    logger.listItem('No existing installation found', 2);
  }

  // Create target directory
  await ensureDirectory(targetDir);

  // Initialize progress tracking
  const stats = { skills: 0, agents: 0, shared: 0, target: targetDir };

  if (!isVerbose) {
    console.log();
    logger.simpleSubtitle('Installed components');
    // Simple completion line display for non-verbose mode
    try {
      // Phase 1: Install skills
      stats.skills = await installSkills(templatesDir, targetDir, templateVars, null, isVerbose, platform);
      displayCompletionLine('Skills', stats.skills, stats.skills);

      // Phase 2: Install agents
      stats.agents = await installAgents(templatesDir, targetDir, templateVars, null, isVerbose, adapter);
      displayCompletionLine('Agents', stats.agents, stats.agents);

      // Phase 3: Install shared directory
      stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
      displayCompletionLine('Shared', stats.shared, stats.shared);

      // Phase 4: Install platform instructions
      stats.instructions = await installPlatformInstructions(
        templatesDir,
        targetDir,
        templateVars,
        null,
        isVerbose,
        adapter
      );
      displayCompletionLine('Platform Instructions', stats.instructions, stats.instructions);
    } catch (error) {
      throw error;
    }
  } else {
    // Verbose mode: no progress bars, show files
    console.log();
    logger.simpleSubtitle('Installing Skills');
    stats.skills = await installSkills(templatesDir, targetDir, templateVars, null, isVerbose, platform);

    console.log();
    logger.simpleSubtitle('Installing Agents');
    stats.agents = await installAgents(templatesDir, targetDir, templateVars, null, isVerbose, adapter);

    console.log();
    logger.simpleSubtitle('Installing Shared Directory');
    stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
  }

  // Generate manifest after successful installation (Phase 5)
  const manifestPath = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
  const manifestData = await generateManifestData(targetDir, appVersion, platform, isGlobal);
  await writeManifest(manifestPath, manifestData);

  return stats;
}

/**
 * Check for symlinks and get user confirmation
 * @param {string} targetDir - Directory to check
 * @param {boolean} skipPrompts - Skip prompts (for -y flag or non-interactive)
 * @returns {Promise<void>}
 * @throws {Error} If user cancels or symlinks not allowed in non-interactive mode
 */
async function checkSymlinkAndConfirm(targetDir, skipPrompts = false) {
  if (await isSymlink(targetDir)) {
    const symlinkInfo = await resolveSymlinkSingleLevel(targetDir);

    // Non-interactive mode skips all prompts including symlink confirmations
    const allowSymlinks = skipPrompts;

    if (!allowSymlinks) {
      // Interactive mode - prompt for confirmation
      console.log(''); // blank line
      logger.warn(`⚠ Symlink detected in installation path`);
      console.log(`  Path: ${targetDir}`);
      console.log(`  Points to: ${symlinkInfo.target}`);
      console.log('');

      const confirmed = await confirm({
        message: 'Installation will write files to the symlink target. Continue?',
        initialValue: false
      });

      if (!confirmed) {
        logger.info('Installation cancelled.', 2);
        process.exit(0);
      }
    } else {
      // Non-interactive mode or skipPrompts - just log
      logger.warn(`⚠ Symlink detected: ${targetDir} → ${symlinkInfo.target}`, 2);
    }
  }
}

/**
 * Validate version before installation
 * Blocks downgrades, warns on major updates, asks about customizations
 * @param {string} platform - Platform name
 * @param {string} targetDir - Target installation directory
 * @param {string} currentVersion - Version being installed
 * @param {Object} options - Options
 * @param {boolean} [options.skipPrompts] - Skip confirmation prompts
 */
async function validateVersionBeforeInstall(platform, targetDir, currentVersion, options = {}) {
  // Construct manifest path
  const manifestPath = join(targetDir, '.gsd-install-manifest.json');

  // Try to read existing manifest
  let manifestResult = await readManifest(manifestPath);

  // If corrupt or invalid schema, try to repair
  if (!manifestResult.success && isRepairableError(manifestResult.reason)) {
    manifestResult = await repairManifest(manifestPath);
  }

  if (!manifestResult.success) {
    // No existing installation or unreadable - proceed normally
    return;
  }

  const manifest = manifestResult.manifest;
  const versionStatus = compareVersions(manifest.gsd_version, currentVersion);

  // Get platform display name
  const platformNames = {
    'claude': 'Claude Code',
    'copilot': 'GitHub Copilot',
    'codex': 'Codex'
  };
  const platformDisplay = platformNames[platform] || platform;

  // Block downgrades completely
  if (versionStatus.status === 'downgrade') {
    const errorMessage = `
Cannot downgrade GSD installation for ${platformDisplay}

  Installed: v${versionStatus.installed}
  Installer: v${versionStatus.current}

Downgrades are not supported. To use the latest version:

  npx get-shit-done-multi@latest

Or install a specific version:

  npx get-shit-done-multi@${versionStatus.installed}
    `.trim();

    throw new Error(errorMessage);
  }

  // Warn on major version updates
  if (versionStatus.status === 'major_update' && !options.skipPrompts) {
    console.log('');
    console.log(chalk.yellow(`⚠️  Major version update detected for ${platformDisplay}`));
    console.log('');
    console.log(chalk.dim(`   v${versionStatus.installed} → v${versionStatus.current}`));
    console.log('');
    console.log('   Major updates may include breaking changes.');
    console.log('   Your existing workflows might need updates.');
    console.log('');

    const confirmed = await confirm({
      message: `Continue with major version update for ${platformDisplay}?`,
      initialValue: true
    });

    if (!confirmed || confirmed === Symbol.for('clack:cancel')) {
      throw new Error(`Update cancelled for ${platformDisplay}`);
    }
  }

  // Ask about customization preservation
  if ((versionStatus.status === 'update_available' || versionStatus.status === 'major_update') && !options.skipPrompts) {
    console.log('');
    const preserveCustomizations = await confirm({
      message: `Preserve customizations for ${platformDisplay}?`,
      initialValue: true
    });

    if (preserveCustomizations && preserveCustomizations !== Symbol.for('clack:cancel')) {
      console.log('');
      console.log(chalk.dim('💡 Consider contributing your improvements:'));
      console.log(chalk.dim('   https://github.com/shoootyou/get-shit-done-multi'));
      console.log('');

      // Note: preserveCustomizations flag would be passed through to file operations
      // For now, we're just informing the user - actual preservation logic
      // would need to be implemented in file-operations.js
      logger.info('Note: Customization preservation not yet fully implemented', 2);
    }
  }
}
