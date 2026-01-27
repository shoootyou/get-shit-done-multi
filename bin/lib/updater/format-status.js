// bin/lib/updater/format-status.js

import { getPlatformName } from '../platforms/platform-names.js';
import { compareVersions } from '../version/version-checker.js';
import * as logger from '../cli/logger.js';

/**
 * Format status line for --check-updates display
 * @param {string} platform - Platform name
 * @param {object} versionStatus - Version status from compareVersions
 * @param {boolean} verbose - Verbose mode
 */
export function formatStatusLine(platform, versionStatus, verbose) {
    // Get platform display name from centralized source
    const baseName = getPlatformName(platform);

    if (versionStatus.status === 'up_to_date') {
        if (verbose) {
            logger.success('Version found:', 2);
            logger.success(`Platform: ${baseName}`, 4);
            logger.success(`Version: ${versionStatus.current}`, 4);
        } else {
            logger.success(`Your installation is up to date!`, 2);
        }
    }

    if (versionStatus.status === 'update_available') {
        if (verbose) {
            logger.info('Version found:', 2);
            logger.info(`Platform: ${baseName}`, 4);
            logger.info(`Installed: v${versionStatus.installed}`, 4);
            logger.info(`Current:   v${versionStatus.current}`, 4);
        } else {
            logger.info(`An update is available!`, 2);
        }
    }

    if (versionStatus.status === 'major_update') {
        if (verbose) {
            logger.warn('Major update available:', 2);
            logger.warn(`Platform: ${baseName}`, 4);
            logger.warn(`Installed: v${versionStatus.installed}`, 4);
            logger.warn(`Current:   v${versionStatus.current}`, 4);
        } else {
            logger.warn(`A major update is available!`, 2);
        }
    }

    if (versionStatus.status === 'downgrade') {
        logger.verbose(`You have a newer version installed than the current release.`, 2);
        logger.verbose('Thanks for contributing!', 2);
        if (verbose) {
            logger.verbose(`Platform: ${baseName}`, 4);
            logger.verbose(`Installed: v${versionStatus.installed}`, 4);
            logger.verbose(`Current:   v${versionStatus.current}`, 4);
        }
    }
}
