/**
 * Template Types for Spec Migration Documentation
 * 
 * Defines data structures for TypeSpec migration template system.
 * Used to generate standardized migration documentation from OpenAPI specs.
 * 
 * @module lib-ghcc/templates/types
 */

/**
 * Template section definition
 * @typedef {Object} TemplateSection
 * @property {string} id - Unique section identifier
 * @property {string} title - Section display title
 * @property {string} description - Section purpose description
 * @property {boolean} required - Whether section is required
 * @property {number} order - Display order (lower = earlier)
 * @property {SectionType} type - Type of content in this section
 * @property {string} [placeholder] - Default placeholder text
 * @property {Object.<string, any>} [metadata] - Additional section metadata
 */

/**
 * Section content types
 * @typedef {'text' | 'list' | 'table' | 'code' | 'yaml' | 'markdown'} SectionType
 */

/**
 * Spec migration template structure
 * @typedef {Object} SpecMigrationTemplate
 * @property {string} id - Template unique identifier
 * @property {string} name - Template display name
 * @property {string} version - Template version (semver)
 * @property {string} description - Template purpose
 * @property {TemplateSection[]} sections - Ordered sections
 * @property {Object.<string, any>} defaults - Default values for sections
 * @property {ValidationSchema} validation - Validation rules
 * @property {Object.<string, any>} metadata - Additional template metadata
 */

/**
 * Template registry entry
 * @typedef {Object} TemplateRegistryEntry
 * @property {string} templateId - Template identifier
 * @property {string} path - Path to template file
 * @property {string} version - Template version
 * @property {string[]} tags - Classification tags
 * @property {boolean} active - Whether template is active
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} [updatedAt] - ISO timestamp of last update
 */

/**
 * Template registry
 * @typedef {Object} TemplateRegistry
 * @property {string} version - Registry version
 * @property {TemplateRegistryEntry[]} templates - Registered templates
 * @property {Object.<string, any>} metadata - Registry metadata
 */

/**
 * Validation rule types
 * @typedef {'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'} ValidationType
 */

/**
 * Validation rule
 * @typedef {Object} ValidationRule
 * @property {ValidationType} type - Type of validation
 * @property {any} value - Validation constraint value
 * @property {string} message - Error message if validation fails
 */

/**
 * Validation schema for template sections
 * @typedef {Object} ValidationSchema
 * @property {Object.<string, ValidationRule[]>} sections - Section-specific validation rules
 * @property {Object.<string, any>} [global] - Global validation rules
 */

/**
 * Template generation context
 * @typedef {Object} TemplateContext
 * @property {Object} openApiSpec - Source OpenAPI specification
 * @property {Object.<string, any>} options - Generation options
 * @property {Object.<string, any>} metadata - Additional context metadata
 */

/**
 * Template generation result
 * @typedef {Object} TemplateGenerationResult
 * @property {boolean} success - Whether generation succeeded
 * @property {string} [output] - Generated document content
 * @property {GenerationError[]} [errors] - Validation or generation errors
 * @property {GenerationWarning[]} [warnings] - Non-blocking warnings
 * @property {Object.<string, any>} metadata - Generation metadata
 */

/**
 * Generation error
 * @typedef {Object} GenerationError
 * @property {string} code - Error code
 * @property {string} message - Human-readable error message
 * @property {string} [section] - Section where error occurred
 * @property {string} [field] - Field that caused error
 * @property {any} [value] - Value that caused error
 */

/**
 * Generation warning
 * @typedef {Object} GenerationWarning
 * @property {string} code - Warning code
 * @property {string} message - Human-readable warning message
 * @property {string} [section] - Section where warning occurred
 * @property {string} [suggestion] - Suggested fix
 */

// Export type definitions for use in other modules
export const SECTION_TYPES = {
  TEXT: 'text',
  LIST: 'list',
  TABLE: 'table',
  CODE: 'code',
  YAML: 'yaml',
  MARKDOWN: 'markdown'
};

export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
};

/**
 * Default template section structure
 */
export const DEFAULT_SECTIONS = [
  {
    id: 'overview',
    title: 'Migration Overview',
    description: 'High-level summary of the API being migrated',
    required: true,
    order: 1,
    type: SECTION_TYPES.MARKDOWN,
    placeholder: 'Provide a brief overview of the API and migration goals'
  },
  {
    id: 'source-spec',
    title: 'Source Specification',
    description: 'Details of the OpenAPI specification being migrated',
    required: true,
    order: 2,
    type: SECTION_TYPES.YAML,
    placeholder: 'OpenAPI version, endpoints, schemas summary'
  },
  {
    id: 'endpoints',
    title: 'Endpoints',
    description: 'List of API endpoints to migrate',
    required: true,
    order: 3,
    type: SECTION_TYPES.TABLE,
    placeholder: 'Method | Path | Description | Priority'
  },
  {
    id: 'schemas',
    title: 'Schemas',
    description: 'Data models and schemas to migrate',
    required: true,
    order: 4,
    type: SECTION_TYPES.TABLE,
    placeholder: 'Schema Name | Type | Description | Dependencies'
  },
  {
    id: 'migration-strategy',
    title: 'Migration Strategy',
    description: 'Approach for converting OpenAPI to TypeSpec',
    required: true,
    order: 5,
    type: SECTION_TYPES.MARKDOWN,
    placeholder: 'Describe the migration approach and any special considerations'
  },
  {
    id: 'challenges',
    title: 'Challenges and Considerations',
    description: 'Known issues and special handling required',
    required: false,
    order: 6,
    type: SECTION_TYPES.LIST,
    placeholder: 'List any challenges or special considerations'
  },
  {
    id: 'dependencies',
    title: 'Dependencies',
    description: 'External dependencies and references',
    required: false,
    order: 7,
    type: SECTION_TYPES.LIST,
    placeholder: 'List any external dependencies or related specs'
  },
  {
    id: 'validation',
    title: 'Validation Criteria',
    description: 'How to verify the migration was successful',
    required: true,
    order: 8,
    type: SECTION_TYPES.LIST,
    placeholder: 'Define validation steps and success criteria'
  }
];

/**
 * Default validation schema
 */
export const DEFAULT_VALIDATION_SCHEMA = {
  sections: {
    overview: [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Overview section is required'
      },
      {
        type: VALIDATION_TYPES.MIN_LENGTH,
        value: 50,
        message: 'Overview must be at least 50 characters'
      }
    ],
    'source-spec': [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Source specification details are required'
      }
    ],
    endpoints: [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Endpoints list is required'
      }
    ],
    schemas: [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Schemas list is required'
      }
    ],
    'migration-strategy': [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Migration strategy is required'
      },
      {
        type: VALIDATION_TYPES.MIN_LENGTH,
        value: 100,
        message: 'Migration strategy must be at least 100 characters'
      }
    ],
    validation: [
      {
        type: VALIDATION_TYPES.REQUIRED,
        value: true,
        message: 'Validation criteria are required'
      }
    ]
  },
  global: {
    maxSectionLength: 5000,
    allowEmptyOptionalSections: true
  }
};
