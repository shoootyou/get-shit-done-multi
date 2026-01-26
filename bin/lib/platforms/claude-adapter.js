import { PlatformAdapter } from './base-adapter.js';

/**
 * Platform adapter for Claude Code
 * Tools: Capitalized comma-separated string
 * Frontmatter: No metadata block
 * File extension: .md
 * Command prefix: /gsd-
 */
export class ClaudeAdapter extends PlatformAdapter {
  constructor() {
    super('claude');
  }
  
  /**
   * Get file extension for Claude agents
   * @returns {string}
   */
  getFileExtension() {
    return '.md';
  }
  
  /**
   * Get target installation directory
   * @param {boolean} isGlobal - Global vs local installation
   * @returns {string}
   */
  getTargetDir(isGlobal) {
    return isGlobal ? '~/.claude' : '.claude';
  }
  
  /**
   * Get command prefix for Claude
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
    return '.claude';
  }
  
  /**
   * Transform tools for Claude (keep capitalized)
   * @param {string} tools - Comma-separated tools from template
   * @returns {string} Unchanged for Claude
   */
  transformTools(tools) {
    // Claude uses capitalized comma-separated string
    // Template already has correct format: "Read, Write, Bash"
    return tools;
  }
  
  /**
   * Transform frontmatter for Claude
   * @param {Object} data - Frontmatter object from template
   * @returns {Object}
   */
  transformFrontmatter(data) {
    // Claude: minimal frontmatter, no metadata block
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools || '')
    };
  }
}
