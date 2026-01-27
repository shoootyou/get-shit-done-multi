// bin/lib/updater/format-status.js

import { getPlatformName } from '../platforms/platform-names.js';
import { readManifestWithRepair } from '../version/manifest-reader.js';
import { compareVersions } from '../version/version-checker.js';
import * as logger from '../cli/logger.js';

/**
 * Format status line for --check-updates display
 * @param {string} platform - Platform name
 * @param {object} versionStatus - Version status from compareVersions
 * @param {boolean} verbose - Verbose mode
 * @returns {string} Formatted status line
 */
export function formatStatusLine(platform, versionStatus, verbose) {
    // Get platform display name from centralized source
    const baseName = getPlatformName(platform);

    if (versionStatus.status === 'up_to_date') {
        const display = `${baseName} (v${versionStatus.installed})`;
        return verbose
            ? `✓ ${display} (up to date)`
            : `✓ ${display}`;
    }

    if (versionStatus.status === 'update_available') {
        const display = `${baseName} (v${versionStatus.installed} → v${versionStatus.current})`;
        return `⬆ ${display} (${versionStatus.updateType} update available)`;
    }

    if (versionStatus.status === 'major_update') {
        const display = `${baseName} (v${versionStatus.installed} → v${versionStatus.current} ⚠️  major)`;
        return `⚠️  ${display} (major update available)`;
    }

    return `? ${baseName}: ${versionStatus.status}`;
}

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
