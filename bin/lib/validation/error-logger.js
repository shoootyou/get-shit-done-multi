// bin/lib/validation/error-logger.js

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ensureDirectory } from '../io/file-operations.js';

/**
 * Log installation error to file
 * @param {Error} error - Error object
 * @param {Object} context - Installation context
 * @param {string} context.platform - Platform name
 * @param {string} context.scope - 'global' or 'local'
 * @param {string} context.phase - Installation phase (Skills, Agents, Shared)
 * @param {string} context.targetDir - Target directory
 */
export async function logInstallationError(error, context) {
  const logPath = join(context.targetDir, '.gsd-error.log');
  const logContent = formatErrorLog(error, context);
  
  try {
    await ensureDirectory(context.targetDir);
    await writeFile(logPath, logContent, 'utf8');
  } catch (logError) {
    // If we can't write error log, at least warn
    console.error('Warning: Could not write error log:', logError.message);
  }
}

/**
 * Format error log content (structured text, human-readable)
 */
function formatErrorLog(error, context) {
  const lines = [
    'GSD Installation Error Log',
    `Generated: ${new Date().toISOString()}`,
    '',
    `ERROR: ${error.message}`,
    '',
    'Installation Details:',
    `  Platform: ${context.platform}`,
    `  Scope: ${context.scope}`,
    `  Phase: ${context.phase}`,
    `  Target: ${context.targetDir}`,
    ''
  ];
  
  // Add error details if available
  if (error.code) {
    lines.push('Error Details:');
    lines.push(`  Code: ${error.code}`);
    if (error.details) {
      Object.entries(error.details).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`);
      });
    }
    lines.push('');
  }
  
  // Add stack trace
  if (error.stack) {
    lines.push('Stack Trace:');
    error.stack.split('\n').forEach(line => {
      lines.push(`  ${line}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format user-friendly validation error message for terminal
 * Shows technical details + actionable guidance (context decision 2.4)
 */
export function formatValidationError(error) {
  const lines = [];
  
  lines.push(`✗ Validation failed: ${error.message}`);
  lines.push('');
  
  // Add specific guidance based on error type
  if (error.code === 5) { // INSUFFICIENT_SPACE
    const { requiredMB, availableMB, path } = error.details || {};
    if (requiredMB && availableMB) {
      lines.push('Details:');
      lines.push(`  Required: ${requiredMB} MB (including 10% buffer)`);
      lines.push(`  Available: ${availableMB} MB`);
      lines.push(`  Location: ${path}`);
      lines.push('');
      
      const needMB = (parseFloat(requiredMB) - parseFloat(availableMB)).toFixed(2);
      lines.push(`Fix: Free up at least ${needMB} MB and try again`);
    }
  } else if (error.code === 4) { // PERMISSION_DENIED
    const { path } = error.details || {};
    if (path) {
      lines.push('Details:');
      lines.push(`  Location: ${path}`);
      lines.push('');
      lines.push('Fix: Check directory permissions');
      lines.push(`Try: chmod +w ${path}`);
    }
  } else if (error.code === 6) { // INVALID_PATH
    const { path, reason } = error.details || {};
    if (path) {
      lines.push('Details:');
      lines.push(`  Path: ${path}`);
      if (reason) lines.push(`  Reason: ${reason}`);
      lines.push('');
      lines.push('Fix: Use a valid installation path');
    }
  }
  
  return lines.join('\n');
}

/**
 * Format runtime error message (user-friendly only, no technical details)
 * Contrast with validation errors which show both (context decision 4.4)
 */
export function formatRuntimeError(error, targetDir) {
  const lines = [];
  
  lines.push(`✗ Installation failed: ${error.message}`);
  lines.push('');
  
  if (error.code === 4) { // PERMISSION_DENIED
    const { path } = error.details || {};
    lines.push(`The installer couldn't write to ${path || targetDir}`);
    lines.push('');
    lines.push('Fix: Check directory permissions');
    lines.push(`Try: chmod +w ${path || targetDir}`);
  } else {
    lines.push('An unexpected error occurred during installation');
  }
  
  lines.push('');
  lines.push(`Details saved to: ${join(targetDir, '.gsd-error.log')}`);
  
  return lines.join('\n');
}
