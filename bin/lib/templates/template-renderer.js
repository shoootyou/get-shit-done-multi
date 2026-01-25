import fs from 'fs-extra';
import { userInfo } from 'os';

/**
 * Render template content by replacing {{VARIABLE}} placeholders
 * @param {string} content - Template content with {{VARIABLE}} placeholders
 * @param {Object} variables - Object mapping variable names to values
 * @returns {string} - Rendered content with variables replaced
 */
export function renderTemplate(content, variables) {
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (match, variableName) => {
    return variables[variableName] ?? `[MISSING:${variableName}]`;
  });
}

/**
 * Render a template file by replacing {{VARIABLE}} placeholders
 * @param {string} filePath - Path to template file
 * @param {Object} variables - Object mapping variable names to values
 * @returns {Promise<string>} - Rendered content with variables replaced
 */
export async function renderFile(filePath, variables) {
  const content = await fs.readFile(filePath, 'utf-8');
  return renderTemplate(content, variables);
}

/**
 * Get default template variables for Phase 1
 * @returns {Object} - Default variables
 */
export function getDefaultVariables() {
  return {
    PLATFORM_ROOT: '.claude/',
    VERSION: '2.0.0',
    COMMAND_PREFIX: '/gsd-',
    INSTALL_DATE: new Date().toISOString(),
    USER: userInfo().username,
    PLATFORM_NAME: 'claude'
  };
}
