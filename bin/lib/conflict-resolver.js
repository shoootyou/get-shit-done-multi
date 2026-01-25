/**
 * Conflict resolution utilities for GSD installation
 * Detects existing installations and user content, provides cleanup strategies
 * 
 * @module conflict-resolver
 */

const path = require('path');
const os = require('os');
const fse = require('fs-extra');

/**
 * GSD-managed directory names (auto-cleanup without prompting)
 */
const GSD_DIRECTORIES = ['commands', 'agents', 'skills', 'get-shit-done'];

/**
 * Check if a file path is GSD-managed content
 * @param {string} filePath - File path to check
 * @param {string} installRoot - Installation root directory
 * @returns {boolean} True if path is under GSD-managed directories
 */
function isGSDContent(filePath, installRoot) {
  const relativePath = path.relative(installRoot, filePath);
  const parts = relativePath.split(path.sep);
  
  // Check if first directory component is a GSD directory
  return GSD_DIRECTORIES.includes(parts[0]);
}

/**
 * Analyze conflicts in a target installation directory
 * @param {string} targetPath - Directory to analyze
 * @returns {Promise<{hasConflicts: boolean, gsdFiles: string[], userFiles: string[], canAutoClean: boolean}>}
 */
async function analyzeInstallationConflicts(targetPath) {
  // Default: no conflicts
  if (!(await fse.pathExists(targetPath))) {
    return {
      hasConflicts: false,
      gsdFiles: [],
      userFiles: [],
      canAutoClean: true
    };
  }
  
  const gsdFiles = [];
  const userFiles = [];
  
  try {
    const entries = await fse.readdir(targetPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry.name);
      
      // Check if directory is a GSD directory
      if (entry.isDirectory() && GSD_DIRECTORIES.includes(entry.name)) {
        // Recursively collect all files under this GSD directory
        const collectFiles = async (dirPath) => {
          const items = await fse.readdir(dirPath, { withFileTypes: true });
          for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            if (item.isDirectory()) {
              await collectFiles(itemPath);
            } else {
              gsdFiles.push(itemPath);
            }
          }
        };
        await collectFiles(fullPath);
        gsdFiles.push(fullPath); // Include the directory itself
      } else {
        // Non-GSD content
        userFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Error reading directory - treat as conflict
    return {
      hasConflicts: true,
      gsdFiles: [],
      userFiles: [],
      canAutoClean: false
    };
  }
  
  return {
    hasConflicts: gsdFiles.length > 0 || userFiles.length > 0,
    gsdFiles,
    userFiles,
    canAutoClean: userFiles.length === 0 && gsdFiles.length > 0
  };
}

/**
 * Clean up GSD-managed content (commands, agents, skills, get-shit-done directories)
 * @param {string[]} gsdFiles - Array of GSD file paths (from analyzeInstallationConflicts)
 * @returns {Promise<{removed: number}>} Number of directories removed
 */
async function cleanupGSDContent(gsdFiles) {
  const uniqueDirs = new Set();
  
  // Extract unique GSD directories from file paths
  for (const file of gsdFiles) {
    for (const gsdDir of GSD_DIRECTORIES) {
      const separator = path.sep + gsdDir + path.sep;
      const ending = path.sep + gsdDir;
      
      if (file.includes(separator) || file.endsWith(ending)) {
        // Find the GSD directory root
        const beforeGsd = file.split(gsdDir)[0];
        const gsdDirPath = beforeGsd + gsdDir;
        uniqueDirs.add(gsdDirPath);
      }
    }
  }
  
  // Remove directories
  for (const dir of uniqueDirs) {
    await fse.remove(dir);
  }
  
  return { removed: uniqueDirs.size };
}

/**
 * Detect old Claude installation path (pre-v1.10.0)
 * @returns {Promise<{exists: boolean, path?: string, warning?: string}>}
 */
async function detectOldClaudePath() {
  const oldPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude');
  
  if (await fse.pathExists(oldPath)) {
    return {
      exists: true,
      path: oldPath,
      warning: `⚠️  Old installation detected at ${oldPath}
   Manual cleanup recommended to avoid conflicts.
   New installation will use: ~/.claude/`
    };
  }
  
  return { exists: false };
}

module.exports = {
  analyzeInstallationConflicts,
  cleanupGSDContent,
  detectOldClaudePath,
  isGSDContent,
  GSD_DIRECTORIES
};
