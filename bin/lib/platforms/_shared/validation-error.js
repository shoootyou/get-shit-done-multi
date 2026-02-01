// bin/lib/frontmatter/validation-error.js

/**
 * Custom error class for skill frontmatter validation failures
 * Provides formatted console output with all required context
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get package version from package.json
 * @returns {string} Package version
 */
function getPackageVersion() {
  try {
    const packageJsonPath = join(__dirname, '../../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * ValidationError class for frontmatter validation failures
 */
export class ValidationError extends Error {
  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {Object} details - Error details
   * @param {string} details.template - Template name (skill/agent name)
   * @param {string} details.platform - Target platform (claude, copilot, codex)
   * @param {string} details.field - Field name that failed validation
   * @param {*} details.value - Actual value that failed validation
   * @param {string} [details.expected] - Expected format description
   * @param {string} [details.spec] - Spec URL reference
   */
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details || {};
  }

  /**
   * Format error for console output
   * Returns a multi-line formatted string with all error context
   * @returns {string} Formatted error message
   */
  toConsoleOutput() {
    const lines = [];
    
    // Header with emoji and decorative line
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('❌ VALIDATION ERROR');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    
    // Context section
    lines.push('CONTEXT:');
    if (this.details.template) {
      lines.push(`  Template:  ${this.details.template}`);
    }
    if (this.details.platform) {
      lines.push(`  Platform:  ${this.details.platform}`);
    }
    if (this.details.field) {
      lines.push(`  Field:     ${this.details.field}`);
    }
    lines.push('');
    
    // Error message
    lines.push('ERROR:');
    lines.push(`  ${this.message}`);
    lines.push('');
    
    // Actual value (if provided)
    if (this.details.value !== undefined && this.details.value !== null) {
      lines.push('ACTUAL VALUE:');
      const valueStr = typeof this.details.value === 'string' 
        ? `"${this.details.value}"`
        : JSON.stringify(this.details.value);
      lines.push(`  ${valueStr}`);
      lines.push('');
    }
    
    // Expected format (if provided)
    if (this.details.expected) {
      lines.push('EXPECTED:');
      lines.push(`  ${this.details.expected}`);
      lines.push('');
    }
    
    // Spec URL (if provided)
    if (this.details.spec) {
      lines.push('SPECIFICATION:');
      lines.push(`  ${this.details.spec}`);
      lines.push('');
    }
    
    // Installation stopped message
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('Installation stopped due to validation failure.');
    lines.push('');
    
    // Report URL
    lines.push('REPORT ISSUE:');
    lines.push('  https://github.com/shoootyou/get-shit-done-multi/issues');
    lines.push('');
    
    // System info
    lines.push('SYSTEM INFO:');
    lines.push(`  Package:   get-shit-done-multi v${getPackageVersion()}`);
    lines.push(`  Node.js:   ${process.version}`);
    lines.push(`  Platform:  ${process.platform}`);
    lines.push('');
    
    // Footer decorative line
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    
    return lines.join('\n');
  }
}
