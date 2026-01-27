import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export async function readManifestWithRepair(manifestPath) {
  // Try normal read first
  try {
    if (!await fs.pathExists(manifestPath)) {
      return { success: false, reason: 'not_found', manifest: null };
    }
    
    const content = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    // Validate required fields
    const requiredFields = ['gsd_version', 'platform', 'scope', 'installed_at'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return { success: true, manifest };
    
  } catch (error) {
    // Handle specific error types
    if (error.code === 'EACCES') {
      return {
        success: false,
        reason: 'permission_denied',
        error: error.message,
        manifest: null
      };
    }
    
    if (error instanceof SyntaxError || error.message.includes('Missing required fields')) {
      // Attempt repair
      console.warn(`⚠️  Corrupt manifest detected: ${manifestPath}`);
      console.warn('   Attempting automatic repair...');
      return await attemptRepair(manifestPath);
    }
    
    return {
      success: false,
      reason: 'unknown_error',
      error: error.message,
      manifest: null
    };
  }
}

async function attemptRepair(manifestPath) {
  try {
    const installDir = path.dirname(manifestPath);
    
    // Scan directory to reconstruct file list
    const files = [];
    try {
      const entries = await fs.readdir(installDir, { recursive: true, withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.gsd-')) {
          const relativePath = path.relative(installDir, path.join(entry.path || entry.parentPath, entry.name));
          files.push({ path: relativePath });
        }
      }
    } catch (error) {
      console.warn('   Could not scan directory:', error.message);
    }
    
    // Use 'unknown' for version (per research decision: ignore corrupted data)
    const version = 'unknown';
    
    // Derive platform from directory structure
    const platform = derivePlatformFromPath(installDir);
    
    // Derive scope from path
    const homeDir = os.homedir();
    const scope = installDir.includes(homeDir) ? 'global' : 'local';
    
    // Reconstruct manifest
    const repairedManifest = {
      gsd_version: version,
      platform: platform,
      scope: scope,
      installed_at: new Date().toISOString(),
      files: files.sort((a, b) => a.path.localeCompare(b.path)),
      _repaired: true,
      _repair_date: new Date().toISOString(),
      _repair_reason: 'corrupt_or_incomplete'
    };
    
    // Write repaired manifest
    await fs.writeJson(manifestPath, repairedManifest, { spaces: 2 });
    console.log('   ✓ Manifest repaired successfully');
    
    return { success: true, manifest: repairedManifest, repaired: true };
  } catch (repairError) {
    return {
      success: false,
      reason: 'repair_failed',
      error: repairError.message,
      manifest: null
    };
  }
}

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
