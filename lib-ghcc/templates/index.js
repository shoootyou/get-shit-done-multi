/**
 * Template System for Spec Migration Documentation
 * 
 * Main entry point for the template generation system.
 * Provides unified API for template operations.
 * 
 * @module lib-ghcc/templates
 */

// Core components
export { TemplateGenerator, createDefaultTemplate } from './generator.js';
export { TemplateRegistry, createRegistry } from './registry.js';
export { 
  TemplateValidator, 
  validateTemplate, 
  validateContent,
  validateOpenApiSpec 
} from './validator.js';

// Type definitions and constants
export { 
  SECTION_TYPES, 
  VALIDATION_TYPES, 
  DEFAULT_SECTIONS,
  DEFAULT_VALIDATION_SCHEMA 
} from './types.js';

/**
 * Create a complete template system instance
 * @param {string} [registryDir] - Template registry directory
 * @returns {Object} Template system API
 */
export function createTemplateSystem(registryDir = '.planning/templates') {
  const registry = new TemplateRegistry(registryDir);
  const validator = new TemplateValidator();
  
  return {
    registry,
    validator,
    
    /**
     * Generate document from template
     * @param {string} templateId - Template to use
     * @param {Object} openApiSpec - OpenAPI specification
     * @param {Object} [options] - Generation options
     * @returns {Promise<import('./types.js').TemplateGenerationResult>}
     */
    async generateDocument(templateId, openApiSpec, options = {}) {
      // Get template from registry
      const template = await registry.getTemplate(templateId);
      if (!template) {
        return {
          success: false,
          errors: [{
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template '${templateId}' not found in registry`
          }],
          warnings: [],
          metadata: {}
        };
      }
      
      // Validate template
      const templateValidation = validator.validateTemplate(template);
      if (!templateValidation.valid) {
        return {
          success: false,
          errors: templateValidation.errors,
          warnings: templateValidation.warnings,
          metadata: { templateId }
        };
      }
      
      // Validate OpenAPI spec
      const specValidation = validator.validateOpenApiSpec(openApiSpec);
      if (!specValidation.valid) {
        return {
          success: false,
          errors: specValidation.errors,
          warnings: specValidation.warnings,
          metadata: { templateId }
        };
      }
      
      // Generate document
      const generator = new TemplateGenerator(template);
      const result = await generator.generate({
        openApiSpec,
        options,
        metadata: { templateId }
      });
      
      // Validate generated content
      if (result.success && result.output) {
        const contentValidation = validator.validateContent(result.output, template);
        result.warnings = [...result.warnings, ...contentValidation.warnings];
      }
      
      return result;
    },
    
    /**
     * Register a new template
     * @param {import('./types.js').SpecMigrationTemplate} template
     * @param {string} [filename] - Template filename
     * @param {string[]} [tags] - Classification tags
     * @returns {Promise<import('./types.js').TemplateRegistryEntry>}
     */
    async registerTemplate(template, filename, tags = []) {
      // Validate template before registration
      const validation = validator.validateTemplate(template);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors[0].message}`);
      }
      
      const path = filename || `${template.id}.json`;
      return await registry.registerTemplate(template, path, tags);
    },
    
    /**
     * List available templates
     * @param {Object} [filters] - Filter options
     * @returns {Promise<import('./types.js').TemplateRegistryEntry[]>}
     */
    async listTemplates(filters) {
      return await registry.listTemplates(filters);
    },
    
    /**
     * Search templates
     * @param {string} query - Search query
     * @returns {Promise<import('./types.js').TemplateRegistryEntry[]>}
     */
    async searchTemplates(query) {
      return await registry.searchTemplates(query);
    },
    
    /**
     * Get template by ID
     * @param {string} templateId
     * @returns {Promise<import('./types.js').SpecMigrationTemplate|null>}
     */
    async getTemplate(templateId) {
      return await registry.getTemplate(templateId);
    },
    
    /**
     * Initialize template system
     * @returns {Promise<void>}
     */
    async initialize() {
      await registry.initialize();
      
      // Register default template if no templates exist
      const templates = await registry.listTemplates();
      if (templates.length === 0) {
        const defaultTemplate = createDefaultTemplate();
        await this.registerTemplate(
          defaultTemplate, 
          'spec-migration-v1.json',
          ['default', 'spec-migration', 'typespec']
        );
      }
    },
    
    /**
     * Get system statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
      return await registry.getStats();
    }
  };
}

// Re-export core classes for direct use
import { TemplateGenerator } from './generator.js';
import { TemplateRegistry } from './registry.js';
import { TemplateValidator } from './validator.js';
