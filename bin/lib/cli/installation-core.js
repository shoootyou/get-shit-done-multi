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
 * @param {string[]} platforms - Platforms to install (claude, copilot, codex)
 * @param {string} scope - Installation scope ('global' or 'local')
 * @param {Object} options - Additional options
 * @param {string} options.scriptDir - Script directory path
 * @param {boolean} [options.verbose] - Show verbose output
 * @param {boolean} [options.useProgressBars] - Use progress bars (default: true)
 * @param {boolean} [options.showBanner] - Show banner before installation (default: false)
 * @returns {Promise<Object>} Installation results
 */
export async function installPlatforms(platforms, scope, options = {}) {
  const {
    scriptDir,
    verbose = false,
    useProgressBars = true,
    showBanner = false
  } = options;
  
  const isGlobal = scope === 'global';
  
  // Show banner if requested (CLI mode shows it, interactive mode doesn't)
  if (showBanner) {
    logger.banner();
  }
  
  // Create progress bar manager if needed
  const multiBar = useProgressBars ? createMultiBar() : null;
  
  // Track successes and failures
  const successes = [];
  const failures = [];
  
  // Install each platform
  for (const platform of platforms) {
    try {
      const platformLabel = getPlatformName(platform);
      
      // Show installation starting message
      logger.info(`Installing to ${platform} (${isGlobal ? 'global' : 'local'})...`, 1);
      
      // Get adapter
      const adapter = adapterRegistry.get(platform);
      
      // Run installation
      const stats = await install({
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
  }
  
  // Stop progress bars
  if (multiBar) {
    multiBar.stop();
  }
  
  // Show failures if any
  if (failures.length > 0) {
    console.log();
    logger.warn(`${failures.length} platform(s) failed to install:`);
    failures.forEach(f => logger.error(`  ${f.platformLabel}: ${f.error.message}`));
    
    if (failures.length === platforms.length) {
      // All failed - throw error
      throw new Error('All platform installations failed');
    }
  }
  
  // Show success message
  console.log(); // One jump line before
  if (successes.length > 1) {
    const names = successes.map(s => s.platform).join(', ');
    logger.success(`${names} installation complete`, 1);
  } else if (successes.length === 1) {
    logger.success(`${successes[0].platform} installation complete`, 1);
  }
  
  // Show next steps
  logger.header('Next Steps');
  const successPlatforms = successes.map(s => s.platform);
  showNextSteps(successPlatforms, 1);
  
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
