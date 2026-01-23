/**
 * Reference Resolver
 * 
 * Validates @-references in agent prompts and interpolates variables.
 * Ensures context files exist before agent invocation.
 * 
 * Reference: RESEARCH.md Pattern 3 and 4 (lines 157-218)
 * Pattern: @.planning/STATE.md, @{plan_path}, {var}
 */

const fs = require('fs');
const path = require('path');

/**
 * Validate @-references in agent prompt
 * 
 * @param {string} prompt - Agent prompt text containing @-references
 * @param {string} baseDir - Base directory for relative path resolution (default: '.planning')
 * @returns {Object} Validation result: { valid, references, errors, resolvedPaths }
 */
function validateReferences(prompt, baseDir = '.planning') {
  const result = {
    valid: true,
    references: [],
    errors: [],
    resolvedPaths: []
  };

  if (!prompt) {
    result.errors.push('Prompt is empty');
    result.valid = false;
    return result;
  }

  // Extract @-references using regex: @path/to/file
  // Matches: @word, @path/to/file, @.path/file, etc.
  // Stops at: whitespace, comma, closing brace
  const referencePattern = /@([^\s,}]+)/g;
  let match;

  while ((match = referencePattern.exec(prompt)) !== null) {
    const reference = match[1];
    result.references.push(reference);

    // Resolve the path
    let resolvedPath;
    
    if (reference.startsWith('/')) {
      // Absolute path from workspace root
      resolvedPath = reference.substring(1); // Remove leading slash
    } else if (reference.startsWith('.')) {
      // Relative path (already relative)
      resolvedPath = reference;
    } else {
      // Relative to baseDir
      resolvedPath = path.join(baseDir, reference);
    }

    // Normalize path separators
    resolvedPath = resolvedPath.replace(/\\/g, '/');
    result.resolvedPaths.push(resolvedPath);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      result.errors.push(`File not found: ${resolvedPath} (from @${reference})`);
      result.valid = false;
    }
  }

  return result;
}

/**
 * Interpolate variables in template string
 * 
 * Supports two formats:
 * - {var} - standard variable
 * - @{var} - reference variable
 * 
 * Order matters: {var} is replaced first, then @{var}
 * 
 * @param {string} template - String with {var} and @{var} placeholders
 * @param {Object} variables - Object with variable values
 * @returns {string} Interpolated string
 */
function interpolateVariables(template, variables = {}) {
  if (!template) {
    return '';
  }

  let result = template;

  // Step 1: Replace {var} format
  result = result.replace(/{(\w+)}/g, (match, varName) => {
    if (varName in variables) {
      return variables[varName];
    }
    // Keep placeholder if variable not defined
    return match;
  });

  // Step 2: Replace @{var} format (after {var} replacement)
  result = result.replace(/@{(\w+)}/g, (match, varName) => {
    if (varName in variables) {
      return variables[varName];
    }
    // Keep placeholder if variable not defined
    return match;
  });

  return result;
}

/**
 * Extract variable placeholders from template
 * 
 * @param {string} template - String with {var} and @{var} placeholders
 * @returns {Object} Object with { standard: [], reference: [] }
 */
function extractVariables(template) {
  const result = {
    standard: [],
    reference: []
  };

  if (!template) {
    return result;
  }

  // Extract {var} format
  const standardPattern = /{(\w+)}/g;
  let match;
  while ((match = standardPattern.exec(template)) !== null) {
    if (!result.standard.includes(match[1])) {
      result.standard.push(match[1]);
    }
  }

  // Extract @{var} format
  const referencePattern = /@{(\w+)}/g;
  while ((match = referencePattern.exec(template)) !== null) {
    if (!result.reference.includes(match[1])) {
      result.reference.push(match[1]);
    }
  }

  return result;
}

/**
 * Validate and interpolate prompt in one step
 * 
 * @param {string} prompt - Agent prompt with variables and @-references
 * @param {Object} variables - Variables to interpolate
 * @param {string} baseDir - Base directory for path resolution
 * @returns {Object} Result: { valid, interpolated, references, errors }
 */
function validateAndInterpolate(prompt, variables = {}, baseDir = '.planning') {
  // First interpolate variables
  const interpolated = interpolateVariables(prompt, variables);

  // Then validate references in interpolated prompt
  const validation = validateReferences(interpolated, baseDir);

  return {
    valid: validation.valid,
    interpolated,
    references: validation.references,
    resolvedPaths: validation.resolvedPaths,
    errors: validation.errors
  };
}

/**
 * Extract all @-references from prompt (without validation)
 * 
 * @param {string} prompt - Agent prompt text
 * @returns {string[]} Array of reference paths
 */
function extractReferences(prompt) {
  if (!prompt) {
    return [];
  }

  const references = [];
  const pattern = /@([^\s,}]+)/g;
  let match;

  while ((match = pattern.exec(prompt)) !== null) {
    references.push(match[1]);
  }

  return references;
}

/**
 * Resolve reference path to absolute filesystem path
 * 
 * @param {string} reference - Reference path (e.g., '.planning/STATE.md', '/workspace/file.txt')
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string} Absolute path
 */
function resolveReferencePath(reference, baseDir = '.planning') {
  if (reference.startsWith('/')) {
    // Already absolute (workspace-relative)
    return reference.substring(1);
  } else if (reference.startsWith('.')) {
    // Relative path
    return reference;
  } else {
    // Relative to baseDir
    return path.join(baseDir, reference);
  }
}

module.exports = {
  validateReferences,
  interpolateVariables,
  extractVariables,
  validateAndInterpolate,
  extractReferences,
  resolveReferencePath
};
