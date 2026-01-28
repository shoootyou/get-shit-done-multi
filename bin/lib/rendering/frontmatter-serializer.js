/**
 * Custom YAML frontmatter serializer with platform-specific formatting
 * 
 * Why custom: js-yaml's flowLevel option is all-or-nothing. We need:
 * - Root-level objects in block style
 * - Arrays in flow style (Copilot/Codex) or block style (Claude)
 * - Nested objects in block style
 * - Omit empty arrays
 * - Special character handling in tool names
 * 
 * @module frontmatter-serializer
 */

/**
 * Serialize frontmatter data to YAML string with platform-specific formatting
 * 
 * @param {Object} data - Frontmatter data object
 * @param {string} platform - Platform name ('copilot', 'codex', 'claude')
 * @returns {string} YAML string (without --- delimiters)
 * 
 * @example
 * // Copilot/Codex (single-line arrays)
 * serializeFrontmatter({tools: ['read', 'write']}, 'copilot')
 * // => "tools: ['read', 'write']"
 * 
 * @example
 * // Claude (multi-line arrays)
 * serializeFrontmatter({skills: ['gsd-help', 'gsd-verify']}, 'claude')
 * // => "skills:\n  - gsd-help\n  - gsd-verify"
 */
export function serializeFrontmatter(data, platform) {
  const lines = [];
  
  // Field ordering: standard fields first, then others
  const standardFields = ['name', 'description', 'tools', 'disallowedTools', 'skills', 'metadata'];
  const allFields = new Set([...standardFields, ...Object.keys(data)]);
  
  for (const key of allFields) {
    if (!(key in data)) {
      continue; // Field not present in data
    }
    
    const value = data[key];
    
    // Skip undefined fields
    if (value === undefined) {
      continue;
    }
    
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    
    // Format by type
    if (Array.isArray(value)) {
      lines.push(formatArray(key, value, platform));
    } else if (typeof value === 'object' && value !== null) {
      lines.push(formatObject(key, value));
    } else {
      lines.push(formatScalar(key, value));
    }
  }
  
  return lines.join('\n');
}

/**
 * Format array field with platform-specific style
 * 
 * @param {string} key - Field name
 * @param {Array} value - Array value
 * @param {string} platform - Platform name
 * @returns {string} Formatted YAML
 * 
 * @private
 */
function formatArray(key, value, platform) {
  // Claude uses multi-line block style
  if (platform === 'claude') {
    const items = value.map(item => `  - ${item}`).join('\n');
    return `${key}:\n${items}`;
  }
  
  // Copilot/Codex use single-line flow style
  // Wrap items in single quotes to handle special characters
  const items = value.map(item => `'${item}'`).join(', ');
  return `${key}: [${items}]`;
}

/**
 * Format object field with 2-space indentation
 * 
 * @param {string} key - Field name
 * @param {Object} value - Object value
 * @returns {string} Formatted YAML
 * 
 * @private
 */
function formatObject(key, value) {
  const lines = [`${key}:`];
  
  for (const [subKey, subValue] of Object.entries(value)) {
    if (subValue === undefined) {
      continue; // Skip undefined nested fields
    }
    
    // Handle nested objects recursively (with additional indentation)
    if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue)) {
      lines.push(`  ${subKey}:`);
      for (const [nestedKey, nestedValue] of Object.entries(subValue)) {
        if (nestedValue === undefined) continue;
        lines.push(`    ${nestedKey}: ${formatValue(nestedValue)}`);
      }
    } else {
      lines.push(`  ${subKey}: ${formatValue(subValue)}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Format scalar field
 * 
 * @param {string} key - Field name
 * @param {*} value - Scalar value
 * @returns {string} Formatted YAML
 * 
 * @private
 */
function formatScalar(key, value) {
  return `${key}: ${formatValue(value)}`;
}

/**
 * Format a value for YAML output
 * 
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 * 
 * @private
 */
function formatValue(value) {
  // Null
  if (value === null) {
    return 'null';
  }
  
  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  // Number
  if (typeof value === 'number') {
    return String(value);
  }
  
  // String - quote if contains special characters
  if (typeof value === 'string') {
    // Always quote strings that look like dates or versions to prevent YAML parsing
    // Examples: 2026-01-28, 2026-01-28T12:00:00Z, 2.0.0, 1.2.3
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d+\.\d+(\.\d+)?$/.test(value)) {
      if (value.includes("'")) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return `'${value}'`;
    }
    
    // Simple strings don't need quotes in YAML
    if (/^[a-zA-Z0-9_-]+$/.test(value)) {
      return value;
    }
    
    // Strings with special chars, spaces, or colons need quotes
    // Use single quotes to avoid escaping issues
    if (value.includes("'")) {
      // If string contains single quotes, use double quotes and escape
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return `'${value}'`;
  }
  
  // Array (shouldn't reach here in normal flow, but handle anyway)
  if (Array.isArray(value)) {
    const items = value.map(v => `'${v}'`).join(', ');
    return `[${items}]`;
  }
  
  // Fallback
  return String(value);
}
