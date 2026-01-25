import fs from 'fs-extra';

/**
 * Copy a single file from source to destination
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @returns {Promise<void>}
 */
export async function copyFile(src, dest) {
  try {
    await fs.copy(src, dest);
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${dest}\n\nFix: Check directory permissions`);
    } else if (error.code === 'ENOSPC') {
      throw new Error('No space left on device');
    } else if (error.code === 'ENOENT') {
      throw new Error(`File or directory not found: ${src}`);
    }
    throw error;
  }
}

/**
 * Copy a directory recursively from source to destination
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @param {Object} options - Copy options (default: { overwrite: true })
 * @returns {Promise<void>}
 */
export async function copyDirectory(src, dest, options = { overwrite: true }) {
  try {
    await fs.copy(src, dest, options);
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${dest}\n\nFix: Check directory permissions`);
    } else if (error.code === 'ENOSPC') {
      throw new Error('No space left on device');
    } else if (error.code === 'ENOENT') {
      throw new Error(`Source directory not found: ${src}`);
    }
    throw error;
  }
}

/**
 * Ensure a directory exists, creating it and its parents if necessary
 * @param {string} dirPath - Directory path to ensure
 * @returns {Promise<boolean>} - True if directory was created, false if it already existed
 */
export async function ensureDirectory(dirPath) {
  try {
    const existed = await fs.pathExists(dirPath);
    await fs.ensureDir(dirPath);
    return !existed;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied: ${dirPath}\n\nFix: Check directory permissions`);
    } else if (error.code === 'ENOSPC') {
      throw new Error('No space left on device');
    }
    throw error;
  }
}
