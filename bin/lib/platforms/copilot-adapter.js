import { PlatformAdapter } from './base-adapter.js';

/**
 * Platform adapter for GitHub Copilot CLI
 * Tools: Lowercase array with mappings
 * Frontmatter: Includes metadata block
 * File extension: .agent.md
 * Command prefix: /gsd-
 */
export class CopilotAdapter extends PlatformAdapter {
  constructor() {
    super('copilot');
    
    // Tool mappings: Claude names → Copilot aliases
    // Per TEMPLATE-02B and PLATFORM-04
    this.toolMappings = {
      'Read': 'read',
      'Write': 'edit',
      'Edit': 'edit',
      'Bash': 'execute',
      'Grep': 'search',
      'Glob': 'search',
      'Task': 'agent'
    };
  }
  
  /**
   * Get file extension for Copilot agents
   * @returns {string}
   */
  getFileExtension() {
    return '.agent.md';
  }
  
  /**
   * Get target installation directory
   * @param {boolean} isGlobal - Global vs local installation
   * @returns {string}
   */
  getTargetDir(isGlobal) {
    return isGlobal ? '~/.copilot' : '.github';
  }
  
  /**
   * Get command prefix for Copilot
   * @returns {string}
   */
  getCommandPrefix() {
    return '/gsd-';
  }
  
  /**
   * Get path reference prefix
   * @returns {string}
   */
  getPathReference() {
    return '.github';
  }
  
  /**
   * Transform tools for Copilot (lowercase with mappings)
   * @param {string} tools - Comma-separated tools from template
   * @returns {Array<string>} Lowercase array
   */
  transformTools(tools) {
    // Convert comma-separated string to array
    const toolsArray = tools.split(',').map(t => t.trim());
    
    // Apply mappings: Claude names → Copilot aliases
    return toolsArray.map(tool => {
      return this.toolMappings[tool] || tool.toLowerCase();
    });
  }
  
  /**
   * Transform frontmatter for Copilot
   * @param {Object} data - Frontmatter object from template
   * @returns {Object}
   */
  transformFrontmatter(data) {
    // Copilot: includes metadata block per PLATFORM-04
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools || ''),
      metadata: {
        platform: 'copilot',
        generated: new Date().toISOString().split('T')[0],
        templateVersion: '1.0.0',
        projectVersion: '2.0.0',
        projectName: 'get-shit-done-multi'
      }
    };
  }
}
