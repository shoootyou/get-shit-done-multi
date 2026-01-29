// bin/lib/cli/install-loop.js

import * as logger from './logger.js';
import { getPlatformName } from '../platforms/platform-names.js';
import { installPlatforms } from './installation-core.js';
import { validateBeforeInstall } from '../preflight/pre-flight-validator.js';

/**
 * Execute installation loop for multiple platforms
 * Centralizes the logic for installing one or more platforms
 * 
 * @param {string[]} platforms - Array of platform names to install
 * @param {string} scope - Installation scope ('global' or 'local')
 * @param {string} appVersion - Application version
 * @param {Object} options - Installation options
 * @param {string} options.scriptDir - Script directory path
 * @param {boolean} [options.verbose] - Show verbose output
 * @returns {Promise<void>}
 */
export async function executeInstallationLoop(platforms, scope, appVersion, options) {
  // Pre-flight validation gate
  // Validates all requirements before installation begins
  // Throws with grouped errors if validation fails
  try {
    await validateBeforeInstall(platforms, scope, {
      scriptDir: options.scriptDir,
      verbose: options.verbose || false,
      customPath: options.customPath || null
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }

  const count = platforms.length;

  for (const platform of platforms) {
    // Show title with counter for multiple platforms
    if (count > 1) {
      logger.blockTitle(
        `Installing ${platforms.indexOf(platform) + 1}/${count} - ${getPlatformName(platform)} (${scope})`,
        { style: 'double', width: 80 }
      );
    } else {
      logger.blockTitle(
        `Installing ${getPlatformName(platform)} (${scope})`,
        { style: 'double', width: 80 }
      );
    }

    await installPlatforms(platform, scope, appVersion, options);
    console.log(); // Jump line between platforms
  }
}
