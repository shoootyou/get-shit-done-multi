// bin/lib/frontmatter/field-validators.js

/**
 * Field-level validators using Joi schemas
 * Enforces agentskills.io base specification rules
 */

import Joi from 'joi';
import { ValidationError } from './validation-error.js';

/**
 * Validate name field
 * Enforces: 1-64 chars, letters/numbers/hyphens only
 * 
 * @param {string} value - Name value to validate
 * @param {Object} context - Validation context
 * @param {string} context.templateName - Template name
 * @param {string} context.filePath - File path
 * @param {string} context.platform - Target platform
 * @throws {ValidationError} If validation fails
 * @returns {string} Validated value
 */
export function validateName(value, context) {
  // Create Joi schema for name field
  const schema = Joi.string()
    .min(1)
    .max(64)
    .pattern(/^[a-zA-Z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name must contain only letters, numbers, and hyphens',
      'string.max': 'Name must be 1-64 characters',
      'string.min': 'Name must be 1-64 characters',
      'any.required': 'Name field is required',
      'string.empty': 'Name field is required'
    });

  // Validate with fail-fast mode
  const result = schema.validate(value, { abortEarly: true });

  // Throw ValidationError on failure
  if (result.error) {
    throw new ValidationError(
      result.error.details[0].message,
      {
        template: context.templateName,
        platform: context.platform,
        field: 'name',
        value: value,
        expected: '1-64 characters, letters/numbers/hyphens only',
        spec: 'https://agentskills.io/specification#name-field'
      }
    );
  }

  return result.value;
}

/**
 * Validate description field
 * Enforces: max 1024 chars, safe characters only (letters, numbers, spaces, basic punctuation)
 * 
 * @param {string} value - Description value to validate
 * @param {Object} context - Validation context
 * @param {string} context.templateName - Template name
 * @param {string} context.filePath - File path
 * @param {string} context.platform - Target platform
 * @throws {ValidationError} If validation fails
 * @returns {string} Validated value
 */
export function validateDescription(value, context) {
  // Create Joi schema for description field
  const schema = Joi.string()
    .min(1)
    .max(1024)
    .pattern(/^[a-zA-Z0-9\s\-.,()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Description contains invalid characters (only letters, numbers, spaces, hyphens, periods, commas, parentheses allowed)',
      'string.max': 'Description must be maximum 1024 characters',
      'string.min': 'Description field is required',
      'any.required': 'Description field is required',
      'string.empty': 'Description field is required'
    });

  // Validate with fail-fast mode
  const result = schema.validate(value, { abortEarly: true });

  // Throw ValidationError on failure
  if (result.error) {
    throw new ValidationError(
      result.error.details[0].message,
      {
        template: context.templateName,
        platform: context.platform,
        field: 'description',
        value: value,
        expected: 'Maximum 1024 characters, safe characters only',
        spec: 'https://agentskills.io/specification'
      }
    );
  }

  return result.value;
}

/**
 * Validate frontmatter structure
 * Checks object is valid and not empty
 * 
 * @param {Object} frontmatter - Frontmatter object
 * @param {Object} context - Validation context
 * @throws {ValidationError} If structure is invalid
 */
export function validateStructure(frontmatter, context) {
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
