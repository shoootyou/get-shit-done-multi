import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createManifest } from './schema.js';

/**
 * Attempt to repair a corrupt or missing manifest
 * Reconstructs manifest from directory structure
 * 
 * @param {string} manifestPath - Path to manifest file
 * @returns {Promise<{success: boolean, manifest?: object, repaired?: boolean, reason?: string, error?: string}>}
 */
export async function repairManifest(manifestPath) {
  try {
    console.warn(`⚠️  Attempting to repair manifest: ${manifestPath}`);
    
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
      console.warn('   Could not scan directory:', error.message);
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
    
    // Add repair metadata
    repairedManifest._repaired = true;
    repairedManifest._repair_date = new Date().toISOString();
    repairedManifest._repair_reason = 'corrupt_or_incomplete';
    
    // Write repaired manifest
    await fs.writeJson(manifestPath, repairedManifest, { spaces: 2 });
    console.log('   ✓ Manifest repaired successfully');
    
    return { 
      success: true, 
      manifest: repairedManifest, 
      repaired: true 
    };
    
  } catch (repairError) {
    return {
      success: false,
      reason: 'repair_failed',
      error: repairError.message,
      manifest: null
    };
  }
}

/**
 * Derive platform name from installation path
 * 
 * @param {string} installDir - Installation directory path
 * @returns {string} Platform name or 'unknown'
 */
function derivePlatformFromPath(installDir) {
  const parts = installDir.split(path.sep);
  const platformDirIndex = parts.findIndex(p => 
    p === '.claude' || p === '.copilot' || p === '.codex' || p === '.github'
  );
  
  if (platformDirIndex === -1) return 'unknown';
  
  const platformDir = parts[platformDirIndex];
  if (platformDir === '.github') return 'copilot';
  return platformDir.substring(1);
}
