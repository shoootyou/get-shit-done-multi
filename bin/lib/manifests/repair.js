import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createManifest, MANIFEST_ERRORS } from './schema.js';
import { derivePlatformFromPath } from '../platforms/platform-paths.js';
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

    // Scan directory to reconstruct file list
    const files = [];
    try {
      const entries = await fs.readdir(installDir, { recursive: true, withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.gsd-')) {
          const relativePath = path.relative(
            installDir,
            path.join(entry.path || entry.parentPath, entry.name)
          );
          files.push(relativePath); // STRING ARRAY - fixed bug!
        }
      }
    } catch (error) {
      logger.warn(`Could not scan directory: ${error.message}`, 2);
    }

    // Use 'unknown' for version (cannot reconstruct)
    const version = 'unknown';

    // Derive platform from directory structure
    const platform = derivePlatformFromPath(installDir);

    // Derive scope from path
    const homeDir = os.homedir();
    const scope = installDir.includes(homeDir) ? 'global' : 'local';

    // Reconstruct manifest using centralized schema
    const repairedManifest = createManifest({
      gsd_version: version,
      platform: platform,
      scope: scope,
      files: files.sort()
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


