const { findInstallations } = await import('../version/installation-finder.js');
const { readManifestWithRepair } = await import('../version/manifest-reader.js');
const { compareVersions, formatPlatformOption } = await import('../version/version-checker.js');
const { banner } = await import('../cli/banner-manager.js')
import * as logger from '../cli/logger.js';

/**
 * Handle --check-updates flag
 * @param {object} options - Command line options
 * @param {object} pkg - Package.json object
 */
export async function handleCheckUpdates(options, pkg) {
    const currentVersion = pkg.version;

    // Show banner
    banner(currentVersion, false);

    // Determine scopes to check
    const scopes = options.customPath
        ? [{ type: 'custom', label: 'Custom path installations', paths: [options.customPath] }]
        : [
            { type: 'global', label: 'Global installations', paths: [] },
            { type: 'local', label: 'Local installations', paths: [] }
        ];

    logger.blockTitle('Checking Installations', { style: 'double', width: 80 });

    // Process each scope
    for (const scope of scopes) {
        // Use simpleTitle to separate sections (except for single custom path)
        if (scopes.length > 1) {
            console.log('');
            logger.simpleSubtitle(scope.label);
        }

        const results = await validateScopeInstallations(
            scope.type,
            scope.paths,
            currentVersion,
            options.verbose
        );

        if (results.length > 0) {
            // logger.info(`${scope.label}:`);
            for (const result of results) {
                if (result.success) {
                    logger.info(`  ${formatStatusLine(result.platform, result.versionStatus, options.verbose)}`);
                } else {
                    logger.warn(`  ✗ ${result.platform}: ${result.reason}`);
                }
            }
        } else {
            logger.info(`${scope.label}: none`);
        }

        // Add spacing between scopes (except for last scope)
        if (scopes.length > 1 && scope !== scopes[scopes.length - 1]) {
            console.log('');
        }
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


/**
 * Validate installations for a specific scope
 * @param {string} scopeType - Type of scope ('global', 'local', 'custom')
 * @param {string[]} customPaths - Custom paths to check (empty for standard paths)
 * @param {string} currentVersion - Current GSD version
 * @param {boolean} verbose - Verbose mode flag
 * @returns {Promise<Array>} Array of installation results
 */
async function validateScopeInstallations(scopeType, customPaths, currentVersion, verbose) {
    const found = await findInstallations(scopeType === 'custom' ? '' : scopeType, customPaths, verbose);
    const results = [];

    if (found.length === 0) {
        return [];
    }

    for (const install of found) {
        if (verbose) {
            logger.info(`  Found: ${install.path}`);
        }

        const manifestResult = await readManifestWithRepair(install.path, verbose);

        if (manifestResult.success) {
            if (verbose) {
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

            results.push({
                success: true,
                platform,
                versionStatus,
                path: install.path
            });
        } else {
            results.push({
                success: false,
                platform: install.platform === 'custom' ? 'custom path' : install.platform,
                reason: manifestResult.reason,
                path: install.path
            });
        }
    }

    return results;
}
