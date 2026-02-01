// bin/lib/validation/path-validator.js

import path from 'path';
import sanitize from 'sanitize-filename';
import { invalidPath } from '../errors/install-error.js';
import { ALLOWED_DIRS, WINDOWS_RESERVED } from '../config/paths.js';

/**
 * PATH SECURITY VALIDATION MODULE
 * 
 * Defense-in-depth path validation with 8 security layers.
 * Integrated with Phase 5 transaction system for atomic rollback.
 * 
 * VALIDATION FLOW:
 * 1. Pre-installation: validatePaths() checks target directory
 * 2. Batch validation: validateAllPaths() checks all template paths
 * 3. Per-file validation: validatePath() checks each write after variable substitution
 * 
 * ERROR HANDLING:
 * - All validation errors throw InstallError with type 'invalid_path'
 * - Errors include detailed context (path, reason, layer that failed)
 * - Batch validation collects ALL errors before throwing (fail slow for reporting)
 * - Per-file validation fails fast (stops immediately on first violation)
 * 
 * ROLLBACK INTEGRATION (Phase 5):
 * - If validation fails BEFORE transaction begins: No rollback needed (nothing written)
 * - If validation fails DURING transaction: Transaction system triggers automatic rollback
 * - If validation fails AFTER transaction: InstallError triggers cleanup via orchestrator
 * 
 * Transaction integration points:
 * 1. Pre-install checks (BEFORE transaction) - validatePaths()
 * 2. Batch validation (BEFORE transaction) - validateAllPaths()
 * 3. Per-file writes (WITHIN transaction) - validatePath()
 * 
 * If any validation fails during file writes, Phase 5's transaction system will:
 * - Stop processing immediately
 * - Roll back all completed writes
 * - Restore original state
 * - Log error via error-logger.js
 * 
 * See: bin/lib/orchestration/transaction-manager.js for rollback implementation
 * See: bin/lib/errors/install-error.js for error types
 */

/**
 * Validate path with defense-in-depth approach (8 layers)
 * 
 * VALIDATION LAYERS:
 * 1. URL decode - catches %2e%2e%2f attacks
 * 2. Null byte check - catches \x00 injection
 * 3. Normalize - resolves ., .., //, etc.
 * 4. Path traversal check - rejects if .. remains after normalize
 * 5. Containment check - ensures path stays within base directory
 * 6. Allowlist check - only .claude, .github, .codex, get-shit-done allowed
 * 7. Length validation - enforces OS limits (260 Windows, 4096 Unix)
 * 8. Component validation - checks Windows reserved names, 255 char limit
 * 
 * ERROR BEHAVIOR:
 * - Throws InstallError immediately on first violation (fail fast)
 * - Error includes which layer failed and why
 * - If called within transaction, triggers automatic rollback
 * 
 * @param {string} basePath - Base installation directory
 * @param {string} inputPath - Path to validate (may be relative)
 * @returns {Object} { normalized, resolved } if valid
 * @throws {InstallError} If path fails any validation layer
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
