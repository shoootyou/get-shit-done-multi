import { readManifest } from '../manifests/reader.js';
import { repairManifest } from '../manifests/repair.js';
import { isRepairableError } from '../manifests/schema.js';
import * as logger from '../cli/logger.js';
import { compareVersions } from '../version/version-checker.js';

/**
 * Validate a single installation
 * @param {string} manifestPath - Path to manifest file
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 * @returns {Promise<Object>} Validation result
 */
export async function validateInstallation(manifestPath, currentVersion, verbose) {
    let manifestResult = await readManifest(manifestPath);

    // If corrupt or invalid schema, try to repair
    if (!manifestResult.success && isRepairableError(manifestResult.reason)) {
        if (verbose) {
            logger.success(`Manifest corrupt, attempting repair...`, 2);
        }
        manifestResult = await repairManifest(manifestPath);
    }

    if (!manifestResult.success) {
        return {
            success: false,
            platform: 'unknown',
            reason: manifestResult.reason
        };
    }

    if (verbose) {
        logger.success(`Manifest read successfully`, 2);
        logger.success(`Version: ${manifestResult.manifest.gsd_version}`, 2);
    }

    const platform = manifestResult.manifest.platform || 'unknown';
    const versionStatus = compareVersions(
        manifestResult.manifest.gsd_version,
        currentVersion
    );

    return {
        success: true,
        platform,
        versionStatus
    };
}
