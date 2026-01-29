// bin/lib/io/file-operations.js

import fs from 'fs-extra';
import { join, dirname, relative } from 'path';
import { homedir } from 'os';
import { permissionDenied, insufficientSpace, invalidPath } from '../errors/install-error.js';
import { validatePath } from '../validation/path-validator.js';

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
    // SECURITY: Validate path before write (defense in depth)
    // This catches injection attacks via template variables or path manipulation
    // Note: We need a base directory to validate against
    // For installation files, we validate the file is within allowed directories
    const homeDir = homedir();
    const relativePath = filePath.startsWith(homeDir) 
      ? relative(homeDir, filePath)
      : relative(process.cwd(), filePath);
    
    // Only validate if path contains our installation directories
    // (allows other file writes like temp files, logs, etc.)
    if (relativePath.startsWith('.claude') || 
        relativePath.startsWith('.github') || 
        relativePath.startsWith('.codex') ||
        relativePath.startsWith('get-shit-done')) {
      try {
        const baseDir = filePath.startsWith(homeDir) ? homeDir : process.cwd();
        validatePath(baseDir, relativePath);
      } catch (error) {
        throw invalidPath(
          'Security validation failed at write time',
          {
            filePath,
            relativePath,
            error: error.message,
            hint: 'This could indicate template variable injection or path manipulation'
          }
        );
      }
    }
    
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
