/**
 * Claude-specific YAML frontmatter serializer
 * 
 * Claude formatting rules:
 * - Root-level objects in block style
 * - Arrays in block style (multi-line)
 * - Nested objects in block style
 * - Omit empty arrays
 * - Special character handling in tool names
 * 
 * @module claude-serializer
 */

/**
 * Serialize frontmatter data to YAML string with Claude-specific formatting
 * 
 * @param {Object} data - Frontmatter data object
 * @returns {string} YAML string (without --- delimiters)
 * 
 * @example
 * // Claude (multi-line arrays)
 * serializeFrontmatter({skills: ['gsd-help', 'gsd-verify']})
 * // => "skills:\n  - gsd-help\n  - gsd-verify"
 */
export function serializeFrontmatter(data) {
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
      lines.push(formatArray(key, value));
    } else if (typeof value === 'object' && value !== null) {
      lines.push(formatObject(key, value));
    } else {
      lines.push(formatScalar(key, value));
    }
  }
  
  return lines.join('\n');
}

/**
 * Format array field with Claude block style (multi-line)
 * 
 * @param {string} key - Field name
 * @param {Array} value - Array value
 * @returns {string} Formatted YAML
 * 
 * @private
 */
function formatArray(key, value) {
  // Claude uses multi-line block style
  const items = value.map(item => `  - ${item}`).join('\n');
  return `${key}:\n${items}`;
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
        lines.push(`    ${nestedKey}: ${formatValue(nestedValue, nestedKey)}`);
      }
    } else {
      lines.push(`  ${subKey}: ${formatValue(subValue, subKey)}`);
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
  return `${key}: ${formatValue(value, key)}`;
}

/**
 * Format a value for YAML output
 * 
 * @param {*} value - Value to format
 * @param {string} [fieldName] - Optional field name for context-aware formatting
 * @returns {string} Formatted value
 * 
 * @private
 */
function formatValue(value, fieldName) {
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
  
  // String handling
  if (typeof value === 'string') {
    // Always quote strings that look like dates or versions to prevent YAML parsing
    // Examples: 2026-01-28, 2026-01-28T12:00:00Z, 2.0.0, 1.2.3
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d+\.\d+(\.\d+)?$/.test(value)) {
      if (value.includes("'")) {
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return `'${value}'`;
    }
    
    // Only quote if string contains characters that REQUIRE quoting in YAML
    // Unquoted strings in YAML can contain: spaces, commas, periods, etc.
    // Must quote if: starts with special chars, contains: :, {, }, [, ], >, |, *, &, !, %, @, `
    const needsQuoting = /^[>|*&!%@`#]|[:{}\[\]]/.test(value) || value.startsWith('-');
    
    if (!needsQuoting) {
      // Safe to leave unquoted - YAML will parse correctly
      return value;
    }
    
    // Needs quoting - use single quotes, escape if needed
    if (value.includes("'")) {
      // If string contains single quotes, use double quotes and escape
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
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
