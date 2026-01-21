/**
 * Spec Parser Module
 * Parses agent spec files with YAML frontmatter and markdown body
 * 
 * @module template-system/spec-parser
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Parse a spec file from filesystem path
 * Extracts YAML frontmatter and markdown body
 * 
 * @param {string} filePath - Absolute or relative path to spec file
 * @returns {Object} Parsed spec object
 * @returns {Object} return.frontmatter - Parsed YAML frontmatter data
 * @returns {string} return.body - Markdown body content
 * @returns {string} return.path - Resolved absolute path to spec file
 * @throws {Error} If file doesn't exist or parsing fails
 * 
 * @example
 * const spec = parseSpec('./agents/gsd-planner.md');
 * console.log(spec.frontmatter.name); // 'gsd-planner'
 * console.log(spec.body.length); // 15234
 */
function parseSpec(filePath) {
  // Resolve to absolute path
  const absolutePath = path.resolve(filePath);
  
  // Check file exists before attempting to read
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Spec file not found: ${absolutePath}`);
  }
  
  try {
    // Use gray-matter to read and parse file
    const result = matter.read(absolutePath);
    
    return {
      frontmatter: result.data,
      body: result.content,
      path: absolutePath
    };
  } catch (error) {
    // Enhance error message with file context
    const errorMessage = buildParseError(error, absolutePath);
    throw new Error(errorMessage);
  }
}

/**
 * Parse a spec from string content
 * Useful for testing or when content is already loaded
 * 
 * @param {string} content - Raw spec content (YAML frontmatter + markdown)
 * @param {string} [sourcePath] - Optional source path for error messages
 * @returns {Object} Parsed spec object
 * @returns {Object} return.frontmatter - Parsed YAML frontmatter data
 * @returns {string} return.body - Markdown body content
 * @returns {string|null} return.path - Source path if provided, else null
 * @throws {Error} If parsing fails
 * 
 * @example
 * const content = '---\nname: test\n---\n\nBody text';
 * const spec = parseSpecString(content, 'test.md');
 */
function parseSpecString(content, sourcePath = null) {
  try {
    // Parse string content
    const result = matter(content);
    
    return {
      frontmatter: result.data,
      body: result.content,
      path: sourcePath
    };
  } catch (error) {
    // Enhance error message with source context if available
    const errorMessage = buildParseError(error, sourcePath);
    throw new Error(errorMessage);
  }
}

/**
 * Build descriptive error message from parse error
 * Extracts line numbers from gray-matter error objects when available
 * 
 * @private
 * @param {Error} error - Original parse error
 * @param {string|null} sourcePath - Source file path for context
 * @returns {string} Enhanced error message
 */
function buildParseError(error, sourcePath) {
  const source = sourcePath || 'spec content';
  let message = `Failed to parse YAML frontmatter in ${source}`;
  
  // gray-matter provides error.mark.line for YAML parsing errors
  if (error.mark && error.mark.line !== undefined) {
    message += ` at line ${error.mark.line + 1}`;
  }
  
  // Append original error message
  message += `: ${error.message}`;
  
  return message;
}

module.exports = {
  parseSpec,
  parseSpecString
};
