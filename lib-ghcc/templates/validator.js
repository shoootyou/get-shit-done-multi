/**
 * Template Validation Module
 * 
 * Provides validation logic for templates and generated content.
 * Ensures template structure integrity and content quality.
 * 
 * @module lib-ghcc/templates/validator
 */

import { VALIDATION_TYPES, SECTION_TYPES } from './types.js';

/**
 * TemplateValidator - Validate templates and generated content
 * 
 * Features:
 * - Template structure validation
 * - Content validation against schemas
 * - Custom validation rules
 * - Comprehensive error reporting
 * 
 * @example
 * const validator = new TemplateValidator();
 * const result = validator.validateTemplate(template);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export class TemplateValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate template structure
   * @param {import('./types.js').SpecMigrationTemplate} template
   * @returns {ValidationResult}
   */
  validateTemplate(template) {
    this.errors = [];
    this.warnings = [];

    // Check required fields
    this.validateRequiredFields(template, [
      'id', 'name', 'version', 'description', 'sections'
    ]);

    // Validate template ID format
    if (template.id && !this.isValidId(template.id)) {
      this.errors.push({
        code: 'INVALID_ID',
        message: 'Template ID must be alphanumeric with hyphens',
        field: 'id',
        value: template.id
      });
    }

    // Validate version format (semver)
    if (template.version && !this.isValidVersion(template.version)) {
      this.errors.push({
        code: 'INVALID_VERSION',
        message: 'Template version must follow semver format (x.y.z)',
        field: 'version',
        value: template.version
      });
    }

    // Validate sections
    if (template.sections) {
      this.validateSections(template.sections);
    }

    // Validate validation schema
    if (template.validation) {
      this.validateValidationSchema(template.validation);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate required fields exist
   * @private
   * @param {Object} obj
   * @param {string[]} fields
   */
  validateRequiredFields(obj, fields) {
    for (const field of fields) {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
        this.errors.push({
          code: 'MISSING_FIELD',
          message: `Required field '${field}' is missing`,
          field
        });
      }
    }
  }

  /**
   * Validate ID format
   * @private
   * @param {string} id
   * @returns {boolean}
   */
  isValidId(id) {
    return /^[a-z0-9-]+$/.test(id);
  }

  /**
   * Validate version format (semver)
   * @private
   * @param {string} version
   * @returns {boolean}
   */
  isValidVersion(version) {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Validate sections array
   * @private
   * @param {import('./types.js').TemplateSection[]} sections
   */
  validateSections(sections) {
    if (!Array.isArray(sections)) {
      this.errors.push({
        code: 'INVALID_SECTIONS',
        message: 'Sections must be an array',
        field: 'sections',
        value: typeof sections
      });
      return;
    }

    if (sections.length === 0) {
      this.warnings.push({
        code: 'EMPTY_SECTIONS',
        message: 'Template has no sections',
        field: 'sections'
      });
      return;
    }

    const sectionIds = new Set();
    const orders = new Set();

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Check required section fields
      this.validateRequiredFields(section, [
        'id', 'title', 'description', 'required', 'order', 'type'
      ]);

      // Check for duplicate IDs
      if (section.id) {
        if (sectionIds.has(section.id)) {
          this.errors.push({
            code: 'DUPLICATE_SECTION_ID',
            message: `Duplicate section ID: ${section.id}`,
            field: `sections[${i}].id`,
            value: section.id
          });
        }
        sectionIds.add(section.id);
      }

      // Check for duplicate orders
      if (typeof section.order === 'number') {
        if (orders.has(section.order)) {
          this.warnings.push({
            code: 'DUPLICATE_ORDER',
            message: `Multiple sections have order ${section.order}`,
            field: `sections[${i}].order`,
            value: section.order
          });
        }
        orders.add(section.order);
      }

      // Validate section type
      if (section.type && !Object.values(SECTION_TYPES).includes(section.type)) {
        this.errors.push({
          code: 'INVALID_SECTION_TYPE',
          message: `Invalid section type: ${section.type}`,
          field: `sections[${i}].type`,
          value: section.type
        });
      }

      // Validate boolean fields
      if (typeof section.required !== 'boolean') {
        this.errors.push({
          code: 'INVALID_REQUIRED',
          message: 'Section required field must be boolean',
          field: `sections[${i}].required`,
          value: section.required
        });
      }
    }
  }

  /**
   * Validate validation schema
   * @private
   * @param {import('./types.js').ValidationSchema} schema
   */
  validateValidationSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      this.errors.push({
        code: 'INVALID_VALIDATION_SCHEMA',
        message: 'Validation schema must be an object',
        field: 'validation',
        value: typeof schema
      });
      return;
    }

    if (schema.sections && typeof schema.sections !== 'object') {
      this.errors.push({
        code: 'INVALID_SECTIONS_SCHEMA',
        message: 'Validation schema sections must be an object',
        field: 'validation.sections',
        value: typeof schema.sections
      });
      return;
    }

    // Validate individual section rules
    if (schema.sections) {
      for (const [sectionId, rules] of Object.entries(schema.sections)) {
        if (!Array.isArray(rules)) {
          this.errors.push({
            code: 'INVALID_RULES',
            message: `Validation rules for ${sectionId} must be an array`,
            field: `validation.sections.${sectionId}`,
            value: typeof rules
          });
          continue;
        }

        for (let i = 0; i < rules.length; i++) {
          this.validateRule(rules[i], `validation.sections.${sectionId}[${i}]`);
        }
      }
    }
  }

  /**
   * Validate a single validation rule
   * @private
   * @param {import('./types.js').ValidationRule} rule
   * @param {string} fieldPath
   */
  validateRule(rule, fieldPath) {
    if (typeof rule !== 'object' || rule === null) {
      this.errors.push({
        code: 'INVALID_RULE',
        message: 'Validation rule must be an object',
        field: fieldPath,
        value: typeof rule
      });
      return;
    }

    // Check required rule fields
    if (!rule.type) {
      this.errors.push({
        code: 'MISSING_RULE_TYPE',
        message: 'Validation rule must have a type',
        field: `${fieldPath}.type`
      });
    }

    if (!rule.message) {
      this.warnings.push({
        code: 'MISSING_RULE_MESSAGE',
        message: 'Validation rule should have an error message',
        field: `${fieldPath}.message`
      });
    }

    // Validate rule type
    if (rule.type && !Object.values(VALIDATION_TYPES).includes(rule.type)) {
      this.errors.push({
        code: 'INVALID_RULE_TYPE',
        message: `Invalid validation rule type: ${rule.type}`,
        field: `${fieldPath}.type`,
        value: rule.type
      });
    }

    // Validate rule value based on type
    if (rule.type === VALIDATION_TYPES.MIN_LENGTH || rule.type === VALIDATION_TYPES.MAX_LENGTH) {
      if (typeof rule.value !== 'number' || rule.value < 0) {
        this.errors.push({
          code: 'INVALID_RULE_VALUE',
          message: `${rule.type} rule value must be a non-negative number`,
          field: `${fieldPath}.value`,
          value: rule.value
        });
      }
    }

    if (rule.type === VALIDATION_TYPES.PATTERN) {
      if (typeof rule.value !== 'string') {
        this.errors.push({
          code: 'INVALID_RULE_VALUE',
          message: 'Pattern rule value must be a string (regex pattern)',
          field: `${fieldPath}.value`,
          value: rule.value
        });
      } else {
        try {
          new RegExp(rule.value);
        } catch (e) {
          this.errors.push({
            code: 'INVALID_REGEX',
            message: `Invalid regex pattern: ${e.message}`,
            field: `${fieldPath}.value`,
            value: rule.value
          });
        }
      }
    }
  }

  /**
   * Validate generated content
   * @param {string} content
   * @param {import('./types.js').SpecMigrationTemplate} template
   * @returns {ValidationResult}
   */
  validateContent(content, template) {
    this.errors = [];
    this.warnings = [];

    if (typeof content !== 'string') {
      this.errors.push({
        code: 'INVALID_CONTENT',
        message: 'Content must be a string',
        value: typeof content
      });
      return {
        valid: false,
        errors: this.errors,
        warnings: this.warnings
      };
    }

    // Check minimum content length
    if (content.length < 100) {
      this.warnings.push({
        code: 'SHORT_CONTENT',
        message: 'Generated content is very short (less than 100 characters)',
        value: content.length
      });
    }

    // Check for required sections in content
    for (const section of template.sections) {
      if (section.required && !content.includes(section.title)) {
        this.warnings.push({
          code: 'MISSING_SECTION',
          message: `Required section '${section.title}' not found in content`,
          section: section.id
        });
      }
    }

    // Check for placeholder text (indicates incomplete generation)
    const placeholderPatterns = [
      /\[.*?No data available.*?\]/gi,
      /\[.*?TODO.*?\]/gi,
      /\[.*?PLACEHOLDER.*?\]/gi
    ];

    for (const pattern of placeholderPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        this.warnings.push({
          code: 'PLACEHOLDER_FOUND',
          message: `Placeholder text found in content: ${matches[0]}`,
          suggestion: 'Review and complete placeholder sections'
        });
      }
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate OpenAPI spec structure
   * @param {Object} spec
   * @returns {ValidationResult}
   */
  validateOpenApiSpec(spec) {
    this.errors = [];
    this.warnings = [];

    if (typeof spec !== 'object' || spec === null) {
      this.errors.push({
        code: 'INVALID_SPEC',
        message: 'OpenAPI spec must be an object',
        value: typeof spec
      });
      return {
        valid: false,
        errors: this.errors,
        warnings: this.warnings
      };
    }

    // Check for OpenAPI version
    if (!spec.openapi && !spec.swagger) {
      this.errors.push({
        code: 'MISSING_VERSION',
        message: 'OpenAPI spec must have openapi or swagger version field',
        field: 'openapi'
      });
    }

    // Check for info object
    if (!spec.info) {
      this.errors.push({
        code: 'MISSING_INFO',
        message: 'OpenAPI spec must have info object',
        field: 'info'
      });
    } else {
      if (!spec.info.title) {
        this.warnings.push({
          code: 'MISSING_TITLE',
          message: 'OpenAPI spec info should have a title',
          field: 'info.title'
        });
      }
      if (!spec.info.version) {
        this.warnings.push({
          code: 'MISSING_VERSION',
          message: 'OpenAPI spec info should have a version',
          field: 'info.version'
        });
      }
    }

    // Check for paths
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      this.warnings.push({
        code: 'NO_PATHS',
        message: 'OpenAPI spec has no paths defined',
        field: 'paths'
      });
    }

    // Check for schemas
    const hasSchemas = 
      (spec.components && spec.components.schemas && Object.keys(spec.components.schemas).length > 0) ||
      (spec.definitions && Object.keys(spec.definitions).length > 0);

    if (!hasSchemas) {
      this.warnings.push({
        code: 'NO_SCHEMAS',
        message: 'OpenAPI spec has no schemas defined',
        field: 'components.schemas'
      });
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Create a validation result summary
   * @param {ValidationResult} result
   * @returns {string}
   */
  formatValidationResult(result) {
    let output = '';

    if (result.valid) {
      output += '✓ Validation passed\n';
    } else {
      output += '✗ Validation failed\n';
    }

    if (result.errors.length > 0) {
      output += `\nErrors (${result.errors.length}):\n`;
      for (const error of result.errors) {
        output += `  - [${error.code}] ${error.message}\n`;
        if (error.field) output += `    Field: ${error.field}\n`;
        if (error.value !== undefined) output += `    Value: ${error.value}\n`;
      }
    }

    if (result.warnings.length > 0) {
      output += `\nWarnings (${result.warnings.length}):\n`;
      for (const warning of result.warnings) {
        output += `  - [${warning.code}] ${warning.message}\n`;
        if (warning.field) output += `    Field: ${warning.field}\n`;
        if (warning.suggestion) output += `    Suggestion: ${warning.suggestion}\n`;
      }
    }

    return output;
  }
}

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {Array} errors - Validation errors
 * @property {Array} warnings - Validation warnings
 */

/**
 * Quick validation helper
 * @param {import('./types.js').SpecMigrationTemplate} template
 * @returns {ValidationResult}
 */
export function validateTemplate(template) {
  const validator = new TemplateValidator();
  return validator.validateTemplate(template);
}

/**
 * Quick content validation helper
 * @param {string} content
 * @param {import('./types.js').SpecMigrationTemplate} template
 * @returns {ValidationResult}
 */
export function validateContent(content, template) {
  const validator = new TemplateValidator();
  return validator.validateContent(content, template);
}

/**
 * Quick OpenAPI spec validation helper
 * @param {Object} spec
 * @returns {ValidationResult}
 */
export function validateOpenApiSpec(spec) {
  const validator = new TemplateValidator();
  return validator.validateOpenApiSpec(spec);
}
