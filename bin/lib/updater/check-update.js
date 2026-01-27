const { findInstallations } = await import('../version/installation-finder.js');
const { readManifestWithRepair } = await import('../version/manifest-reader.js');
const { compareVersions, formatPlatformOption } = await import('../version/version-checker.js');
import * as logger from '../cli/logger.js';

/**
 * Handle --check-updates flag
 * @param {object} options - Command line options
 * @param {object} pkg - Package.json object
 */
export async function handleCheckUpdates(options, pkg) {
    const currentVersion = pkg.version;
    const customPaths = options.customPath ? [options.customPath] : [];

    // Show banner
    logger.banner(currentVersion);
    console.log('');

    // If custom path is provided, ONLY check that path (skip global/local standard paths)
    if (options.customPath) {
        if (options.verbose) {
            logger.info('Discovery process:');
            logger.info('  Checking custom path:');
            logger.info(`    ${options.customPath}`);
            console.log('');
        }

        logger.info('Checking custom path installation...');
        console.log('');

        // Only check custom path installations (pass empty scope to skip standard paths)
        const customFound = await findInstallations('', customPaths, options.verbose);

        if (customFound.length > 0) {
            logger.info('Custom path installations:');
            for (const install of customFound) {
                if (options.verbose) {
                    logger.info(`  Found: ${install.path}`);
                }
                const manifestResult = await readManifestWithRepair(install.path, options.verbose);
                if (manifestResult.success) {
                    if (options.verbose) {
                        logger.info(`  Manifest read successfully`);
                        logger.info(`  Version: ${manifestResult.manifest.gsd_version}`);
                    }
                    // Use platform from manifest if we have 'custom' placeholder
                    const platform = install.platform === 'custom'
                        ? manifestResult.manifest.platform || 'unknown'
                        : install.platform;

                    const versionStatus = compareVersions(
                        manifestResult.manifest.gsd_version,
                        currentVersion
                    );
                    logger.info(`  ${formatStatusLine(platform, versionStatus, options.verbose)}`);
                } else {
                    logger.warn(`  ✗ ${install.platform === 'custom' ? 'custom path' : install.platform}: ${manifestResult.reason}`);
                }
            }
        } else {
            logger.info('Custom path installations: none');
        }

        return;
    }

    // Normal flow: check both global and local standard paths
    if (options.verbose) {
        logger.info('Discovery process:');
        logger.info('  Checking global paths:');
        logger.info('    ~/.claude/get-shit-done/');
        logger.info('    ~/.copilot/get-shit-done/');
        logger.info('    ~/.codex/get-shit-done/');
        logger.info('  Checking local paths:');
        logger.info('    ./.claude/get-shit-done/');
        logger.info('    ./.github/get-shit-done/');
        logger.info('    ./.codex/get-shit-done/');
        console.log('');
    }

    logger.info('Checking installations...');
    console.log('');

    // Check global installations
    const globalFound = await findInstallations('global', [], options.verbose);

    if (globalFound.length > 0) {
        logger.info('Global installations:');
        for (const install of globalFound) {
            if (options.verbose) {
                logger.info(`  Found: ${install.path}`);
            }
            const manifestResult = await readManifestWithRepair(install.path, options.verbose);
            if (manifestResult.success) {
                if (options.verbose) {
                    logger.info(`  Manifest read successfully`);
                    logger.info(`  Version: ${manifestResult.manifest.gsd_version}`);
                }
                // Use platform from manifest if we have 'custom' placeholder
                const platform = install.platform === 'custom'
                    ? manifestResult.manifest.platform || 'unknown'
                    : install.platform;

                const versionStatus = compareVersions(
                    manifestResult.manifest.gsd_version,
                    currentVersion
                );
                logger.info(`  ${formatStatusLine(platform, versionStatus, options.verbose)}`);
            } else {
                logger.warn(`  ✗ ${install.platform === 'custom' ? 'custom path' : install.platform}: ${manifestResult.reason}`);
            }
        }
    } else {
        logger.info('Global installations: none');
    }

    console.log('');

    // Check local installations
    const localFound = await findInstallations('local', [], options.verbose);

    if (localFound.length > 0) {
        logger.info('Local installations:');
        for (const install of localFound) {
            if (options.verbose) {
                logger.info(`  Found: ${install.path}`);
            }
            const manifestResult = await readManifestWithRepair(install.path, options.verbose);
            if (manifestResult.success) {
                if (options.verbose) {
                    logger.info(`  Manifest read successfully`);
                    logger.info(`  Version: ${manifestResult.manifest.gsd_version}`);
                }
                // Use platform from manifest if we have 'custom' placeholder
                const platform = install.platform === 'custom'
                    ? manifestResult.manifest.platform || 'unknown'
                    : install.platform;

                const versionStatus = compareVersions(
                    manifestResult.manifest.gsd_version,
                    currentVersion
                );
                logger.info(`  ${formatStatusLine(platform, versionStatus, options.verbose)}`);
            } else {
                logger.warn(`  ✗ ${install.platform === 'custom' ? 'custom path' : install.platform}: ${manifestResult.reason}`);
            }
        }
    } else {
        logger.info('Local installations: none');
    }
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