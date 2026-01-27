// bin/lib/updater/check-local.js

import { platformDirs, getManifestPath } from '../platforms/platform-paths.js';
import { formatStatusLine, validateInstallation } from './format-status.js';
import * as logger from '../cli/logger.js';
import fs from 'fs-extra';

/**
 * Check local installations for all platforms
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 * @returns {Promise<void>}
 */
export async function checkLocalInstallations(currentVersion, verbose) {
    logger.simpleSubtitle('Local installations');
    
    const platforms = Object.keys(platformDirs);
    let foundAny = false;
    
    for (const platform of platforms) {
        const manifestPath = getManifestPath(platform, false);
        const exists = await fs.pathExists(manifestPath);
        
        if (!exists) {
            if (verbose) {
                logger.verbose(`  ${platform}: not found`, true);
            }
            continue;
        }
        
        foundAny = true;
        
        if (verbose) {
            logger.info(`  Found: ${manifestPath}`);
        }
        
        const result = await validateInstallation(manifestPath, currentVersion, verbose);
        
        if (result.success) {
            logger.info(`  ${formatStatusLine(result.platform, result.versionStatus, verbose)}`);
        } else {
            logger.warn(`  ✗ ${result.platform}: ${result.reason}`);
        }
    }
    
    if (!foundAny) {
        logger.info('Local installations: none');
    }
}
