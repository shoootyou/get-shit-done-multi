/**
 * Version upgrade utilities for GSD installation
 * Preserves user data during version upgrades
 * Uses only Node.js built-ins (no npm dependencies)
 */

const fs = require('fs');
const path = require('path');

/**
 * Preserve user data before upgrade by backing up directories
 * @param {string} installDir - Installation directory path
 * @returns {Object} Map of directory names to backup paths: {'.planning': '/path/.planning.backup-1234567890'}
 */
function preserveUserData(installDir) {
  const preserveDirs = ['.planning', 'user-data'];
  const backups = {};
  const timestamp = Date.now();
  
  for (const dirName of preserveDirs) {
    const dirPath = path.join(installDir, dirName);
    
    // Check if directory exists before attempting backup
    if (fs.existsSync(dirPath)) {
      const backupPath = `${dirPath}.backup-${timestamp}`;
      
      try {
        // Atomic rename operation
        fs.renameSync(dirPath, backupPath);
        backups[dirName] = backupPath;
      } catch (error) {
        console.error(`Failed to backup ${dirName}:`, error.message);
      }
    }
  }
  
  return backups;
}

/**
 * Restore user data after upgrade from backup locations
 * @param {string} installDir - Installation directory path
 * @param {Object} backups - Map from preserveUserData() with backup paths
 */
function restoreUserData(installDir, backups) {
  for (const [dirName, backupPath] of Object.entries(backups)) {
    const originalPath = path.join(installDir, dirName);
    
    try {
      // Atomic rename back to original location
      fs.renameSync(backupPath, originalPath);
    } catch (error) {
      // Graceful degradation - log but don't throw
      console.error(`Failed to restore ${dirName}:`, error.message);
      console.error(`  Backup remains at: ${backupPath}`);
    }
  }
}

/**
 * Remove known orphaned files from old versions
 * @param {string} installDir - Installation directory path
 */
function cleanOrphanedFiles(installDir) {
  // Array of known orphaned relative paths from previous versions
  // Currently empty - placeholder for future version migrations
  const orphanedPaths = [];
  
  for (const relPath of orphanedPaths) {
    const fullPath = path.join(installDir, relPath);
    
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed orphaned file: ${relPath}`);
      } catch (error) {
        console.error(`Failed to remove orphaned file ${relPath}:`, error.message);
      }
    }
  }
}

module.exports = {
  preserveUserData,
  restoreUserData,
  cleanOrphanedFiles
};
