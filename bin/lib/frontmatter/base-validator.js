// bin/lib/frontmatter/base-validator.js

/**
 * Base validator class for skill frontmatter validation
 * Uses template method pattern for extensibility
 * Subclasses implement platform-specific validation logic
 */

import { ValidationError } from './validation-error.js';
import { validateName, validateDescription } from './field-validators.js';

/**
 * BaseValidator class
 * Orchestrates validation flow using template method pattern
 */
export class BaseValidator {
  /**
   * Create a base validator
   * @param {string} platform - Platform name (claude, copilot, codex)
   */
  constructor(platform) {
    if (!platform) {
      throw new Error('Platform is required for validator');
    }
    this.platform = platform;
  }

  /**
   * Validate frontmatter (template method)
   * Orchestrates validation flow in specific order:
   * 1. Structure validation (shared)
   * 2. Required fields validation (shared)
   * 3. Optional fields validation (platform-specific)
   * 4. Unknown fields validation (platform-specific)
   * 
   * Uses fail-fast approach - stops on first error
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   * @param {string} context.templateName - Name of template being validated
   * @param {string} context.filePath - Path to file being validated
   * @param {string} context.platform - Target platform
   * @throws {ValidationError} If validation fails
   */
  validate(frontmatter, context) {
    // Step 1: Validate structure
    this.validateStructure(frontmatter, context);
    
    // Step 2: Validate required fields
    this.validateRequiredFields(frontmatter, context);
    
    // Step 3: Validate optional fields (platform-specific hook)
    this.validateOptionalFields(frontmatter, context);
    
    // Step 4: Validate unknown fields (platform-specific hook)
    this.validateUnknownFields(frontmatter, context);
  }

  /**
   * Validate frontmatter structure
   * Shared implementation - checks object is valid and not empty
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   * @throws {ValidationError} If structure is invalid
   */
  validateStructure(frontmatter, context) {
    // Check frontmatter is not null or undefined
    if (frontmatter === null || frontmatter === undefined) {
      throw new ValidationError(
        'Frontmatter is missing or invalid',
        {
          template: context.templateName,
          platform: context.platform,
          field: 'frontmatter',
          value: frontmatter,
          expected: 'Valid YAML object with required fields',
          spec: 'https://agentskills.io/specification'
        }
      );
    }

    // Check frontmatter is an object
    if (typeof frontmatter !== 'object') {
      throw new ValidationError(
        'Frontmatter must be an object',
        {
          template: context.templateName,
          platform: context.platform,
          field: 'frontmatter',
          value: typeof frontmatter,
          expected: 'YAML object with required fields',
          spec: 'https://agentskills.io/specification'
        }
      );
    }

    // Check frontmatter is not empty
    if (Object.keys(frontmatter).length === 0) {
      throw new ValidationError(
        'Frontmatter cannot be empty',
        {
          template: context.templateName,
          platform: context.platform,
          field: 'frontmatter',
          value: '{}',
          expected: 'YAML object with at least name and description fields',
          spec: 'https://agentskills.io/specification'
        }
      );
    }
  }

  /**
   * Validate required fields
   * Shared implementation - delegates to field validators
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   * @throws {ValidationError} If required field validation fails
   */
  validateRequiredFields(frontmatter, context) {
    // Validate name field (required)
    validateName(frontmatter.name, context);
    
    // Validate description field (required)
    validateDescription(frontmatter.description, context);
  }

  /**
   * Validate optional fields
   * Hook method - must be implemented by subclasses
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   * @throws {Error} If not implemented by subclass
   */
  validateOptionalFields(frontmatter, context) {
    throw new Error(
      `${this.platform}: validateOptionalFields() must be implemented by subclass`
    );
  }

  /**
   * Validate unknown fields
   * Hook method - must be implemented by subclasses
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   * @throws {Error} If not implemented by subclass
   */
  validateUnknownFields(frontmatter, context) {
    throw new Error(
      `${this.platform}: validateUnknownFields() must be implemented by subclass`
    );
  }
}
