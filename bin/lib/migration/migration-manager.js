// bin/lib/migration/migration-manager.js

import * as p from '@clack/prompts';
import * as logger from '../cli/logger.js';
import { detectOldVersion } from '../version/old-version-detector.js';
import { createBackupDirectory, validateBackupSpace, createBackup } from './backup-manager.js';
import { getPlatformName } from '../platforms/platform-names.js';
import { remove } from 'fs-extra';
import { resolve } from 'path';

/**
 * Prompt user for migration confirmation
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} oldVersion - Version being migrated from
 * @param {string} backupPath - Path where backup will be created
 * @param {Object} options - Prompt options
 * @returns {Promise<boolean>} User confirmed
 */
export async function promptMigration(platform, oldVersion, backupPath, options = {}) {
  // Show warning banner
  console.log();
  logger.warnSubtitle(`${getPlatformName(platform)} Upgrade`, 0, 80, true);

  // Show detailed steps (CONTEXT D1.3)
  logger.info('What will happen:', 2);
  logger.listItem(`Backup v${oldVersion} to ${backupPath}`, 4);
  logger.listItem('Remove old files', 4);
  logger.listItem('Install v2.0.0', 4);
  console.log();

  // Simple Yes/No confirmation (CONTEXT D1.2)
  const confirmed = await p.confirm({
    message: 'Create backup and upgrade?',
    initialValue: true
  });

  if (p.isCancel(confirmed)) {
    p.cancel('Installation cancelled.');
    return false;
  }

  return confirmed;
}

/**
 * Show backup success message
 * @param {string} backupPath - Path to created backup
 * @returns {void}
 */
export async function showBackupSuccess(backupPath) {
  console.log();
  logger.success(`Backup created: ${backupPath}`, 1);
  logger.info('You can delete this manually after verifying the installation.', 1);
  console.log();
}

/**
 * Show backup failure message
 * @param {Error} error - Error that occurred
 * @param {string|null} partialBackupPath - Path to partial backup if applicable
 * @returns {void}
 */
export async function showBackupFailure(error, partialBackupPath = null) {
  console.log();
  if (partialBackupPath) {
    // Partial backup scenario (CONTEXT D3.2)
    logger.error('⚠ Backup incomplete');
    logger.warn(`Partial backup saved to: ${partialBackupPath}`, 2);
    logger.warn('Installation cancelled. Your old version is unchanged.', 2);
  } else {
    // Full failure scenario (CONTEXT D3.1)
    logger.error(`✗ Backup failed: ${error.message}`);
    logger.warn('Your old installation is unchanged.', 2);
    logger.info('Please fix the issue and try again.', 2);
  }
  console.log();
}

/**
 * Perform migration from old version to v2.0.0
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} oldVersion - Version being migrated from
 * @param {string} targetDir - Base directory
 * @param {Object} options - Migration options
 * @param {string} [options.sharedBackupDir] - Shared backup directory for all migrations
 * @returns {Promise<{success: boolean, backupPath?: string, backupDir?: string, error?: string}>}
 */
export async function performMigration(platform, oldVersion, targetDir, options = {}) {
  try {
    // 1. Get old installation paths
    const { paths } = await detectOldVersion(platform, targetDir);
    if (!paths || paths.length === 0) {
      return { success: false, error: 'No old files found' };
    }

    // 2. Use shared backup directory or create new one (only once)
    let backupDir = options.sharedBackupDir;
    if (!backupDir) {
      backupDir = await createBackupDirectory(oldVersion, targetDir);
    }

    // 3. Prompt user (unless skipPrompts)
    if (!options.skipPrompts) {
      const confirmed = await promptMigration(platform, oldVersion, backupDir, options);
      if (!confirmed) {
        return { success: false, error: 'User declined' };
      }
    }

    // 4. Create backup (with disk space check) - reuse the same backupDir
    const result = await createBackup(platform, oldVersion, paths, targetDir, backupDir);

    // 5. Show result
    if (result.success) {
      await showBackupSuccess(result.backupPath);

      // Remove old files after successful backup
      for (const path of paths) {
        try {
          // Resolve relative paths against targetDir
          const fullPath = resolve(targetDir, path);
          await remove(fullPath);
        } catch (error) {
          // Log but don't fail if removal fails
          logger.warn(`Could not remove ${path}: ${error.message}`, 2);
        }
      }

      return { success: true, backupPath: result.backupPath, backupDir };
    } else {
      await showBackupFailure(new Error('Copy failed'), result.backupPath);
      return { success: false, error: 'Backup failed', backupPath: result.backupPath };
    }
  } catch (error) {
    // Disk space errors or permission errors
    if (error.name === 'InstallError') {
      await showBackupFailure(error, null);
      return { success: false, error: error.message };
    }

    // Unexpected errors
    await showBackupFailure(error, null);
    return { success: false, error: error.message };
  }
}
