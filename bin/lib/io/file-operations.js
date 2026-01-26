// bin/lib/io/file-operations.js

import fs from 'fs-extra';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { permissionDenied, insufficientSpace } from '../errors/install-error.js';

/**
 * Copy directory recursively with permission preservation
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {Object} options - Copy options
 * @returns {Promise<void>}
 */
export async function copyDirectory(src, dest, options = {}) {
  try {
    await fs.copy(src, dest, {
      overwrite: options.overwrite ?? true,
      errorOnExist: false,
      preserveTimestamps: true,
      ...options
    });
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw permissionDenied(`Permission denied: ${dest}`, { path: dest, error });
    }
    if (error.code === 'ENOSPC') {
      throw insufficientSpace(`Insufficient disk space: ${dest}`, { path: dest, error });
    }
    throw error;
  }
}

/**
 * Ensure directory exists (create if missing)
 * @param {string} dir - Directory path
 * @returns {Promise<void>}
 */
export async function ensureDirectory(dir) {
  try {
    await fs.ensureDir(dir);
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw permissionDenied(`Permission denied: ${dir}`, { path: dir, error });
    }
    throw error;
  }
}

/**
 * Write file with directory creation
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content) {
  try {
    await fs.ensureDir(dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      throw permissionDenied(`Permission denied: ${filePath}`, { path: filePath, error });
    }
    throw error;
  }
}

/**
 * Read file content
 * @param {string} filePath - File path
 * @returns {Promise<string>}
 */
export async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

/**
 * Check if path exists
 * @param {string} path - Path to check
 * @returns {Promise<boolean>}
 */
export async function pathExists(path) {
  return fs.pathExists(path);
}

/**
 * Get available disk space in bytes
 * @param {string} path - Path to check
 * @returns {Promise<number>}
 */
export async function getAvailableSpace(path) {
  // Simplified check - use fs.stat for basic validation
  // Full disk space checking can be added with child_process (df/PowerShell)
  try {
    await fs.access(path);
    return Infinity; // Assume sufficient space for now
  } catch {
    return 0;
  }
}

/**
 * Resolve home directory
 * @returns {string}
 */
export function getHomeDirectory() {
  return homedir();
}
