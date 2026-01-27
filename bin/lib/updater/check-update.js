const { readManifestWithRepair } = await import('../version/manifest-reader.js');
const { compareVersions } = await import('../version/version-checker.js');
const { banner } = await import('../cli/banner-manager.js');
const { platformDirs, getManifestPath } = await import('../platforms/platform-paths.js');
const { showNoInstallationMessage } = await import('./update-messages.js');
import * as logger from '../cli/logger.js';
import fs from 'fs-extra';

/**
 * Handle --check-updates flag
 * @param {object} options - Command line options
 * @param {object} pkg - Package.json object
 */
export async function handleCheckUpdates(options, pkg) {
    const currentVersion = pkg.version;

    // Show banner
    banner(currentVersion, false);

    logger.blockTitle('Check for updates', { style: 'double', width: 80 });

    // If custom path is provided, ONLY check that path
    if (options.customPath) {
        await checkCustomPath(options.customPath, currentVersion, options.verbose);
        return;
    }

    // Normal flow: check global first, then local
    await checkGlobalInstallations(currentVersion, options.verbose);
    console.log('');
    await checkLocalInstallations(currentVersion, options.verbose);
}

/**
 * Check installations in a custom path
 * @param {string} customPath - Custom directory path
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 */
async function checkCustomPath(customPath, currentVersion, verbose) {
    logger.info(`Mode: Custom Path`, 2);
    logger.info(`Path: ${customPath}`, 2);

    // Custom path should point to a directory containing get-shit-done/
    const manifestPath = `${customPath}/get-shit-done/.gsd-install-manifest.json`;

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
        showNoInstallationMessage();
        return;
    }

    if (verbose) {
        logger.success(`Manifest found: ${manifestPath}`, 2);
    }

    const result = await validateInstallation(manifestPath, currentVersion, verbose);

    if (result.success) {
        logger.info(`  ${formatStatusLine(result.platform, result.versionStatus, verbose)}`);
    } else {
        logger.warn(`  ✗ ${result.platform}: ${result.reason}`);
    }
}

/**
 * Check global installations for all platforms
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 */
async function checkGlobalInstallations(currentVersion, verbose) {
    logger.simpleSubtitle('Global installations');

    const platforms = Object.keys(platformDirs);
    let foundAny = false;

    for (const platform of platforms) {
        const manifestPath = getManifestPath(platform, true);
        const exists = await fs.pathExists(manifestPath);

        if (!exists) {
            if (verbose) {
                logger.verbose(`  ${platform}: not found`, true);
            }
            continue;
        }

        foundAny = true;

        if (verbose) {
            logger.success(`Manifest found: ${manifestPath}`, 2);
        }

        const result = await validateInstallation(manifestPath, currentVersion, verbose);

        if (result.success) {
            logger.info(`  ${formatStatusLine(result.platform, result.versionStatus, verbose)}`);
        } else {
            logger.warn(`  ✗ ${result.platform}: ${result.reason}`);
        }
    }

    if (!foundAny) {
        logger.info('Global installations: none');
    }
}

/**
 * Check local installations for all platforms
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 */
async function checkLocalInstallations(currentVersion, verbose) {
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

/**
 * Validate a single installation
 * @param {string} manifestPath - Path to manifest file
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 * @returns {Promise<Object>} Validation result
 */
async function validateInstallation(manifestPath, currentVersion, verbose) {
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

/**
 * Format status line for --check-updates display
 * @param {string} platform - Platform name
 * @param {object} versionStatus - Version status from compareVersions
 * @param {boolean} verbose - Verbose mode
 * @returns {string} Formatted status line
 */
function formatStatusLine(platform, versionStatus, verbose) {
    // Get platform display name
    const names = {
        'claude': 'Claude Code',
        'copilot': 'GitHub Copilot',
        'codex': 'Codex'
    };
    const baseName = names[platform] || platform;

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
