import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { getPlatformDir, getPathReference } from './platform-paths.js';

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
    const dir = getPlatformDir('claude', isGlobal);
    return isGlobal ? `~/${dir}` : dir;
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
    return getPathReference('claude');
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
   * Transform agent frontmatter for Claude platform
   * @param {string} content - Agent file content with frontmatter
   * @returns {string} Transformed content with Claude-specific frontmatter
   */
  transformFrontmatter(content) {
    const { data, content: body } = matter(content);
    
    // Extract skills from agent content if not already present
    if (!data.skills) {
      const skillReferences = this.extractSkillReferences(body);
      if (skillReferences.length > 0) {
        data.skills = skillReferences;
      }
    }
    
    // Use gray-matter to serialize (Claude supports standard YAML)
    return matter.stringify(body, data);
  }
  
  /**
   * Extract skill references from agent content
   * @param {string} content - Agent body content
   * @returns {string[]} Array of skill names
   */
  extractSkillReferences(content) {
    const skills = new Set();
    
    // Match /gsd-* patterns
    const matches = content.matchAll(/\/gsd-([a-z-]+)/g);
    for (const match of matches) {
      skills.add(`gsd-${match[1]}`);
    }
    
    return Array.from(skills).sort();
  }
}
