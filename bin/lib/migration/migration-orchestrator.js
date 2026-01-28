/**
 * Migration Orchestrator
 * 
 * Coordinates detection and migration of old v1.x installations across all platforms.
 * Handles sequential migration with user prompts and error handling.
 */

import * as logger from '../cli/logger.js';
import { detectAllOldVersions } from '../version/old-version-detector.js';
import { performMigration } from './migration-manager.js';

/**
 * Check for old v1.x versions and migrate them to v2.0.0
 * 
 * @param {string} cwd - Current working directory
 * @param {object} options - Options
 * @param {boolean} options.skipPrompts - Skip user confirmation prompts
 * @returns {Promise<{success: boolean, migrationsPerformed: number, cancelled: boolean, error: string|null}>}
 */
export async function checkAndMigrateOldVersions(cwd, options = {}) {
  const { skipPrompts = false } = options;

  // Detect all old versions
  const oldVersions = await detectAllOldVersions(cwd);

  // No old versions found - success
  if (oldVersions.length === 0) {
    return {
      success: true,
      migrationsPerformed: 0,
      cancelled: false,
      error: null
    };
  }

  // Display detected old versions
  console.log();
  logger.warnSubtitle('Old Versions Detected', 0, 80, true);

  for (const old of oldVersions) {
    logger.warn(`${old.platform}: v${old.version} (incompatible with v2.0.0)`, 2);
  }

  // Migrate each platform sequentially
  let migrationsPerformed = 0;

  for (const old of oldVersions) {
    const migrationResult = await performMigration(
      old.platform,
      old.version,
      cwd,
      { skipPrompts }
    );

    // Handle migration failure
    if (!migrationResult.success) {
      if (migrationResult.error === 'User declined') {
        return {
          success: false,
          migrationsPerformed,
          cancelled: true,
          error: 'User declined migration'
        };
      } else {
        return {
          success: false,
          migrationsPerformed,
          cancelled: false,
          error: migrationResult.error || 'Migration failed'
        };
      }
    }

    migrationsPerformed++;
  }

  // All migrations complete
  logger.success('All migrations complete. Continuing with v2.0.0 installation...', 1);

  return {
    success: true,
    migrationsPerformed,
    cancelled: false,
    error: null
  };
}
