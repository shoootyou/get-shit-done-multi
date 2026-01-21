/**
 * Generator Module - Template Pipeline Orchestrator
 * Coordinates spec-parser, context-builder, and engine to transform specs into agents
 * 
 * @module template-system/generator
 */

const { parseSpec, parseSpecString } = require('./spec-parser');
const { buildContext } = require('./context-builder');
const { render, validate } = require('./engine');
const yaml = require('js-yaml');

/**
 * Generate agent from spec file
 * 
 * @param {string} specPath - Path to spec file
 * @param {string} platform - Target platform: 'claude' | 'copilot' | 'codex'
 * @param {Object} options - Generation options
 * @param {string} options.workDir - Working directory (defaults to cwd)
 * @param {Object} options.paths - Path overrides for agents/skills
 * @param {boolean} options.validateOnly - Only validate, don't render
 * @param {boolean} options.dryRun - Perform pipeline but don't write files
 * @param {boolean} options.verbose - Include debug info in errors
 * @param {Object} options.contextVars - Additional variables for context
 * @returns {Object} Result object
 * @returns {boolean} return.success - Whether generation succeeded
 * @returns {string} return.output - Generated agent content (null on failure)
 * @returns {Array} return.errors - Error details (empty on success)
 * 
 * @example
 * const result = generateAgent('./agents/gsd-planner.md', 'claude', {
 *   workDir: '/workspace'
 * });
 * if (result.success) {
 *   console.log('Generated:', result.output);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 */
function generateAgent(specPath, platform, options = {}) {
  const errors = [];
  
  try {
    // Step 1: Parse spec file
    let spec;
    try {
      spec = parseSpec(specPath);
    } catch (parseErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'parse',
          message: `Failed to parse spec: ${parseErr.message}`,
          stack: options.verbose ? parseErr.stack : undefined
        }]
      };
    }
    
    // If validation only, skip rendering
    if (options.validateOnly) {
      try {
        const frontmatterStr = yaml.dump(spec.frontmatter);
        const validation = validate(frontmatterStr);
        
        return {
          success: validation.valid,
          output: null,
          errors: validation.valid ? [] : validation.errors.map(err => ({
            stage: 'validate',
            ...err
          }))
        };
      } catch (validationErr) {
        return {
          success: false,
          output: null,
          errors: [{
            stage: 'validate',
            message: validationErr.message,
            stack: options.verbose ? validationErr.stack : undefined
          }]
        };
      }
    }
    
    // Step 2: Build platform context
    let context;
    try {
      context = buildContext(platform, {
        workDir: options.workDir || process.cwd(),
        paths: options.paths || {},
        additionalVars: options.contextVars || {}
      });
    } catch (contextErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'context',
          message: `Failed to build context: ${contextErr.message}`,
          stack: options.verbose ? contextErr.stack : undefined
        }]
      };
    }
    
    // Step 3: Render frontmatter template
    let renderedFrontmatter;
    try {
      const frontmatterStr = yaml.dump(spec.frontmatter);
      renderedFrontmatter = render(frontmatterStr, context);
    } catch (renderErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'render-frontmatter',
          message: `Failed to render frontmatter: ${renderErr.message}`,
          stack: options.verbose ? renderErr.stack : undefined
        }]
      };
    }
    
    // Step 4: Render body template
    let renderedBody;
    try {
      renderedBody = render(spec.body, context);
    } catch (renderErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'render-body',
          message: `Failed to render body: ${renderErr.message}`,
          stack: options.verbose ? renderErr.stack : undefined
        }]
      };
    }
    
    // Step 5: Validate rendered frontmatter
    let validation;
    try {
      validation = validate(renderedFrontmatter);
      
      if (!validation.valid) {
        return {
          success: false,
          output: null,
          errors: validation.errors.map(err => ({
            stage: 'validate',
            ...err
          }))
        };
      }
    } catch (validationErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'validate',
          message: `Validation failed: ${validationErr.message}`,
          stack: options.verbose ? validationErr.stack : undefined
        }]
      };
    }
    
    // Step 6: Combine output
    const output = `---\n${renderedFrontmatter}---\n\n${renderedBody}`;
    
    return {
      success: true,
      output: output,
      errors: []
    };
    
  } catch (err) {
    // Catch-all for unexpected errors
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'unknown',
        message: `Unexpected error: ${err.message}`,
        stack: options.verbose ? err.stack : undefined
      }]
    };
  }
}

/**
 * Generate agent from already-parsed spec object
 * Useful for testing or when spec is already in memory
 * 
 * @param {Object} specObject - Parsed spec object from parseSpec
 * @param {Object} specObject.frontmatter - Parsed YAML frontmatter
 * @param {string} specObject.body - Markdown body content
 * @param {string} platform - Target platform: 'claude' | 'copilot' | 'codex'
 * @param {Object} options - Same options as generateAgent
 * @returns {Object} Same result structure as generateAgent
 * 
 * @example
 * const spec = { frontmatter: { name: 'test' }, body: '# Test' };
 * const result = generateFromSpec(spec, 'claude');
 */
function generateFromSpec(specObject, platform, options = {}) {
  // Validate spec object structure
  if (!specObject || typeof specObject !== 'object') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject must be an object with frontmatter and body properties'
      }]
    };
  }
  
  if (!specObject.frontmatter || typeof specObject.frontmatter !== 'object') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject.frontmatter must be an object'
      }]
    };
  }
  
  if (typeof specObject.body !== 'string') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject.body must be a string'
      }]
    };
  }
  
  try {
    // If validation only, skip rendering
    if (options.validateOnly) {
      try {
        const frontmatterStr = yaml.dump(specObject.frontmatter);
        const validation = validate(frontmatterStr);
        
        return {
          success: validation.valid,
          output: null,
          errors: validation.valid ? [] : validation.errors.map(err => ({
            stage: 'validate',
            ...err
          }))
        };
      } catch (validationErr) {
        return {
          success: false,
          output: null,
          errors: [{
            stage: 'validate',
            message: validationErr.message,
            stack: options.verbose ? validationErr.stack : undefined
          }]
        };
      }
    }
    
    // Build context
    let context;
    try {
      context = buildContext(platform, {
        workDir: options.workDir || process.cwd(),
        paths: options.paths || {},
        additionalVars: options.contextVars || {}
      });
    } catch (contextErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'context',
          message: `Failed to build context: ${contextErr.message}`,
          stack: options.verbose ? contextErr.stack : undefined
        }]
      };
    }
    
    // Render frontmatter
    let renderedFrontmatter;
    try {
      const frontmatterStr = yaml.dump(specObject.frontmatter);
      renderedFrontmatter = render(frontmatterStr, context);
    } catch (renderErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'render-frontmatter',
          message: `Failed to render frontmatter: ${renderErr.message}`,
          stack: options.verbose ? renderErr.stack : undefined
        }]
      };
    }
    
    // Render body
    let renderedBody;
    try {
      renderedBody = render(specObject.body, context);
    } catch (renderErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'render-body',
          message: `Failed to render body: ${renderErr.message}`,
          stack: options.verbose ? renderErr.stack : undefined
        }]
      };
    }
    
    // Validate
    try {
      const validation = validate(renderedFrontmatter);
      
      if (!validation.valid) {
        return {
          success: false,
          output: null,
          errors: validation.errors.map(err => ({
            stage: 'validate',
            ...err
          }))
        };
      }
    } catch (validationErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'validate',
          message: `Validation failed: ${validationErr.message}`,
          stack: options.verbose ? validationErr.stack : undefined
        }]
      };
    }
    
    // Combine output
    const output = `---\n${renderedFrontmatter}---\n\n${renderedBody}`;
    
    return {
      success: true,
      output: output,
      errors: []
    };
    
  } catch (err) {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'unknown',
        message: `Unexpected error: ${err.message}`,
        stack: options.verbose ? err.stack : undefined
      }]
    };
  }
}

module.exports = {
  generateAgent,
  generateFromSpec
};
