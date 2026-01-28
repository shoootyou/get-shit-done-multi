// bin/lib/validation/path-validator.js

import path from 'path';
import sanitize from 'sanitize-filename';
import { invalidPath } from '../errors/install-error.js';

const ALLOWED_DIRS = ['.claude', '.github', '.codex', 'get-shit-done'];
const WINDOWS_RESERVED = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

/**
 * Validate path with defense-in-depth approach
 * @param {string} basePath - Base installation directory
 * @param {string} inputPath - Path to validate (may be relative)
 * @returns {Object} { normalized, resolved } if valid
 * @throws {InstallError} If path fails validation
 */
export function validatePath(basePath, inputPath) {
  // Layer 1: URL decode
  let decoded;
  try {
    decoded = decodeURIComponent(inputPath);
  } catch (e) {
    throw invalidPath(
      'Invalid URL encoding in path',
      { path: inputPath, error: e.message }
    );
  }
  
  // Layer 2: Check for null bytes
  if (decoded.includes('\x00') || decoded.includes('\u0000')) {
    throw invalidPath('Null byte detected in path', { path: inputPath });
  }
  
  // Layer 3: Normalize
  const normalized = path.normalize(decoded);
  
  // Layer 4: Check for path traversal (normalize keeps leading ..)
  if (normalized.includes('..')) {
    throw invalidPath('Path traversal detected (..)', { path: inputPath });
  }
  
  // Layer 5: Resolve and check containment
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(basePath, normalized);
  const relative = path.relative(resolvedBase, resolvedTarget);
  
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw invalidPath(
      'Path escapes base directory',
      { path: inputPath, base: basePath }
    );
  }
  
  // Layer 6: Allowlist validation
  const firstSegment = normalized.split(path.sep)[0];
  if (!ALLOWED_DIRS.includes(firstSegment)) {
    throw invalidPath(
      `Path not in allowlist: ${firstSegment}`,
      { 
        path: inputPath,
        firstSegment,
        allowlist: ALLOWED_DIRS
      }
    );
  }
  
  // Layer 7: Length validation (platform-specific)
  const maxPath = process.platform === 'win32' ? 260 : 4096;
  if (resolvedTarget.length > maxPath) {
    throw invalidPath(
      `Path exceeds maximum length: ${resolvedTarget.length} > ${maxPath}`,
      { path: inputPath, length: resolvedTarget.length, max: maxPath }
    );
  }
  
  // Layer 8: Component validation
  const components = normalized.split(path.sep);
  for (const component of components) {
    if (component.length > 255) {
      throw invalidPath(
        `Component exceeds 255 characters: ${component.substring(0, 20)}...`,
        { path: inputPath, component: component.substring(0, 50) }
      );
    }
    
    // Windows reserved names (case-insensitive, cross-platform)
    const basename = component.split('.')[0].toUpperCase();
    if (WINDOWS_RESERVED.includes(basename)) {
      throw invalidPath(
        `Windows reserved name: ${component}`,
        { path: inputPath, component }
      );
    }
  }
  
  return { normalized, resolved: resolvedTarget };
}

/**
 * Validate all paths in batch, collecting all errors
 * @param {string} basePath - Base installation directory
 * @param {string[]} paths - Paths to validate
 * @returns {Object} { valid: [], invalid: [], totalErrors: number }
 */
export function validateAllPaths(basePath, paths) {
  const results = {
    valid: [],
    invalid: [],
    totalErrors: 0
  };
  
  for (const inputPath of paths) {
    try {
      const validated = validatePath(basePath, inputPath);
      results.valid.push({
        input: inputPath,
        normalized: validated.normalized,
        resolved: validated.resolved
      });
    } catch (error) {
      results.invalid.push({
        input: inputPath,
        error: error.message,
        details: error.details
      });
      results.totalErrors++;
    }
  }
  
  return results;
}

/**
 * Helper: Check if filename is Windows reserved name
 * @param {string} filename - Filename to check
 * @returns {boolean} True if reserved name
 */
export function isWindowsReservedName(filename) {
  const basename = filename.split('.')[0].toUpperCase();
  return WINDOWS_RESERVED.includes(basename);
}
