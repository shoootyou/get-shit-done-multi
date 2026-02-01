// bin/lib/updater/check-update.js

import { banner } from '../cli/banner-manager.js';
import { checkGlobalInstallations } from './check-global.js';
import { checkLocalInstallations } from './check-local.js';
import { checkCustomPath } from './check-custom-path.js';
import { detectAllOldVersions } from '../version/old-version-detector.js';
import { showOldVersionMessage } from './update-messages.js';

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

    // === NEW: Check for old versions first (Phase 6.1) ===
    const targetDir = options.customPath || '.';
    const oldVersions = await detectAllOldVersions(targetDir);
    
    if (oldVersions.length > 0) {
        // Show special incompatibility message for old versions
        showOldVersionMessage(oldVersions);
        
        // Don't proceed to regular update check - old versions need migration, not update
        return;
    }

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
