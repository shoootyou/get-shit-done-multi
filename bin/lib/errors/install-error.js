// bin/lib/errors/install-error.js

/**
 * Custom error class for installation failures
 * Includes exit codes for different failure modes
 */

export class InstallError extends Error {
  constructor(message, code = 1, details = null) {
    super(message);
    this.name = 'InstallError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Exit codes
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGS: 2,
  MISSING_TEMPLATES: 3,
  PERMISSION_DENIED: 4,
  INSUFFICIENT_SPACE: 5
};

/**
 * Factory functions for common errors
 */
export function invalidArgs(message, details = null) {
  return new InstallError(message, EXIT_CODES.INVALID_ARGS, details);
}

export function missingTemplates(message, details = null) {
  return new InstallError(message, EXIT_CODES.MISSING_TEMPLATES, details);
}

export function permissionDenied(message, details = null) {
  return new InstallError(message, EXIT_CODES.PERMISSION_DENIED, details);
}

export function insufficientSpace(message, details = null) {
  return new InstallError(message, EXIT_CODES.INSUFFICIENT_SPACE, details);
}
