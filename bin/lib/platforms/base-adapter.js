/**
 * Base adapter interface for platform-specific transformations
 * Each platform (Claude, Copilot, Codex) extends this class
 */
export class PlatformAdapter {
  constructor(platformName) {
    if (!platformName) {
      throw new Error('Platform name is required');
    }
    this.platformName = platformName;
  }
  
  /**
   * Get file extension for agents on this platform
   * @returns {string} File extension (e.g., '.md' or '.agent.md')
   */
  getFileExtension() {
    throw new Error(`${this.platformName}: getFileExtension() must be implemented`);
  }
  
  /**
   * Get target installation directory
   * @param {boolean} isGlobal - Global vs local installation
   * @returns {string} Target directory path
   */
  getTargetDir(isGlobal) {
    throw new Error(`${this.platformName}: getTargetDir() must be implemented`);
  }
  
  /**
   * Get command prefix for this platform
   * @returns {string} Command prefix (e.g., '/gsd-' or '$gsd-')
   */
  getCommandPrefix() {
    throw new Error(`${this.platformName}: getCommandPrefix() must be implemented`);
  }
  
  /**
   * Transform tool names for this platform
   * @param {string} tools - Comma-separated tools from template (e.g., "Read, Write, Bash")
   * @returns {string|Array} Platform-specific tool format
   */
  transformTools(tools) {
    throw new Error(`${this.platformName}: transformTools() must be implemented`);
  }
  
  /**
   * Transform frontmatter for this platform
   * @param {Object} data - Frontmatter object from template
   * @returns {Object} Platform-specific frontmatter
   */
  transformFrontmatter(data) {
    throw new Error(`${this.platformName}: transformFrontmatter() must be implemented`);
  }
  
  /**
   * Get path reference prefix for this platform
   * @returns {string} Path prefix (e.g., '.claude', '.github', '.codex')
   */
  getPathReference() {
    throw new Error(`${this.platformName}: getPathReference() must be implemented`);
  }
}
