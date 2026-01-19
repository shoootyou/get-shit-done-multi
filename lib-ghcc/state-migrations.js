import { atomicWriteJSON, atomicReadJSON } from './state-io.js';
import { mkdir, cp, access } from 'fs/promises';
import { join } from 'path';

/**
 * Current state schema version
 * Increment when state format changes
 */
export const CURRENT_STATE_VERSION = 1;

/**
 * Migration functions keyed by version
 * Each function migrates from version N to N+1
 * 
 * Example future migration:
 * migrations[1] = async (stateDir) => {
 *   // Migrate from v1 to v2
 *   const statePath = join(stateDir, 'STATE.json');
 *   const state = await atomicReadJSON(statePath);
 *   state.newField = 'default';
 *   await atomicWriteJSON(statePath, state);
 * };
 */
const migrations = {};

/**
 * Migrate state to current version
 * 
 * Creates backup before migration and applies sequential migrations
 * from current version to CURRENT_STATE_VERSION.
 * 
 * @param {string} stateDir - Path to .planning directory
 * @returns {Promise<void>}
 */
export async function migrateState(stateDir = '.planning') {
  // Read current version from .meta.json
  const metaPath = join(stateDir, '.meta.json');
  let currentVersion;
  
  try {
    const meta = await atomicReadJSON(metaPath);
    currentVersion = meta.version || 0;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // No meta file means pre-versioning (v0)
      currentVersion = 0;
    } else {
      throw error;
    }
  }

  // If already at current version, no-op
  if (currentVersion === CURRENT_STATE_VERSION) {
    return;
  }

  // Create backup before migration
  const backupDir = join(stateDir, `backup-v${currentVersion}-${Date.now()}`);
  await mkdir(backupDir, { recursive: true });
  
  // Copy all files except existing backups
  await cp(stateDir, backupDir, {
    recursive: true,
    filter: (src) => {
      // Exclude backup directories from backup
      return !src.includes('backup-');
    }
  });

  // Apply migrations sequentially
  for (let v = currentVersion; v < CURRENT_STATE_VERSION; v++) {
    const migration = migrations[v];
    if (migration) {
      await migration(stateDir);
    }
  }

  // Update .meta.json with new version
  await atomicWriteJSON(metaPath, {
    version: CURRENT_STATE_VERSION,
    migratedAt: Date.now()
  });
}

/**
 * Validate state directory structure and integrity
 * 
 * Checks:
 * - .planning/ directory exists
 * - .meta.json has valid version
 * - STATE.md and config.json are parseable (if they exist)
 * 
 * @param {string} stateDir - Path to .planning directory
 * @returns {Promise<object>} Validation result: { valid: boolean, errors: string[], warnings: string[] }
 */
export async function validateState(stateDir = '.planning') {
  const errors = [];
  const warnings = [];

  // Check .planning/ exists
  try {
    await access(stateDir);
  } catch (error) {
    errors.push(`.planning/ directory does not exist at ${stateDir}`);
    return { valid: false, errors, warnings };
  }

  // Check .meta.json
  const metaPath = join(stateDir, '.meta.json');
  try {
    const meta = await atomicReadJSON(metaPath);
    if (typeof meta.version !== 'number') {
      errors.push('.meta.json missing valid version field');
    }
    if (meta.version > CURRENT_STATE_VERSION) {
      warnings.push(
        `State version (${meta.version}) is newer than current version (${CURRENT_STATE_VERSION}). ` +
        'This may indicate GSD was downgraded. Consider upgrading GSD.'
      );
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      warnings.push('.meta.json does not exist. Run migrateState() to initialize versioning.');
    } else if (error instanceof SyntaxError) {
      errors.push('.meta.json is not valid JSON');
    } else {
      errors.push(`.meta.json read error: ${error.message}`);
    }
  }

  // Check STATE.md (if exists)
  const statePath = join(stateDir, 'STATE.md');
  try {
    await atomicReadJSON(statePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // STATE.md optional
    } else if (error instanceof SyntaxError) {
      errors.push('STATE.md is not valid JSON');
    } else {
      warnings.push(`STATE.md read warning: ${error.message}`);
    }
  }

  // Check config.json (if exists)
  const configPath = join(stateDir, 'config.json');
  try {
    await atomicReadJSON(configPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // config.json optional
    } else if (error instanceof SyntaxError) {
      errors.push('config.json is not valid JSON');
    } else {
      warnings.push(`config.json read warning: ${error.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
