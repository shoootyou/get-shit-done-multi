// bin/lib/cli/installation-core.js

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { install } from '../installer/orchestrator.js';
import { adapterRegistry } from '../platforms/registry.js';
import { createMultiBar } from './progress.js';
import * as logger from './logger.js';
import { showNextSteps } from './next-steps.js';
import { getPlatformName } from '../platforms/platform-names.js';

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
  try {
    const platformLabel = getPlatformName(platform);

    // Get adapter
    const adapter = adapterRegistry.get(platform);

    // Run installation
    const stats = await install(appVersion, {
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
    console.log();
    logger.success(`Completed: ${successes[0].platformLabel} installation`, 1);
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
