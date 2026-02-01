// bin/lib/config/paths.js

/**
 * CENTRALIZED PATH CONFIGURATION
 * 
 * This module centralizes all path-related constants for easy maintenance.
 * When adding new installation targets, add them to ALLOWED_DIRS.
 * 
 * Used by:
 * - bin/lib/validation/path-validator.js - Security validation
 * - Future modules that need path allowlist
 */

/**
 * Allowed installation directory names
 * These are the only top-level directories where GSD can install files
 * 
 * To add a new platform:
 * 1. Add directory name here
 * 2. Create corresponding adapter in bin/lib/platforms/
 * 3. Update platform registry
 */
export const ALLOWED_DIRS = [
  '.claude',
  '.github',
  '.codex',
  'get-shit-done'
];

/**
 * Windows reserved names (for cross-platform validation)
 * These filenames are reserved by Windows and cannot be used
 */
export const WINDOWS_RESERVED = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];
