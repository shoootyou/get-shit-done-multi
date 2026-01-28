// bin/lib/updater/check-update.js

import { banner } from '../cli/banner-manager.js';
import { checkGlobalInstallations } from './check-global.js';
import { checkLocalInstallations } from './check-local.js';
import { checkCustomPath } from './check-custom-path.js';

/**
 * Handle --check-updates flag
 * Main orchestrator for checking GSD installations across scopes
 * 
 * @param {object} options - Command line options
 * @param {object} pkg - Package.json object
 */
export async function handleCheckUpdates(options, pkg) {
    const currentVersion = pkg.version;

    // Show banner
    banner(currentVersion, false);

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
