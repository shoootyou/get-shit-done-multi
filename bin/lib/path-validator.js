/**
 * Platform-specific path validation utilities
 * Validates paths against OS-specific constraints
 */

const fs = require('fs');

/**
 * Check if running under Windows Subsystem for Linux
 * @returns {boolean} True if WSL detected
 */
function isWSL() {
  if (process.platform !== 'linux') return false;
  
  // Check /proc/version for Microsoft/WSL indicators
  try {
    const procVersion = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (procVersion.includes('microsoft') || procVersion.includes('wsl')) {
      return true;
    }
  } catch (e) {
    // /proc/version not readable, continue to next check
  }
  
  // Check for /mnt/c (typical WSL mount point)
  try {
    fs.statSync('/mnt/c');
    return true;
  } catch (e) {
    // /mnt/c doesn't exist
  }
  
  return false;
}

/**
 * Get effective platform for path validation
 * Treats WSL as Linux, not Windows
 * @returns {string} Platform identifier ('win32', 'darwin', 'linux', etc.)
 */
function getEffectivePlatform() {
  if (isWSL()) return 'linux';
  return process.platform;
}

/**
 * Validate path against platform-specific constraints
 * @param {string} targetPath - Path to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validatePath(targetPath) {
  const errors = [];
  const effectivePlatform = getEffectivePlatform();
  
  if (!targetPath || typeof targetPath !== 'string') {
    errors.push('Path must be a non-empty string');
    return { valid: false, errors };
  }
  
  // Windows-specific validation
  if (effectivePlatform === 'win32') {
    // Check for invalid characters: < > " | ? * and control chars (0x00-0x1f)
    // Note: : is only valid after drive letter (e.g., C:)
    const invalidCharsRegex = /[<>"|?*\x00-\x1f]/;
    
    // Check for invalid colons (not after drive letter)
    const invalidColonRegex = /(?!^[A-Za-z]:)[:<]/;
    
    if (invalidCharsRegex.test(targetPath)) {
      const matches = targetPath.match(invalidCharsRegex);
      errors.push(`Path contains invalid Windows characters: ${matches ? matches.join(', ') : 'control characters'}`);
    } else if (invalidColonRegex.test(targetPath.slice(2))) {
      // Check for colons after the drive letter position
      errors.push(`Path contains invalid Windows characters: :`);
    }
    
    // Check for reserved names (case-insensitive)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    const pathParts = targetPath.split(/[/\\]/);
    for (const part of pathParts) {
      // Remove extension for basename check
      const basename = part.split('.')[0];
      if (reservedNames.test(basename)) {
        errors.push(`Path contains reserved Windows name: ${part}`);
        break;
      }
    }
    
    // Check path length (MAX_PATH = 260 on Windows)
    if (targetPath.length > 260) {
      errors.push(`Path exceeds Windows maximum length of 260 characters (current: ${targetPath.length})`);
    }
  }
  
  // Unix-specific validation (macOS and Linux)
  if (effectivePlatform === 'darwin' || effectivePlatform === 'linux') {
    let maxLength;
    
    // macOS: conservative 1024 character limit
    // Linux: 4096 character limit
    if (effectivePlatform === 'darwin') {
      maxLength = 1024;
    } else {
      maxLength = 4096;
    }
    
    if (targetPath.length > maxLength) {
      errors.push(`Path exceeds ${effectivePlatform === 'darwin' ? 'macOS' : 'Linux'} maximum length of ${maxLength} characters (current: ${targetPath.length})`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePath,
  getEffectivePlatform,
  isWSL
};
