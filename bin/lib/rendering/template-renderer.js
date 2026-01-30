// bin/lib/rendering/template-renderer.js

import { readFile } from '../io/file-operations.js';

/**
 * Template variable replacement
 * Replaces {{VARIABLE}} patterns in file content
 */

/**
 * Render template by replacing variables
 * @param {string} filePath - Path to template file
 * @param {Object} variables - Template variables to replace
 * @returns {Promise<string>} Rendered content
 */
export async function renderTemplate(filePath, variables) {
  const content = await readFile(filePath);
  return replaceVariables(content, variables);
}

/**
 * Replace variables in string content
 * @param {string} content - Content to process
 * @param {Object} variables - Template variables
 * @returns {string} Processed content
 */
export function replaceVariables(content, variables) {
  let rendered = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(pattern, value);
  }
  
  return rendered;
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
