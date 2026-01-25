import chalk from 'chalk';

/**
 * Error code-specific messages and fixes
 */
const ERROR_MESSAGES = {
  EACCES: (path) => ({
    message: `Permission denied to write ${path}`,
    fix: `Check directory permissions or create the directory manually:\n  mkdir -p ${path}`
  }),
  ENOSPC: () => ({
    message: 'No space left on device',
    fix: 'Free up disk space and try again'
  }),
  ENOENT: (path) => ({
    message: `File or directory not found: ${path}`,
    fix: 'Check that the source files exist'
  }),
  EEXIST: (path) => ({
    message: `File already exists: ${path}`,
    fix: 'Remove existing file or use --force flag'
  })
};

/**
 * Format an error with actionable guidance
 * @param {Error} error - Error object
 * @returns {string} - Formatted error message
 */
export function formatError(error) {
  const errorCode = error.code;
  const path = error.path || error.dest || '';
  
  // Check if we have a specific error message
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    const { message, fix } = ERROR_MESSAGES[errorCode](path);
    
    let output = chalk.red(`✗ ${message}`);
    output += '\n\n';
    output += chalk.dim(`Fix: ${fix}`);
    
    return output;
  }
  
  // Generic error format
  return chalk.red(`✗ ${error.message}`);
}

/**
 * Create a custom error with code and metadata
 * @param {string} message - Error message
 * @param {string} code - Error code (e.g., 'EACCES', 'ENOSPC')
 * @param {Object} meta - Additional metadata
 * @returns {Error} - Error instance with custom properties
 */
export function createError(message, code, meta = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, meta);
  return error;
}

/**
 * Check if an error is expected (has specific handling)
 * @param {Error} error - Error object
 * @returns {boolean} - True if error is expected
 */
export function isExpectedError(error) {
  return error.code && ERROR_MESSAGES.hasOwnProperty(error.code);
}
