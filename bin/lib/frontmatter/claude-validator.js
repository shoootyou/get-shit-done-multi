// bin/lib/frontmatter/claude-validator.js

/**
 * Claude-specific skill validator
 * Extends base validator with Claude platform rules
 */

import { BaseValidator } from './base-validator.js';

// Platform name constant (reuse from platform-names.js pattern)
const CLAUDE = 'claude';

/**
 * ClaudeValidator class
 * Validates skills for Claude Code platform
 */
export class ClaudeValidator extends BaseValidator {
  /**
   * Supported platforms for this validator
   */
  static supportedPlatforms = [CLAUDE];

  /**
   * Create Claude validator
   */
  constructor() {
    super(CLAUDE);
    this.platformName = CLAUDE;
  }

  /**
   * Validate optional fields
   * Warns on invalid optional fields but does NOT throw
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   */
  validateOptionalFields(frontmatter, context) {
    // Validate allowed-tools field (optional)
    if (frontmatter['allowed-tools'] !== undefined) {
      this.validateAllowedTools(frontmatter['allowed-tools'], context);
    }

    // Validate argument-hint field (optional)
    if (frontmatter['argument-hint'] !== undefined) {
      this.validateArgumentHint(frontmatter['argument-hint'], context);
    }
  }

  /**
   * Validate unknown fields
   * Warns about unknown fields but does NOT throw
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   */
  validateUnknownFields(frontmatter, context) {
    // Define known fields for Claude platform
    const knownFields = [
      'name',
      'description',
      'allowed-tools',
      'argument-hint',
      'disable-model-invocation',
      'user-invocable',
      'model',
      'context',
      'agent',
      'hooks'
    ];

    // Find unknown fields
    const unknownFields = Object.keys(frontmatter).filter(
      key => !knownFields.includes(key)
    );

    // Warn about each unknown field
    for (const field of unknownFields) {
      console.warn(
        `⚠️  Unknown field '${field}' in ${context.templateName} (may be ignored by platform)`
      );
    }
  }

  /**
   * Validate allowed-tools field format
   * Expected: Comma-separated string with capitalized tool names
   * Example: "Read, Write, Bash"
   * 
   * @param {*} value - allowed-tools value
   * @param {Object} context - Validation context
   */
  validateAllowedTools(value, context) {
    // Check if value is a string
    if (typeof value !== 'string') {
      console.warn(
        `⚠️  VALIDATION WARNING: ${context.templateName} - allowed-tools: Expected string, got ${typeof value}`
      );
      return;
    }

    // Check format: comma-separated with capitalized words
    // Valid examples: "Read, Write, Bash", "Read", "Bash, Edit"
    const toolPattern = /^[A-Z][a-zA-Z]+(,\s*[A-Z][a-zA-Z]+)*$/;
    if (!toolPattern.test(value)) {
      console.warn(
        `⚠️  VALIDATION WARNING: ${context.templateName} - allowed-tools: Expected comma-separated capitalized tool names (e.g., "Read, Write, Bash")`
      );
    }
  }

  /**
   * Validate argument-hint field format
   * Expected: String or array
   * Example: "[issue-number]" or "[filename] [format]"
   * 
   * @param {*} value - argument-hint value
   * @param {Object} context - Validation context
   */
  validateArgumentHint(value, context) {
    // Check if value is string or array
    if (typeof value !== 'string' && !Array.isArray(value)) {
      console.warn(
        `⚠️  VALIDATION WARNING: ${context.templateName} - argument-hint: Expected string or array, got ${typeof value}`
      );
    }
  }
}
