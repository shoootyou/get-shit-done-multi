import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { getPlatformDir, getPathReference } from './platform-paths.js';
import { serializeFrontmatter } from '../rendering/frontmatter-serializer.js';

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
    const dir = getPlatformDir('copilot', isGlobal);
    return isGlobal ? `~/${dir}` : dir;
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
    return getPathReference('copilot');
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
   * Transform agent frontmatter for Copilot platform
   * @param {string} content - Agent file content with frontmatter
   * @returns {string} Transformed content with Copilot-specific frontmatter
   */
  transformFrontmatter(content) {
    const { data, content: body } = matter(content);
    
    // Remove skills field (not supported in Copilot)
    delete data.skills;
    
    // Use custom serializer for correct format
    const frontmatter = serializeFrontmatter(data, 'copilot');
    
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
}
