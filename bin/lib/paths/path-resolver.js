// bin/lib/paths/path-resolver.js

import { join, resolve, normalize, isAbsolute } from 'path';
import { homedir } from 'os';
import { invalidArgs } from '../errors/install-error.js';

/**
 * Resolve installation target directory
 * @param {boolean} isGlobal - Global vs local installation
 * @param {string} platform - Platform name (e.g., 'claude')
 * @returns {string} Resolved path
 */
export function resolveTargetDirectory(isGlobal, platform = 'claude') {
  if (isGlobal) {
    return join(homedir(), `.${platform}`);
  } else {
    return join(process.cwd(), `.${platform}`);
  }
}

/**
 * Validate path for security (prevent traversal)
 * @param {string} targetPath - Path to validate
 * @param {string} basePath - Base path that target must be under
 * @throws {InstallError} If path is invalid or outside base
 */
export function validatePath(targetPath, basePath) {
  const normalizedTarget = normalize(resolve(targetPath));
  const normalizedBase = normalize(resolve(basePath));
  
  // Check for path traversal
  if (!normalizedTarget.startsWith(normalizedBase)) {
    throw invalidArgs(
      `Invalid path: ${targetPath} is outside target directory`,
      { target: normalizedTarget, base: normalizedBase }
    );
  }
  
  // Check for suspicious patterns
  if (targetPath.includes('..')) {
    throw invalidArgs(
      `Invalid path: contains traversal pattern (..)`,
      { path: targetPath }
    );
  }
}

/**
 * Normalize path for cross-platform compatibility
 * @param {string} path - Path to normalize
 * @returns {string} Normalized path
 */
export function normalizePath(path) {
  return normalize(path);
}

/**
 * Join paths safely
 * @param {...string} paths - Paths to join
 * @returns {string} Joined path
 */
export function joinPaths(...paths) {
  return join(...paths);
}

/**
 * Get templates directory path
 * @param {string} scriptDir - Script directory (__dirname)
 * @returns {string} Templates directory path
 */
export function getTemplatesDirectory(scriptDir) {
  // From bin/install.js, templates/ is ../templates/
  return join(scriptDir, '..', 'templates');
}
