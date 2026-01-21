/**
 * Generator Module - Template Pipeline Orchestrator
 * Coordinates spec-parser, context-builder, and engine to transform specs into agents
 * 
 * Enhanced pipeline with platform abstraction:
 * parse → context → transform-tools → render → transform-fields → validate → validate-platform
 * 
 * @module template-system/generator
 */

const { parseSpec, parseSpecString } = require('./spec-parser');
const { buildContext } = require('./context-builder');
const { render, validate } = require('./engine');
const { mapTools, validateToolList } = require('./tool-mapper');
const { transformFields, addPlatformMetadata } = require('./field-transformer');
const { validateSpec, checkPromptLength } = require('./validators');
const yaml = require('js-yaml');

/**
 * Generate agent from spec file
 * 
 * Pipeline stages:
 * 1. Parse spec file (YAML frontmatter + body)
 * 2. Build platform context
 * 3. Transform tools to platform-specific names
 * 4. Render templates with context
 * 5. Transform fields for platform support
 * 6. Validate YAML structure
 * 7. Validate against platform spec requirements
 * 8. Check prompt length limits
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
 * @returns {Array} return.warnings - Non-blocking warnings about transformations
 * @returns {Object} return.metadata - Generation metadata
 * @returns {string} return.metadata.platform - Target platform
 * @returns {boolean} return.metadata.toolsTransformed - Whether tools were transformed
 * @returns {boolean} return.metadata.fieldsTransformed - Whether fields were transformed
 * @returns {boolean} return.metadata.validationPassed - Whether platform validation passed
 * 
 * @example
 * const result = generateAgent('./agents/gsd-planner.md', 'claude', {
 *   workDir: '/workspace'
 * });
 * if (result.success) {
 *   console.log('Generated:', result.output);
 *   console.log('Warnings:', result.warnings);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 */
function generateAgent(specPath, platform, options = {}) {
  const errors = [];
  const warnings = [];
  const metadata = {
    platform: platform,
    toolsTransformed: false,
    fieldsTransformed: false,
    validationPassed: false
  };
  
  try {
    // Step 1: Read raw spec file and render templates BEFORE parsing
    let spec;
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Read raw file content
      const absolutePath = path.resolve(specPath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Spec file not found: ${absolutePath}`);
      }
      
      const rawContent = fs.readFileSync(absolutePath, 'utf8');
      
      // Build context first so we can render templates
      const context = buildContext(platform, {
        workDir: options.workDir || process.cwd(),
        paths: options.paths || {},
        additionalVars: options.contextVars || {}
      });
      
      // Render templates in the entire file (including frontmatter)
      const renderedContent = render(rawContent, context);
      
      // Now parse the rendered content
      spec = parseSpecString(renderedContent, absolutePath);
      spec.path = absolutePath;
      
    } catch (parseErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'parse',
          message: `Failed to parse spec: ${parseErr.message}`,
          stack: options.verbose ? parseErr.stack : undefined
        }],
        warnings: [],
        metadata
      };
    }
    
    // If validation only, skip rest of pipeline
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
          })),
          warnings: [],
          metadata
        };
      } catch (validationErr) {
        return {
          success: false,
          output: null,
          errors: [{
            stage: 'validate',
            message: validationErr.message,
            stack: options.verbose ? validationErr.stack : undefined
          }],
          warnings: [],
          metadata
        };
      }
    }
    
    // Note: context was already built above during template rendering
    // Note: templates already rendered before parsing
    
    // Step 3: Transform tools to platform-specific names
    if (spec.frontmatter.tools && Array.isArray(spec.frontmatter.tools)) {
      try {
        // Validate tools first to get warnings
        const toolValidation = validateToolList(spec.frontmatter.tools, platform);
        
        // Add validation warnings
        if (toolValidation.warnings && toolValidation.warnings.length > 0) {
          toolValidation.warnings.forEach(warning => {
            warnings.push({
              stage: 'tool-mapping',
              message: typeof warning === 'string' ? warning : warning.message
            });
          });
        }
        
        // Add validation errors as warnings (non-blocking)
        if (toolValidation.errors && toolValidation.errors.length > 0) {
          toolValidation.errors.forEach(error => {
            warnings.push({
              stage: 'tool-mapping',
              message: typeof error === 'string' ? error : error.message
            });
          });
        }
        
        // Map tools to platform-specific names
        spec.frontmatter.tools = mapTools(spec.frontmatter.tools, platform);
        metadata.toolsTransformed = true;
      } catch (toolErr) {
        // Tool mapping errors are warnings, not blocking
        warnings.push({
          stage: 'tool-mapping',
          message: `Tool mapping failed: ${toolErr.message}`
        });
      }
    }
    
    // Step 4: Transform fields for platform support
    let finalFrontmatter;
    try {
      const transformResult = transformFields(spec.frontmatter, platform);
      
      // Add platform metadata
      finalFrontmatter = addPlatformMetadata(transformResult.transformed, platform);
      metadata.fieldsTransformed = true;
      
      // Add field transformation warnings
      if (transformResult.warnings && transformResult.warnings.length > 0) {
        transformResult.warnings.forEach(warning => {
          warnings.push({
            stage: 'field-transform',
            field: warning.field,
            message: warning.reason || warning.message || String(warning)
          });
        });
      }
    } catch (transformErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'field-transform',
          message: `Failed to transform fields: ${transformErr.message}`,
          stack: options.verbose ? transformErr.stack : undefined
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Step 5: Validate frontmatter (YAML structure)
    let validation;
    try {
      const frontmatterStr = yaml.dump(finalFrontmatter);
      validation = validate(frontmatterStr);
      
      if (!validation.valid) {
        return {
          success: false,
          output: null,
          errors: validation.errors.map(err => ({
            stage: 'validate',
            ...err
          })),
          warnings: warnings,
          metadata
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
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Step 6: Platform-specific validation
    try {
      const platformValidation = validateSpec(finalFrontmatter, platform);
      metadata.validationPassed = platformValidation.valid;
      
      // Add platform validation errors
      if (!platformValidation.valid) {
        platformValidation.errors.forEach(err => {
          errors.push({
            stage: 'platform-validation',
            field: err.field,
            message: err.message
          });
        });
      }
      
      // Add platform validation warnings
      if (platformValidation.warnings && platformValidation.warnings.length > 0) {
        platformValidation.warnings.forEach(warning => {
          warnings.push({
            stage: 'platform-validation',
            field: warning.field,
            message: warning.message
          });
        });
      }
      
      // If platform validation failed, return errors
      if (!platformValidation.valid) {
        return {
          success: false,
          output: null,
          errors: errors,
          warnings: warnings,
          metadata
        };
      }
    } catch (platformValidationErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'platform-validation',
          message: `Platform validation failed: ${platformValidationErr.message}`,
          stack: options.verbose ? platformValidationErr.stack : undefined
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Step 7: Combine output and check prompt length
    const frontmatterStr = yaml.dump(finalFrontmatter);
    const output = `---\n${frontmatterStr}---\n\n${spec.body}`;
    
    try {
      const lengthCheck = checkPromptLength(output, platform);
      
      if (lengthCheck.warnings && lengthCheck.warnings.length > 0) {
        lengthCheck.warnings.forEach(warning => {
          warnings.push({
            stage: 'prompt-length',
            message: warning.message,
            severity: warning.severity
          });
        });
      }
      
      // Prompt length exceeding limit is an error
      if (!lengthCheck.valid) {
        return {
          success: false,
          output: output,
          errors: [{
            stage: 'prompt-length',
            message: lengthCheck.warnings[0].message
          }],
          warnings: warnings,
          metadata
        };
      }
    } catch (lengthCheckErr) {
      // Length check failure is a warning, not blocking
      warnings.push({
        stage: 'prompt-length',
        message: `Length check failed: ${lengthCheckErr.message}`
      });
    }
    
    return {
      success: true,
      output: output,
      errors: [],
      warnings: warnings,
      metadata
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
      }],
      warnings: warnings,
      metadata
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
  const warnings = [];
  const metadata = {
    platform: platform,
    toolsTransformed: false,
    fieldsTransformed: false,
    validationPassed: false
  };
  
  // Validate spec object structure
  if (!specObject || typeof specObject !== 'object') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject must be an object with frontmatter and body properties'
      }],
      warnings: [],
      metadata
    };
  }
  
  if (!specObject.frontmatter || typeof specObject.frontmatter !== 'object') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject.frontmatter must be an object'
      }],
      warnings: [],
      metadata
    };
  }
  
  if (typeof specObject.body !== 'string') {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'input',
        message: 'specObject.body must be a string'
      }],
      warnings: [],
      metadata
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
          })),
          warnings: [],
          metadata
        };
      } catch (validationErr) {
        return {
          success: false,
          output: null,
          errors: [{
            stage: 'validate',
            message: validationErr.message,
            stack: options.verbose ? validationErr.stack : undefined
          }],
          warnings: [],
          metadata
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
        }],
        warnings: [],
        metadata
      };
    }
    
    // Transform tools to platform-specific names
    if (specObject.frontmatter.tools && Array.isArray(specObject.frontmatter.tools)) {
      try {
        // Validate tools first to get warnings
        const toolValidation = validateToolList(specObject.frontmatter.tools, platform);
        
        // Add validation warnings
        if (toolValidation.warnings && toolValidation.warnings.length > 0) {
          toolValidation.warnings.forEach(warning => {
            warnings.push({
              stage: 'tool-mapping',
              message: typeof warning === 'string' ? warning : warning.message
            });
          });
        }
        
        // Add validation errors as warnings (non-blocking)
        if (toolValidation.errors && toolValidation.errors.length > 0) {
          toolValidation.errors.forEach(error => {
            warnings.push({
              stage: 'tool-mapping',
              message: typeof error === 'string' ? error : error.message
            });
          });
        }
        
        // Map tools to platform-specific names
        specObject.frontmatter.tools = mapTools(specObject.frontmatter.tools, platform);
        metadata.toolsTransformed = true;
      } catch (toolErr) {
        warnings.push({
          stage: 'tool-mapping',
          message: `Tool mapping failed: ${toolErr.message}`
        });
      }
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
        }],
        warnings: warnings,
        metadata
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
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Transform fields for platform support
    let finalFrontmatter;
    try {
      const parsedFrontmatter = yaml.load(renderedFrontmatter);
      const transformResult = transformFields(parsedFrontmatter, platform);
      
      finalFrontmatter = addPlatformMetadata(transformResult.transformed, platform);
      metadata.fieldsTransformed = true;
      
      if (transformResult.warnings && transformResult.warnings.length > 0) {
        transformResult.warnings.forEach(warning => {
          warnings.push({
            stage: 'field-transform',
            field: warning.field,
            message: warning.reason || warning.message || String(warning)
          });
        });
      }
      
      renderedFrontmatter = yaml.dump(finalFrontmatter);
    } catch (transformErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'field-transform',
          message: `Failed to transform fields: ${transformErr.message}`,
          stack: options.verbose ? transformErr.stack : undefined
        }],
        warnings: warnings,
        metadata
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
          })),
          warnings: warnings,
          metadata
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
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Platform-specific validation
    try {
      const platformValidation = validateSpec(finalFrontmatter, platform);
      metadata.validationPassed = platformValidation.valid;
      
      if (!platformValidation.valid) {
        platformValidation.errors.forEach(err => {
          return {
            success: false,
            output: null,
            errors: [{
              stage: 'platform-validation',
              field: err.field,
              message: err.message
            }],
            warnings: warnings,
            metadata
          };
        });
      }
      
      if (platformValidation.warnings && platformValidation.warnings.length > 0) {
        platformValidation.warnings.forEach(warning => {
          warnings.push({
            stage: 'platform-validation',
            field: warning.field,
            message: warning.message
          });
        });
      }
      
      if (!platformValidation.valid) {
        return {
          success: false,
          output: null,
          errors: platformValidation.errors.map(err => ({
            stage: 'platform-validation',
            field: err.field,
            message: err.message
          })),
          warnings: warnings,
          metadata
        };
      }
    } catch (platformValidationErr) {
      return {
        success: false,
        output: null,
        errors: [{
          stage: 'platform-validation',
          message: `Platform validation failed: ${platformValidationErr.message}`,
          stack: options.verbose ? platformValidationErr.stack : undefined
        }],
        warnings: warnings,
        metadata
      };
    }
    
    // Combine output and check prompt length
    const output = `---\n${renderedFrontmatter}---\n\n${renderedBody}`;
    
    try {
      const lengthCheck = checkPromptLength(output, platform);
      
      if (lengthCheck.warnings && lengthCheck.warnings.length > 0) {
        lengthCheck.warnings.forEach(warning => {
          warnings.push({
            stage: 'prompt-length',
            message: warning.message,
            severity: warning.severity
          });
        });
      }
      
      if (!lengthCheck.valid) {
        return {
          success: false,
          output: output,
          errors: [{
            stage: 'prompt-length',
            message: lengthCheck.warnings[0].message
          }],
          warnings: warnings,
          metadata
        };
      }
    } catch (lengthCheckErr) {
      warnings.push({
        stage: 'prompt-length',
        message: `Length check failed: ${lengthCheckErr.message}`
      });
    }
    
    return {
      success: true,
      output: output,
      errors: [],
      warnings: warnings,
      metadata
    };
    
  } catch (err) {
    return {
      success: false,
      output: null,
      errors: [{
        stage: 'unknown',
        message: `Unexpected error: ${err.message}`,
        stack: options.verbose ? err.stack : undefined
      }],
      warnings: warnings,
      metadata
    };
  }
}

module.exports = {
  generateAgent,
  generateFromSpec
};
