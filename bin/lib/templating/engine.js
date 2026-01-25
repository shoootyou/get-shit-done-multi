/**
 * Template engine with variable substitution and YAML validation
 * Uses regex-based substitution for simplicity and js-yaml for validation
 */

const yaml = require('js-yaml');

/**
 * Render template with variable substitution and conditionals
 * Replaces {{variable}} placeholders with values from context
 * Supports Mustache-style conditionals: {{#varName}}...{{/varName}}
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} context - Object containing variable values
 * @param {Object} options - Rendering options
 * @param {boolean} options.lenient - If true, preserve undefined variables as-is (default: false)
 * @returns {string} Rendered template with variables replaced
 * @throws {Error} If template references undefined variable (unless lenient=true)
 */
function render(template, context, options = {}) {
  if (typeof template !== 'string') {
    throw new Error('Template must be a string');
  }

  if (!context || typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  
  const lenient = options.lenient || false;

  let result = template;
  
  // First, process conditional blocks: {{#varName}}...{{/varName}}
  // Matches: {{#variableName}}content{{/variableName}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, varName, content) => {
    if (!(varName in context)) {
      if (lenient) {
        return match; // Preserve the original conditional block
      }
      throw new Error(`Undefined variable in template: {{#${varName}}}`);
    }
    
    const value = context[varName];
    
    // Include content if value is truthy
    if (value) {
      return content;
    } else {
      return '';
    }
  });
  
  // Then, replace simple {{variable}} with context values
  // Matches: {{ variableName }} or {{variableName}}
  result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, varName) => {
    if (!(varName in context)) {
      if (lenient) {
        return match; // Preserve the original variable placeholder
      }
      throw new Error(`Undefined variable in template: {{${varName}}}`);
    }
    
    const value = context[varName];
    
    // Convert value to string representation
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value.toString();
    }
    
    if (typeof value === 'object') {
      // For objects/arrays, convert to YAML-friendly format
      return JSON.stringify(value);
    }
    
    return String(value);
  });
  
  return result;
}

/**
 * Validate YAML string for syntax errors
 * Uses js-yaml to parse and catch errors with line numbers
 * @param {string} yamlString - YAML content to validate
 * @returns {Object} Validation result: {valid: boolean, errors: Array}
 */
function validate(yamlString) {
  if (typeof yamlString !== 'string') {
    return {
      valid: false,
      errors: [{
        line: null,
        message: 'Input must be a string',
        snippet: null
      }]
    };
  }

  try {
    // Attempt to parse YAML
    yaml.load(yamlString);
    
    // If parsing succeeds, YAML is valid
    return {
      valid: true,
      errors: []
    };
  } catch (err) {
    // Extract line number and snippet from error
    const lineNum = err.mark ? err.mark.line + 1 : null;
    const columnNum = err.mark ? err.mark.column + 1 : null;
    const snippet = err.mark ? err.mark.snippet : null;
    
    // Build error message with location context
    let message = err.message;
    if (lineNum && columnNum) {
      message = `${message} (line ${lineNum}, column ${columnNum})`;
    }
    
    return {
      valid: false,
      errors: [{
        line: lineNum,
        column: columnNum,
        message: message,
        snippet: snippet,
        rawError: err.message
      }]
    };
  }
}

/**
 * Render template and validate YAML output
 * Convenience function that combines render + validate
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} context - Object containing variable values
 * @returns {Object} Result: {rendered: string, valid: boolean, errors: Array}
 */
function renderAndValidate(template, context) {
  try {
    const rendered = render(template, context);
    const validation = validate(rendered);
    
    return {
      rendered,
      ...validation
    };
  } catch (err) {
    // Catch rendering errors (undefined variables, etc.)
    return {
      rendered: null,
      valid: false,
      errors: [{
        line: null,
        message: err.message,
        snippet: null
      }]
    };
  }
}

module.exports = {
  render,
  validate,
  renderAndValidate
};
