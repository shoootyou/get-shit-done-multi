/**
 * Template Registry for Spec Migration Templates
 * 
 * Manages template storage, retrieval, and versioning.
 * Provides CLI-agnostic template lifecycle management.
 * 
 * @module lib-ghcc/templates/registry
 */

import { atomicWriteJSON, atomicReadJSON } from '../state-io.js';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * TemplateRegistry - Manage template storage and retrieval
 * 
 * Features:
 * - Template registration and deregistration
 * - Version management
 * - Template discovery by tags
 * - Atomic registry operations
 * 
 * @example
 * const registry = new TemplateRegistry('.planning/templates');
 * await registry.registerTemplate(template, '/path/to/template.json');
 * const template = await registry.getTemplate('spec-migration-v1');
 */
export class TemplateRegistry {
  /**
   * Create TemplateRegistry instance
   * @param {string} registryDir - Directory for template storage
   */
  constructor(registryDir = '.planning/templates') {
    this.registryDir = registryDir;
    this.registryFile = join(registryDir, 'registry.json');
  }

  /**
   * Initialize registry (create directory and file if needed)
   * @returns {Promise<void>}
   */
  async initialize() {
    // Create directory if it doesn't exist
    if (!existsSync(this.registryDir)) {
      await mkdir(this.registryDir, { recursive: true });
    }

    // Create registry file if it doesn't exist
    if (!existsSync(this.registryFile)) {
      const initialRegistry = {
        version: '1.0.0',
        templates: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      await atomicWriteJSON(this.registryFile, initialRegistry);
    }
  }

  /**
   * Read registry from disk
   * @returns {Promise<import('./types.js').TemplateRegistry>}
   */
  async readRegistry() {
    try {
      return await atomicReadJSON(this.registryFile);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Registry doesn't exist, return empty
        return {
          version: '1.0.0',
          templates: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  }

  /**
   * Write registry to disk
   * @param {import('./types.js').TemplateRegistry} registry
   * @returns {Promise<void>}
   */
  async writeRegistry(registry) {
    registry.metadata.updatedAt = new Date().toISOString();
    await atomicWriteJSON(this.registryFile, registry);
  }

  /**
   * Register a new template
   * @param {import('./types.js').SpecMigrationTemplate} template
   * @param {string} templatePath - Path where template will be stored
   * @param {string[]} [tags] - Classification tags
   * @returns {Promise<import('./types.js').TemplateRegistryEntry>}
   */
  async registerTemplate(template, templatePath, tags = []) {
    await this.initialize();
    
    const registry = await this.readRegistry();
    
    // Check if template already registered
    const existingIndex = registry.templates.findIndex(t => t.templateId === template.id);
    
    const entry = {
      templateId: template.id,
      path: templatePath,
      version: template.version,
      tags: [...tags, 'spec-migration'],
      active: true,
      createdAt: existingIndex >= 0 ? registry.templates[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing entry
      registry.templates[existingIndex] = entry;
    } else {
      // Add new entry
      registry.templates.push(entry);
    }
    
    await this.writeRegistry(registry);
    
    // Save template to file
    const fullPath = join(this.registryDir, templatePath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await atomicWriteJSON(fullPath, template);
    
    return entry;
  }

  /**
   * Get template by ID
   * @param {string} templateId
   * @returns {Promise<import('./types.js').SpecMigrationTemplate|null>}
   */
  async getTemplate(templateId) {
    const registry = await this.readRegistry();
    const entry = registry.templates.find(t => t.templateId === templateId && t.active);
    
    if (!entry) {
      return null;
    }
    
    const templatePath = join(this.registryDir, entry.path);
    
    try {
      return await atomicReadJSON(templatePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Template file not found: ${templatePath}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * List all registered templates
   * @param {Object} [filters]
   * @param {string[]} [filters.tags] - Filter by tags
   * @param {boolean} [filters.activeOnly=true] - Only return active templates
   * @returns {Promise<import('./types.js').TemplateRegistryEntry[]>}
   */
  async listTemplates(filters = {}) {
    const registry = await this.readRegistry();
    const { tags, activeOnly = true } = filters;
    
    let templates = registry.templates;
    
    // Filter by active status
    if (activeOnly) {
      templates = templates.filter(t => t.active);
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      templates = templates.filter(t => 
        tags.some(tag => t.tags.includes(tag))
      );
    }
    
    return templates;
  }

  /**
   * Deactivate a template (soft delete)
   * @param {string} templateId
   * @returns {Promise<boolean>} True if template was deactivated
   */
  async deactivateTemplate(templateId) {
    const registry = await this.readRegistry();
    const template = registry.templates.find(t => t.templateId === templateId);
    
    if (!template) {
      return false;
    }
    
    template.active = false;
    template.updatedAt = new Date().toISOString();
    
    await this.writeRegistry(registry);
    return true;
  }

  /**
   * Reactivate a deactivated template
   * @param {string} templateId
   * @returns {Promise<boolean>} True if template was reactivated
   */
  async reactivateTemplate(templateId) {
    const registry = await this.readRegistry();
    const template = registry.templates.find(t => t.templateId === templateId);
    
    if (!template) {
      return false;
    }
    
    template.active = true;
    template.updatedAt = new Date().toISOString();
    
    await this.writeRegistry(registry);
    return true;
  }

  /**
   * Update template metadata (without replacing template content)
   * @param {string} templateId
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} True if updated
   */
  async updateTemplateMetadata(templateId, updates) {
    const registry = await this.readRegistry();
    const template = registry.templates.find(t => t.templateId === templateId);
    
    if (!template) {
      return false;
    }
    
    // Update allowed fields
    const allowedFields = ['tags', 'active'];
    for (const field of allowedFields) {
      if (field in updates) {
        template[field] = updates[field];
      }
    }
    
    template.updatedAt = new Date().toISOString();
    
    await this.writeRegistry(registry);
    return true;
  }

  /**
   * Search templates by name, description, or tags
   * @param {string} query - Search query
   * @returns {Promise<import('./types.js').TemplateRegistryEntry[]>}
   */
  async searchTemplates(query) {
    const templates = await this.listTemplates({ activeOnly: true });
    const lowerQuery = query.toLowerCase();
    
    // Load full template data for searching
    const results = [];
    for (const entry of templates) {
      const template = await this.getTemplate(entry.templateId);
      if (!template) continue;
      
      // Search in template name, description, and tags
      const matches = 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      if (matches) {
        results.push(entry);
      }
    }
    
    return results;
  }

  /**
   * Get template version history
   * @param {string} templateId
   * @returns {Promise<Array>} Version history
   */
  async getTemplateHistory(templateId) {
    const registry = await this.readRegistry();
    return registry.templates
      .filter(t => t.templateId === templateId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Clean up orphaned template files
   * @returns {Promise<number>} Number of files cleaned
   */
  async cleanupOrphans() {
    // This would scan the template directory and remove files
    // not referenced in the registry
    // Implementation depends on filesystem access patterns
    // Placeholder for now
    return 0;
  }

  /**
   * Export registry as JSON
   * @returns {Promise<string>}
   */
  async exportRegistry() {
    const registry = await this.readRegistry();
    return JSON.stringify(registry, null, 2);
  }

  /**
   * Get registry statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    const registry = await this.readRegistry();
    
    return {
      totalTemplates: registry.templates.length,
      activeTemplates: registry.templates.filter(t => t.active).length,
      inactiveTemplates: registry.templates.filter(t => !t.active).length,
      uniqueTags: [...new Set(registry.templates.flatMap(t => t.tags))],
      oldestTemplate: registry.templates.reduce((oldest, t) => 
        !oldest || new Date(t.createdAt) < new Date(oldest.createdAt) ? t : oldest
      , null),
      newestTemplate: registry.templates.reduce((newest, t) => 
        !newest || new Date(t.createdAt) > new Date(newest.createdAt) ? t : newest
      , null)
    };
  }
}

/**
 * Create a new registry instance with default location
 * @returns {TemplateRegistry}
 */
export function createRegistry() {
  return new TemplateRegistry('.planning/templates');
}
