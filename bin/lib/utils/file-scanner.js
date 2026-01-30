import fs from 'fs-extra';
import path from 'path';

/**
 * Scan directory recursively and collect all file paths
 * Used for reconstructing file lists during manifest repair
 * 
 * @param {string} directory - Directory to scan
 * @param {string} excludePrefix - File prefix to exclude (default: '.gsd-')
 * @returns {Promise<string[]>} Array of relative file paths
 */
export async function scanInstallationFiles(directory, excludePrefix = '.gsd-') {
  const files = [];
  
  try {
    const entries = await fs.readdir(directory, { 
      recursive: true, 
      withFileTypes: true 
    });
    
    for (const entry of entries) {
      // Only include files, skip directories and excluded files
      if (entry.isFile() && !entry.name.startsWith(excludePrefix)) {
        const relativePath = path.relative(
          directory,
          path.join(entry.path || entry.parentPath, entry.name)
        );
        files.push(relativePath);
      }
    }
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty array
    // Caller should handle logging if needed
    return [];
  }
  
  return files.sort(); // Sort for consistent ordering
}

/**
 * Check if a directory contains installation files
 * Quick check without full scan
 * 
 * @param {string} directory - Directory to check
 * @returns {Promise<boolean>} True if directory has files
 */
export async function hasInstallationFiles(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries.some(entry => 
      entry.isFile() || 
      entry.isDirectory() && !entry.name.startsWith('.')
    );
  } catch (error) {
    return false;
  }
}
