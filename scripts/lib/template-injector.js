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
  
  // Replace platform roots - order matters! Do backtick-wrapped versions first
  // These handle paths like `~/.claude/get-shit-done/...`
  result = result.replace(/`~\/\.github\/get-shit-done\//g, '`{{PLATFORM_ROOT}}/get-shit-done/');
  result = result.replace(/`~\/\.claude\/get-shit-done\//g, '`{{PLATFORM_ROOT}}/get-shit-done/');
  result = result.replace(/`~\/\.codex\/get-shit-done\//g, '`{{PLATFORM_ROOT}}/get-shit-done/');
  
  // Replace remaining home directory variations
  result = result.replace(/~\/\.github\/get-shit-done\//g, '{{PLATFORM_ROOT}}/get-shit-done/');
  result = result.replace(/~\/\.claude\/get-shit-done\//g, '{{PLATFORM_ROOT}}/get-shit-done/');
  result = result.replace(/~\/\.codex\/get-shit-done\//g, '{{PLATFORM_ROOT}}/get-shit-done/');
  
  // Replace generic platform root paths (shorter patterns for other references)
  result = result.replace(/~\/\.github\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/~\/\.claude\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/~\/\.codex\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/\.github\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/\.claude\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/\.codex\//g, '{{PLATFORM_ROOT}}/');
  
  // Replace @workspace prefix
  result = result.replace(/@workspace\/\.github\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/@workspace\/\.claude\//g, '{{PLATFORM_ROOT}}/');
  result = result.replace(/@workspace\/\.codex\//g, '{{PLATFORM_ROOT}}/');
  
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
