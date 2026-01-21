/**
 * Template Generator for Spec Migration Documentation
 * 
 * Core engine for generating standardized migration documents from templates.
 * Supports section rendering, validation, and customization.
 * 
 * @module lib-ghcc/templates/generator
 */

import { 
  DEFAULT_SECTIONS, 
  DEFAULT_VALIDATION_SCHEMA,
  SECTION_TYPES,
  VALIDATION_TYPES 
} from './types.js';

/**
 * TemplateGenerator - Generate migration documents from templates
 * 
 * Features:
 * - Section-based document generation
 * - Content validation
 * - Customizable section rendering
 * - Error and warning collection
 * 
 * @example
 * const generator = new TemplateGenerator(template);
 * const result = await generator.generate(context);
 * if (result.success) {
 *   console.log(result.output);
 * }
 */
export class TemplateGenerator {
  /**
   * Create TemplateGenerator instance
   * @param {import('./types.js').SpecMigrationTemplate} template - Template to use
   */
  constructor(template) {
    this.template = template;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Generate document from template
   * @param {import('./types.js').TemplateContext} context - Generation context
   * @returns {Promise<import('./types.js').TemplateGenerationResult>}
   */
  async generate(context) {
    this.errors = [];
    this.warnings = [];

    try {
      // Validate context
      this.validateContext(context);
      
      // Extract data from OpenAPI spec
      const data = this.extractData(context);
      
      // Validate template data
      this.validateData(data);
      
      // Generate sections
      const sections = await this.generateSections(data, context);
      
      // Assemble document
      const output = this.assembleDocument(sections);
      
      return {
        success: this.errors.length === 0,
        output: this.errors.length === 0 ? output : undefined,
        errors: this.errors,
        warnings: this.warnings,
        metadata: {
          templateId: this.template.id,
          templateVersion: this.template.version,
          generatedAt: new Date().toISOString(),
          sectionsGenerated: sections.length
        }
      };
    } catch (error) {
      this.errors.push({
        code: 'GENERATION_ERROR',
        message: error.message,
        value: error.stack
      });
      
      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
        metadata: {
          templateId: this.template.id,
          templateVersion: this.template.version,
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate generation context
   * @private
   * @param {import('./types.js').TemplateContext} context
   */
  validateContext(context) {
    if (!context) {
      throw new Error('Context is required');
    }
    
    if (!context.openApiSpec) {
      throw new Error('OpenAPI specification is required in context');
    }
    
    if (!context.openApiSpec.openapi && !context.openApiSpec.swagger) {
      this.warnings.push({
        code: 'MISSING_VERSION',
        message: 'OpenAPI version not found in spec',
        suggestion: 'Verify the spec is valid OpenAPI/Swagger'
      });
    }
  }

  /**
   * Extract data from OpenAPI spec
   * @private
   * @param {import('./types.js').TemplateContext} context
   * @returns {Object}
   */
  extractData(context) {
    const spec = context.openApiSpec;
    
    return {
      overview: {
        title: spec.info?.title || 'Untitled API',
        description: spec.info?.description || '',
        version: spec.info?.version || 'unknown',
        openApiVersion: spec.openapi || spec.swagger || 'unknown'
      },
      sourceSpec: {
        version: spec.openapi || spec.swagger || 'unknown',
        servers: spec.servers || [],
        basePath: spec.basePath || '/',
        host: spec.host || 'unknown'
      },
      endpoints: this.extractEndpoints(spec),
      schemas: this.extractSchemas(spec),
      dependencies: this.extractDependencies(spec),
      metadata: context.metadata || {}
    };
  }

  /**
   * Extract endpoints from OpenAPI spec
   * @private
   * @param {Object} spec - OpenAPI specification
   * @returns {Array}
   */
  extractEndpoints(spec) {
    const endpoints = [];
    
    if (!spec.paths) {
      this.warnings.push({
        code: 'NO_PATHS',
        message: 'No paths found in OpenAPI spec',
        section: 'endpoints'
      });
      return endpoints;
    }
    
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
      
      for (const method of methods) {
        if (pathItem[method]) {
          const operation = pathItem[method];
          endpoints.push({
            method: method.toUpperCase(),
            path,
            summary: operation.summary || '',
            description: operation.description || '',
            operationId: operation.operationId || '',
            tags: operation.tags || [],
            deprecated: operation.deprecated || false
          });
        }
      }
    }
    
    return endpoints;
  }

  /**
   * Extract schemas from OpenAPI spec
   * @private
   * @param {Object} spec - OpenAPI specification
   * @returns {Array}
   */
  extractSchemas(spec) {
    const schemas = [];
    const schemaSource = spec.components?.schemas || spec.definitions || {};
    
    if (Object.keys(schemaSource).length === 0) {
      this.warnings.push({
        code: 'NO_SCHEMAS',
        message: 'No schemas found in OpenAPI spec',
        section: 'schemas'
      });
      return schemas;
    }
    
    for (const [name, schema] of Object.entries(schemaSource)) {
      schemas.push({
        name,
        type: schema.type || 'object',
        description: schema.description || '',
        required: schema.required || [],
        properties: Object.keys(schema.properties || {}),
        deprecated: schema.deprecated || false
      });
    }
    
    return schemas;
  }

  /**
   * Extract dependencies from OpenAPI spec
   * @private
   * @param {Object} spec - OpenAPI specification
   * @returns {Array}
   */
  extractDependencies(spec) {
    const dependencies = new Set();
    
    // Check for external references
    const checkRefs = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      if (obj.$ref && typeof obj.$ref === 'string') {
        if (obj.$ref.startsWith('http') || obj.$ref.startsWith('#/')) {
          dependencies.add(obj.$ref);
        }
      }
      
      for (const value of Object.values(obj)) {
        checkRefs(value);
      }
    };
    
    checkRefs(spec);
    
    return Array.from(dependencies);
  }

  /**
   * Validate extracted data against template schema
   * @private
   * @param {Object} data
   */
  validateData(data) {
    const schema = this.template.validation || DEFAULT_VALIDATION_SCHEMA;
    
    for (const [sectionId, rules] of Object.entries(schema.sections || {})) {
      const section = this.template.sections.find(s => s.id === sectionId);
      if (!section) continue;
      
      for (const rule of rules) {
        this.applyValidationRule(sectionId, data, rule);
      }
    }
  }

  /**
   * Apply a single validation rule
   * @private
   * @param {string} sectionId
   * @param {Object} data
   * @param {import('./types.js').ValidationRule} rule
   */
  applyValidationRule(sectionId, data, rule) {
    const section = this.template.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const value = data[sectionId];
    
    switch (rule.type) {
      case VALIDATION_TYPES.REQUIRED:
        if (rule.value && section.required && !value) {
          this.errors.push({
            code: 'REQUIRED_FIELD',
            message: rule.message,
            section: sectionId
          });
        }
        break;
        
      case VALIDATION_TYPES.MIN_LENGTH:
        if (typeof value === 'string' && value.length < rule.value) {
          this.errors.push({
            code: 'MIN_LENGTH',
            message: rule.message,
            section: sectionId,
            value: value.length
          });
        }
        break;
        
      case VALIDATION_TYPES.MAX_LENGTH:
        if (typeof value === 'string' && value.length > rule.value) {
          this.warnings.push({
            code: 'MAX_LENGTH',
            message: rule.message,
            section: sectionId,
            value: value.length
          });
        }
        break;
        
      case VALIDATION_TYPES.PATTERN:
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          this.errors.push({
            code: 'PATTERN_MISMATCH',
            message: rule.message,
            section: sectionId
          });
        }
        break;
    }
  }

  /**
   * Generate all sections
   * @private
   * @param {Object} data
   * @param {import('./types.js').TemplateContext} context
   * @returns {Promise<Array>}
   */
  async generateSections(data, context) {
    const sections = [];
    
    // Sort sections by order
    const sortedSections = [...this.template.sections].sort((a, b) => a.order - b.order);
    
    for (const section of sortedSections) {
      const content = await this.generateSection(section, data, context);
      sections.push({
        id: section.id,
        title: section.title,
        content
      });
    }
    
    return sections;
  }

  /**
   * Generate a single section
   * @private
   * @param {import('./types.js').TemplateSection} section
   * @param {Object} data
   * @param {import('./types.js').TemplateContext} context
   * @returns {Promise<string>}
   */
  async generateSection(section, data, context) {
    const sectionData = data[section.id];
    
    if (!sectionData && section.required) {
      return section.placeholder || `[${section.title} - No data available]`;
    }
    
    if (!sectionData && !section.required) {
      return section.placeholder || '';
    }
    
    switch (section.type) {
      case SECTION_TYPES.MARKDOWN:
        return this.renderMarkdown(sectionData);
        
      case SECTION_TYPES.TABLE:
        return this.renderTable(sectionData);
        
      case SECTION_TYPES.LIST:
        return this.renderList(sectionData);
        
      case SECTION_TYPES.YAML:
        return this.renderYaml(sectionData);
        
      case SECTION_TYPES.CODE:
        return this.renderCode(sectionData);
        
      default:
        return String(sectionData);
    }
  }

  /**
   * Render markdown content
   * @private
   * @param {Object|string} data
   * @returns {string}
   */
  renderMarkdown(data) {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object') {
      let md = '';
      if (data.title) md += `**${data.title}**\n\n`;
      if (data.description) md += `${data.description}\n\n`;
      if (data.version) md += `Version: ${data.version}\n`;
      return md;
    }
    
    return '';
  }

  /**
   * Render table
   * @private
   * @param {Array} data
   * @returns {string}
   */
  renderTable(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '_No data available_';
    }
    
    // Get column headers from first item
    const headers = Object.keys(data[0]);
    let table = '| ' + headers.join(' | ') + ' |\n';
    table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    // Add rows
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h];
        if (Array.isArray(val)) return val.join(', ');
        return String(val || '');
      });
      table += '| ' + values.join(' | ') + ' |\n';
    }
    
    return table;
  }

  /**
   * Render list
   * @private
   * @param {Array|Object} data
   * @returns {string}
   */
  renderList(data) {
    if (Array.isArray(data)) {
      if (data.length === 0) return '_No items_';
      return data.map(item => `- ${item}`).join('\n');
    }
    
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join('\n');
    }
    
    return String(data);
  }

  /**
   * Render YAML content
   * @private
   * @param {Object} data
   * @returns {string}
   */
  renderYaml(data) {
    if (typeof data === 'object') {
      let yaml = '```yaml\n';
      yaml += this.objectToYaml(data, 0);
      yaml += '```\n';
      return yaml;
    }
    
    return String(data);
  }

  /**
   * Convert object to YAML string
   * @private
   * @param {Object} obj
   * @param {number} indent
   * @returns {string}
   */
  objectToYaml(obj, indent) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          yaml += `${spaces}  - ${item}\n`;
        }
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  /**
   * Render code block
   * @private
   * @param {string|Object} data
   * @returns {string}
   */
  renderCode(data) {
    if (typeof data === 'object') {
      return '```json\n' + JSON.stringify(data, null, 2) + '\n```\n';
    }
    
    return '```\n' + String(data) + '\n```\n';
  }

  /**
   * Assemble final document from sections
   * @private
   * @param {Array} sections
   * @returns {string}
   */
  assembleDocument(sections) {
    let doc = `# ${this.template.name}\n\n`;
    doc += `_Generated from template v${this.template.version}_\n\n`;
    doc += `---\n\n`;
    
    for (const section of sections) {
      doc += `## ${section.title}\n\n`;
      doc += section.content;
      doc += '\n\n';
    }
    
    doc += `---\n\n`;
    doc += `_Generated: ${new Date().toISOString()}_\n`;
    
    return doc;
  }
}

/**
 * Create a default spec migration template
 * @returns {import('./types.js').SpecMigrationTemplate}
 */
export function createDefaultTemplate() {
  return {
    id: 'spec-migration-v1',
    name: 'TypeSpec Migration Document',
    version: '1.0.0',
    description: 'Standard template for OpenAPI to TypeSpec migration documentation',
    sections: DEFAULT_SECTIONS,
    defaults: {},
    validation: DEFAULT_VALIDATION_SCHEMA,
    metadata: {
      createdAt: new Date().toISOString(),
      author: 'get-shit-done-multi',
      purpose: 'spec-migration'
    }
  };
}
