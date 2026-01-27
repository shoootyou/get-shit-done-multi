import { readManifestWithRepair } from '../version/manifest-reader.js';
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
    const manifestResult = await readManifestWithRepair(manifestPath, verbose);

    if (!manifestResult.success) {
        return {
            success: false,
            platform: 'unknown',
            reason: manifestResult.reason
        };
    }

    if (verbose) {
        logger.verbose(`  Manifest read successfully`, true);
        logger.verbose(`  Version: ${manifestResult.manifest.gsd_version}`, true);
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
