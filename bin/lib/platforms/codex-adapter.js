import { PlatformAdapter } from './base-adapter.js';

/**
 * Platform adapter for Codex CLI
 * Tools: Lowercase array with mappings (SAME AS COPILOT)
 * Frontmatter: Includes metadata block (SAME AS COPILOT)
 * File extension: .agent.md (SAME AS COPILOT)
 * Command prefix: $gsd- (DIFFERENT from Copilot)
 * 
 * ARCHITECTURAL NOTE:
 * This adapter is 95% identical to CopilotAdapter but extends
 * ONLY PlatformAdapter (not CopilotAdapter). Code duplication
 * is INTENTIONAL per ARCHITECTURE-DECISION.md and PLATFORM-02.
 * Platform isolation over DRY principle.
 */
export class CodexAdapter extends PlatformAdapter {
  constructor() {
    super('codex');
    
    // Tool mappings: Claude names → Codex aliases
    // DUPLICATED from CopilotAdapter - this is INTENTIONAL
    // Per PLATFORM-04B and ARCHITECTURE-DECISION.md
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
   * Get file extension for Codex agents
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
    return isGlobal ? '~/.codex' : '.codex';
  }
  
  /**
   * Get command prefix for Codex
   * @returns {string}
   */
  getCommandPrefix() {
    // ONLY DIFFERENCE from Copilot: $ instead of /
    return '$gsd-';
  }
  
  /**
   * Get path reference prefix
   * @returns {string}
   */
  getPathReference() {
    return '.codex';
  }
  
  /**
   * Transform tools for Codex (lowercase with mappings)
   * DUPLICATED from CopilotAdapter - platform isolation
   * @param {string} tools - Comma-separated tools from template
   * @returns {Array<string>} Lowercase array
   */
  transformTools(tools) {
    // Convert comma-separated string to array
    const toolsArray = tools.split(',').map(t => t.trim());
    
    // Apply mappings: Claude names → Codex aliases
    return toolsArray.map(tool => {
      return this.toolMappings[tool] || tool.toLowerCase();
    });
  }
  
  /**
   * Transform frontmatter for Codex
   * DUPLICATED from CopilotAdapter with different platform value
   * @param {Object} data - Frontmatter object from template
   * @returns {Object}
   */
  transformFrontmatter(data) {
    // Codex: includes metadata block per PLATFORM-04B
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools || ''),
      metadata: {
        platform: 'codex', // Different from Copilot
        generated: new Date().toISOString().split('T')[0],
        templateVersion: '1.0.0',
        projectVersion: '2.0.0',
        projectName: 'get-shit-done-multi'
      }
    };
  }
}
