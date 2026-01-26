// bin/lib/platforms/detector.js
import { pathExists } from '../io/file-operations.js';
import { homedir } from 'os';
import { join } from 'path';

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
  
  const home = homedir();
  
  // Check global installations
  results.claude.global = await isGSDInstalled(join(home, '.claude'));
  results.copilot.global = await isGSDInstalled(join(home, '.copilot'));
  results.codex.global = await isGSDInstalled(join(home, '.codex'));
  
  // Check local installations (current directory)
  results.claude.local = await isGSDInstalled('.claude');
  results.copilot.local = await isGSDInstalled('.github');
  results.codex.local = await isGSDInstalled('.codex');
  
  // TODO: Read version from manifest (Phase 6 - VERSION-02)
  // For now, just detect presence
  
  return results;
}

/**
 * Check if GSD is installed in a directory
 * @param {string} dir - Directory to check
 * @returns {Promise<boolean>}
 */
async function isGSDInstalled(dir) {
  // GSD is installed if manifest exists
  const manifestPath = join(dir, 'get-shit-done', '.gsd-install-manifest.json');
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
