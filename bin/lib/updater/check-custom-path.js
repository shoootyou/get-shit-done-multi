// bin/lib/updater/check-custom-path.js

import { formatStatusLine } from './format-status.js';
import { validateInstallation } from './validator.js';
import { showNoInstallationMessage } from './update-messages.js';
import * as logger from '../cli/logger.js';
import fs from 'fs-extra';

/**
 * Check installations in a custom path
 * @param {string} customPath - Custom directory path
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 * @returns {Promise<void>}
 */
export async function checkCustomPath(customPath, currentVersion, verbose) {
    logger.info(`Mode: Custom Path`, 2);
    logger.info(`Path: ${customPath}`, 2);

    // Custom path should point to a directory containing get-shit-done/
    const manifestPath = customPath.endsWith('.gsd-install-manifest.json')
        ? customPath
        : `${customPath}/get-shit-done/.gsd-install-manifest.json`;

    const exists = await fs.pathExists(manifestPath);

    console.log('')
    logger.simpleSubtitle('Custom path status');

    if (!exists) {
        logger.error('Installation not found', 2);
        if (verbose) {
            logger.error('Expected manifest file at:', 2);
            logger.error(`${manifestPath}`, 4);
        }

        console.log('')
        showNoInstallationMessage(['claude', 'copilot', 'codex']);
        return;
    }

    if (verbose) {
        logger.info(`Manifest expected at: ${manifestPath}`, 2);
    }

    const result = await validateInstallation(manifestPath, currentVersion, verbose);

    if (result.success) {
        logger.info(`  ${formatStatusLine(result.platform, result.versionStatus, verbose)}`, 2);
    } else {
        logger.warn(`  ✗ ${result.platform}: ${result.reason}`, 2);
    }
}
