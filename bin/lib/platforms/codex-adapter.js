import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { getPlatformDir, getPathReference } from './platform-paths.js';
import { serializeFrontmatter } from '../rendering/frontmatter-serializer.js';

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
    const dir = getPlatformDir('codex', isGlobal);
    return isGlobal ? `~/${dir}` : dir;
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
    return getPathReference('codex');
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
   * Transform agent frontmatter for Codex platform
   * @param {string} content - Agent file content with frontmatter
   * @returns {string} Transformed content with Codex-specific frontmatter
   */
  transformFrontmatter(content) {
    const { data, content: body } = matter(content);
    
    // Remove skills field (not supported in Codex)
    delete data.skills;
    
    // Use custom serializer for correct format
    const frontmatter = serializeFrontmatter(data, 'codex');
    
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
}
