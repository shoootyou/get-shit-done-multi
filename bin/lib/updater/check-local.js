// bin/lib/updater/check-local.js

import { platformDirs, getManifestPath } from '../platforms/platform-paths.js';
import { getPlatformName } from '../platforms/platform-names.js';
import { validateInstallation } from './validator.js';
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
        const platformPath = getManifestPath(platform, false); // Set false for local
        const exists = await fs.pathExists(platformPath);

        if (!exists) {
            if (verbose) {
                logger.error(`Results for ${getPlatformName(platform)}`, 2);
                logger.error(`Not installed`, 4);
            }
            continue;
        }

        foundAny = true;

        const result = await validateInstallation(platformPath, currentVersion, verbose);
        if (result.success) {
            if (verbose) {
                logger.success(`Results for ${getPlatformName(platform)}`, 2);
                logger.success(`Installed version: ${result.version}`, 4);
                logger.success(`Manifest found: ${platformPath}`, 4);
            } else {
                logger.success(`Installed for: ${platformPath} (${result.version})`, 2);
            }
        } else {
            logger.error(`Installation issue for ${getPlatformName(platform)}`, 2, false);
        }
    }

    if (!foundAny && !verbose) {
        logger.error('No local installations were found.', 2, false);
    }
}
