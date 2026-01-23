/**
 * Error handling utilities for command system
 * Provides structured error types and user-friendly formatting
 * @module command-system/error-handler
 */

/**
 * CommandError class for structured command execution errors
 * Extends Error with error codes and actionable suggestions
 */
export class CommandError extends Error {
  /**
   * @param {string} message - Error message describing what went wrong
   * @param {string} code - Error code for programmatic handling (e.g., 'COMMAND_NOT_FOUND', 'INVALID_ARGS')
   * @param {string[]} suggestions - Array of actionable suggestions to help user resolve the error
   */
  constructor(message, code, suggestions = []) {
    super(message);
    this.name = 'CommandError';
    this.code = code;
    this.suggestions = suggestions;
    Error.captureStackTrace(this, CommandError);
  }
}

/**
 * Format error into user-friendly message with suggestions
 * @param {Error} error - Error object to format
 * @param {string} commandName - Name of command that failed
 * @returns {string} Formatted error message with suggestions
 */
export function formatError(error, commandName) {
  if (error instanceof CommandError) {
    // Structured CommandError with suggestions
    let formatted = `❌ ${error.message}\n`;
    
    if (error.suggestions && error.suggestions.length > 0) {
      formatted += '\nSuggestions:\n';
      for (const suggestion of error.suggestions) {
        formatted += `  • ${suggestion}\n`;
      }
    }
    
    return formatted.trimEnd();
  }
  
  // Generic error - provide basic help
  let formatted = `❌ Error executing command '${commandName}'\n`;
  formatted += `\nMessage: ${error.message}\n`;
  formatted += '\nSuggestions:\n';
  formatted += '  • Run /gsd-help for available commands\n';
  formatted += `  • Run /gsd-help ${commandName} for command-specific help\n`;
  formatted += '  • Check the command syntax and arguments\n';
  
  return formatted.trimEnd();
}

/**
 * Generate graceful degradation message when feature is unavailable
 * Explains missing feature and continues with limited functionality
 * @param {string} feature - Name of the unavailable feature
 * @param {string} cli - Name of the CLI lacking this feature
 * @returns {string} Formatted degradation message
 */
export function degradeGracefully(feature, cli) {
  let formatted = `⚠️  Feature not available: ${feature}\n`;
  formatted += `\nThe '${feature}' feature is not supported in ${cli}.\n`;
  formatted += 'Command will continue with limited functionality.\n';
  
  return formatted.trimEnd();
}
