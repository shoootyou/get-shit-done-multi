/**
 * Inject template variables into content
 * Replaces hardcoded platform-specific values with {{VARIABLES}}
 */

/**
 * Replace hardcoded paths with template variables
 * @param {string} content - File content
 * @returns {string} - Content with template variables
 */
export function injectTemplateVariables(content) {
  let result = content;
  
  // Replace platform roots
  result = result.replace(/\.github\//g, '{{PLATFORM_ROOT}}');
  result = result.replace(/\.claude\//g, '{{PLATFORM_ROOT}}');
  result = result.replace(/\.codex\//g, '{{PLATFORM_ROOT}}');
  
  // Replace command prefixes
  result = result.replace(/\/gsd-/g, '{{COMMAND_PREFIX}}');
  result = result.replace(/\$gsd-/g, '{{COMMAND_PREFIX}}');
  
  // Note: Version and platform name injection happens during installation,
  // not during migration. Templates keep placeholder values.
  
  return result;
}

/**
 * Validate template variable presence in content
 * @param {string} content - File content
 * @param {Array<string>} requiredVars - Variables that must be present
 * @returns {Array<string>} - Missing required variables
 */
export function validateTemplateVariables(content, requiredVars) {
  const missing = [];
  
  requiredVars.forEach(varName => {
    const pattern = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    if (!pattern.test(content)) {
      missing.push(varName);
    }
  });
  
  return missing;
}
