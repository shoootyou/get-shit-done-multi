// bin/lib/platforms/detector.js
import { pathExists } from '../io/file-operations.js';
import { getManifestPath } from './platform-paths.js';

/**
 * Detect GSD installations by checking for manifest files
 * @returns {Promise<Object>} Detection results per platform
 */
export async function detectInstallations() {
  const results = {
    claude: { global: false, local: false, version: null },
    copilot: { global: false, local: false, version: null },
    codex: { global: false, local: false, version: null }
  };
  
  // Check all platforms for global and local installations
  for (const platform of ['claude', 'copilot', 'codex']) {
    results[platform].global = await isGSDInstalled(platform, true);
    results[platform].local = await isGSDInstalled(platform, false);
  }
  
  // TODO: Read version from manifest (Phase 6 - VERSION-02)
  // For now, just detect presence
  
  return results;
}

/**
 * Check if GSD is installed for a platform
 * @param {string} platform - Platform ID (claude, copilot, codex)
 * @param {boolean} isGlobal - Check global or local scope
 * @returns {Promise<boolean>}
 */
async function isGSDInstalled(platform, isGlobal) {
  const manifestPath = getManifestPath(platform, isGlobal);
  return await pathExists(manifestPath);
}

/**
 * Get installed platforms
 * @returns {Promise<string[]>} Array of platform names
 */
export async function getInstalledPlatforms() {
  const detections = await detectInstallations();
  const installed = [];
  
  for (const [platform, locations] of Object.entries(detections)) {
    if (locations.global || locations.local) {
      installed.push(platform);
    }
  }
  
  return installed;
}

/**
 * Get installed version for a platform
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @returns {Promise<string|null>} Version string or null if not installed
 */
export async function getInstalledVersion(platform) {
  const detections = await detectInstallations();
  const detection = detections[platform];
  
  if (!detection) {
    return null;
  }
  
  // Return version from detection (currently always null until Phase 6)
  return detection.version;
}
