// bin/lib/rendering/template-renderer.js

/**
 * Template variable replacement
 * Replaces {{VARIABLE}} patterns in file content
 */

/**
 * Render template by replacing variables
 * @param {string} content - Template content
 * @param {Object} variables - Variable values
 * @returns {string} Rendered content
 */
export function renderTemplate(content, variables) {
  let rendered = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(pattern, value);
  }
  
  return rendered;
}

/**
 * Get platform-specific variables for Claude
 * @param {boolean} isGlobal - Global vs local installation
 * @returns {Object} Variable mappings
 */
export function getClaudeVariables(isGlobal) {
  return {
    PLATFORM_ROOT: isGlobal ? '~/.claude' : '.claude',
    COMMAND_PREFIX: '/gsd-',
    VERSION: '2.0.0',
    PLATFORM_NAME: 'claude'
  };
}

/**
 * Find unknown variables in template
 * @param {string} content - Template content
 * @returns {string[]} Array of unknown variable names
 */
export function findUnknownVariables(content, knownVariables) {
  const pattern = /\{\{(\w+)\}\}/g;
  const found = new Set();
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const varName = match[1];
    if (!knownVariables.hasOwnProperty(varName)) {
      found.add(varName);
    }
  }
  
  return Array.from(found);
}
