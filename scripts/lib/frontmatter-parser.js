import matter from 'gray-matter';

/**
 * Parse frontmatter from markdown file
 * @param {string} filePath - Path to markdown file
 * @param {string} content - File content
 * @returns {{data: object, content: string, orig: string}}
 */
export function parseFrontmatter(filePath, content) {
  try {
    const parsed = matter(content);
    return {
      data: parsed.data,      // Frontmatter object
      content: parsed.content, // Body content
      orig: parsed.orig        // Original raw frontmatter
    };
  } catch (err) {
    throw new Error(`Failed to parse frontmatter in ${filePath}: ${err.message}`);
  }
}

/**
 * Validate frontmatter against official Claude/Copilot specs
 * @param {string} filePath - Path for error reporting
 * @param {object} data - Parsed frontmatter object
 * @param {string} type - 'skill' or 'agent'
 * @returns {Array<{field: string, issue: string, severity: string}>}
 */
export function validateFrontmatter(filePath, data, type) {
  const errors = [];
  
  if (type === 'skill') {
    // Official Claude skill frontmatter fields
    // (from https://code.claude.com/docs/en/slash-commands#frontmatter-reference)
    const supported = ['name', 'description', 'argument-hint', 'disable-model-invocation', 
                      'user-invocable', 'allowed-tools', 'model', 'context', 'agent', 'hooks'];
    
    // Unsupported fields from old format
    const unsupported = ['skill_version', 'requires_version', 'platforms', 'metadata', 
                        'arguments', 'tools'];
    
    // Check for unsupported fields
    unsupported.forEach(field => {
      if (data[field] !== undefined) {
        errors.push({
          field,
          issue: `Unsupported field - must be removed (move to version.json)`,
          severity: 'error'
        });
      }
    });
    
    // Check required fields
    if (!data.name) {
      errors.push({ field: 'name', issue: 'Required field missing', severity: 'error' });
    }
    if (!data.description) {
      errors.push({ field: 'description', issue: 'Recommended field missing', severity: 'warning' });
    }
    
    // Validate allowed-tools format (should be comma-separated string)
    if (data['allowed-tools'] && typeof data['allowed-tools'] !== 'string') {
      errors.push({
        field: 'allowed-tools',
        issue: `Must be comma-separated string (e.g., "Read, Write, Bash"), not array`,
        severity: 'error'
      });
    }
    
  } else if (type === 'agent') {
    // Official Claude agent frontmatter fields
    // (from https://code.claude.com/docs/en/sub-agents)
    const supported = ['name', 'description', 'tools', 'disallowedTools', 
                      'model', 'permissionMode', 'skills', 'hooks'];
    
    // Unsupported fields
    const unsupported = ['metadata', 'skill_version', 'requires_version', 'platforms'];
    
    unsupported.forEach(field => {
      if (data[field] !== undefined) {
        errors.push({
          field,
          issue: `Unsupported field - must be removed (move to versions.json)`,
          severity: 'error'
        });
      }
    });
    
    // Check required fields
    if (!data.name) {
      errors.push({ field: 'name', issue: 'Required field missing', severity: 'error' });
    }
    if (!data.description) {
      errors.push({ field: 'description', issue: 'Required field missing', severity: 'error' });
    }
    
    // Validate tools format (should be comma-separated string for Claude)
    if (data.tools && typeof data.tools !== 'string') {
      errors.push({
        field: 'tools',
        issue: `Must be comma-separated string (e.g., "Read, Write, Bash"), not array`,
        severity: 'error'
      });
    }
  }
  
  return errors;
}
