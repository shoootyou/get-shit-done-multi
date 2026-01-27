import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createManifest, MANIFEST_ERRORS } from './schema.js';
import { derivePlatformFromPath } from '../platforms/platform-paths.js';
import { detectVersionFromDirectory } from '../version/version-detector.js';
import { scanInstallationFiles } from '../utils/file-scanner.js';
import * as logger from '../cli/logger.js';

/**
 * Attempt to repair a corrupt or missing manifest
 * Reconstructs manifest from directory structure
 * 
 * @param {string} manifestPath - Path to manifest file
 * @returns {Promise<{success: boolean, manifest?: object, repaired?: boolean, reason?: string, error?: string}>}
 */
export async function repairManifest(manifestPath) {
  try {
    const installDir = path.dirname(manifestPath);

    // Derive platform from directory structure
    const platform = derivePlatformFromPath(installDir);

    // Detect version from installation directory
    const versionInfo = await detectVersionFromDirectory(installDir, platform);
    const version = versionInfo.version;
    
    if (version !== 'unknown') {
      logger.info(`Detected version ${version} from ${versionInfo.source}`, 2);
    }

    // Scan directory to reconstruct file list
    const files = await scanInstallationFiles(installDir);
    
    if (files.length === 0) {
      logger.warn('No installation files found during scan', 2);
    }

    // Derive scope from path
    const homeDir = os.homedir();
    const scope = installDir.includes(homeDir) ? 'global' : 'local';

    // Reconstruct manifest using centralized schema
    const repairedManifest = createManifest({
      gsd_version: version,
      platform: platform,
      scope: scope,
      files: files // Already sorted by scanInstallationFiles
      // installed_at will be auto-filled by createManifest()
    });

    if (repairedManifest.gsd_version === 'unknown') {
      return {
        success: false,
        reason: MANIFEST_ERRORS.REPAIR_FAILED,
        repaired: false,
        error: 'Could not determine GSD version during repair',
        manifest: null
      };
    }

    // Add repair metadata
    repairedManifest._repaired = true;
    repairedManifest._repair_date = new Date().toISOString();
    repairedManifest._repair_reason = 'corrupt_or_incomplete';

    // Write repaired manifest
    await fs.writeJson(manifestPath, repairedManifest, { spaces: 2 });
    logger.success('Manifest repaired successfully', 2);

    return {
      success: true,
      manifest: repairedManifest,
      repaired: true
    };

  } catch (repairError) {
    logger.error(`Manifest repair failed: ${repairError.message}`, 2);
    return {
      success: false,
      reason: MANIFEST_ERRORS.REPAIR_FAILED,
      error: repairError.message,
      repaired: false,
      manifest: null
    };
  }
}


