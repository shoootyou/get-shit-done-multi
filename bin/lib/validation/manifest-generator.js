// bin/lib/validation/manifest-generator.js

import { readdir, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { ensureDirectory } from '../io/file-operations.js';

/**
 * Generate and write installation manifest
 * Called ONLY after successful installation (context decision 3.1)
 * 
 * @param {string} targetDir - Installation target directory
 * @param {string} gsdVersion - GSD version (e.g., "2.0.0")
 * @param {string} platform - Platform name (claude/copilot/codex)
 * @param {boolean} isGlobal - Global vs local installation
 */
export async function generateAndWriteManifest(targetDir, gsdVersion, platform, isGlobal) {
  // Collect all installed files (post-installation scan)
  const files = await collectInstalledFiles(targetDir);
  
  // Build manifest object (context decision 3.3 structure)
  const manifest = {
    gsd_version: gsdVersion,
    platform: platform,
    scope: isGlobal ? 'global' : 'local',
    installed_at: new Date().toISOString(),
    files: files
  };
  
  // Write to target directory
  const manifestPath = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
  await ensureDirectory(join(targetDir, 'get-shit-done'));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Recursively collect all files in directory
 * Returns relative paths sorted alphabetically
 * 
 * @param {string} targetDir - Directory to scan
 * @returns {Promise<string[]>} Array of relative file paths
 */
export async function collectInstalledFiles(targetDir) {
  const files = [];
  
  async function walkDirectory(currentPath, basePath) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        await walkDirectory(fullPath, basePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }
  
  await walkDirectory(targetDir, targetDir);
  return files.sort(); // Deterministic output
}
