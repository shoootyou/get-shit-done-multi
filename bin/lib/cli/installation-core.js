// bin/lib/cli/installation-core.js

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { install } from '../installer/orchestrator.js';
import { adapterRegistry } from '../platforms/registry.js';
import { createMultiBar } from './progress.js';
import * as logger from './logger.js';
import { getPlatformName } from '../platforms/platform-names.js';
import { logInstallationError, formatValidationError, formatRuntimeError } from '../validation/error-logger.js';

/**
 * Core installation function shared by CLI and interactive modes
 * 
 * This is the main installation logic that both modes call after:
 * - CLI mode: parsing command-line flags
 * - Interactive mode: gathering user selections via prompts
 * 
 * @param {string} platform - Platform to install (claude, copilot, codex)
 * @param {string} scope - Installation scope ('global' or 'local')
 * @param {string} appVersion - Application version
 * @param {Object} options - Additional options
 * @param {string} options.scriptDir - Script directory path
 * @param {boolean} [options.verbose] - Show verbose output
 * @returns {Promise<Object>} Installation results
 */
export async function installPlatforms(platform, scope, appVersion, options = {}) {
  const {
    scriptDir,
    verbose = false,
  } = options;

  const isGlobal = scope === 'global';

  // Create progress bar manager if needed
  const multiBar = createMultiBar();

  // Track successes and failures
  const successes = [];
  const failures = [];

  // Install platform
  let stats;
  try {
    const platformLabel = getPlatformName(platform);

    // Get adapter
    const adapter = adapterRegistry.get(platform);

    // Run installation
    stats = await install(appVersion, {
      platform,
      adapter,
      isGlobal,
      isVerbose: verbose,
      scriptDir,
      multiBar
    });

    successes.push({ platform, platformLabel, stats });
  } catch (error) {
    const platformLabel = getPlatformName(platform);
    
    // Determine target directory for error logging
    const adapter = adapterRegistry.get(platform);
    const targetDir = adapter.getTargetDir(isGlobal);
    
    // Determine current phase from error context (if available)
    const phase = error.phase || 'Unknown';
    
    // Log error to file (Phase 5 - decision 4.2)
    await logInstallationError(error, {
      platform: platform,
      scope: isGlobal ? 'global' : 'local',
      phase: phase,
      targetDir: targetDir
    });
    
    // Display user-friendly message (Phase 5 - decisions 2.4, 4.4)
    if (error.name === 'InstallError' && [4, 5, 6].includes(error.code)) {
      // Validation errors: PERMISSION_DENIED(4), INSUFFICIENT_SPACE(5), INVALID_PATH(6)
      console.error('\n' + formatValidationError(error));
    } else {
      // Runtime errors: show friendly only
      console.error('\n' + formatRuntimeError(error, targetDir));
    }
    
    failures.push({ platform, platformLabel, error });
  }

  // Stop progress bars
  if (multiBar) {
    multiBar.stop();
  }



  // Show failures if any
  if (failures.length === 1) {
    // All failed - throw error
    throw new Error('Installation failed for ' + failures[0].platformLabel + ': ' + failures[0].error.message);
  }

  // Show success message
  if (successes.length === 1) {
    logger.success(`Completed: ${successes[0].platformLabel} installation`, 2);
  }

  return {
    successes,
    failures,
    totalSuccess: successes.length,
    totalFailure: failures.length
  };
}

/**
 * Get script directory for current module
 * Helper for modules that need to pass scriptDir to installPlatforms
 * 
 * @param {string} importMetaUrl - Pass import.meta.url from calling module
 * @returns {string} Script directory path
 */
export function getScriptDir(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);

  // If called from bin/install.js, return bin/
  // If called from bin/lib/cli/interactive.js, go up to bin/
  if (__dirname.endsWith('/bin')) {
    return __dirname;
  } else if (__dirname.endsWith('/bin/lib/cli')) {
    return join(__dirname, '../..');
  }

  // Fallback: return as-is
  return __dirname;
}
