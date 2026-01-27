import { readdir, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { ensureDirectory } from '../io/file-operations.js';

/**
 * Generate manifest data structure from installation directory
 * Scans directory and builds manifest object
 * Does NOT write to disk - use writeManifest() for that
 * 
 * @param {string} targetDir - Installation target directory
 * @param {string} gsdVersion - GSD version (e.g., "2.0.0")
 * @param {string} platform - Platform name (claude/copilot/codex)
 * @param {boolean} isGlobal - Global vs local installation
 * @returns {Promise<object>} Manifest data object
 */
export async function generateManifestData(targetDir, gsdVersion, platform, isGlobal) {
  // Collect all installed files
  const files = await collectInstalledFiles(targetDir);
  
  // Build manifest object
  return {
    gsd_version: gsdVersion,
    platform: platform,
    scope: isGlobal ? 'global' : 'local',
    installed_at: new Date().toISOString(),
    files: files
  };
}

/**
 * Write manifest data to file
 * 
 * @param {string} manifestPath - Full path to manifest file
 * @param {object} manifestData - Manifest object to write
 */
export async function writeManifest(manifestPath, manifestData) {
  // Ensure directory exists
  const manifestDir = join(manifestPath, '..');
  await ensureDirectory(manifestDir);
  
  // Write manifest
  await writeFile(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
}

/**
 * Recursively collect all files in directory
 * Returns relative paths as string array (sorted)
 * 
 * @param {string} targetDir - Directory to scan
 * @returns {Promise<string[]>} Array of relative file paths
 */
async function collectInstalledFiles(targetDir) {
  const files = [];
  
  async function walkDirectory(currentPath, basePath) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        await walkDirectory(fullPath, basePath);
      } else if (entry.isFile()) {
        files.push(relativePath); // STRING, not object
      }
    }
  }
  
  await walkDirectory(targetDir, targetDir);
  return files.sort(); // Deterministic output
}
