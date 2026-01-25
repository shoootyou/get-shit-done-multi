/**
 * Platform-specific validators for agent frontmatter
 * Validates generated agent specs against Claude and Copilot requirements
 * Based on research from .planning/research/PITFALLS.md
 */

const { TOOL_COMPATIBILITY_MATRIX } = require('./tool-mapper');
const { FIELD_RULES } = require('./field-transformer');
const { getPlatformCapabilities } = require('./context-builder');

/**
 * Valid Claude model values
 * @constant {string[]}
 */
const CLAUDE_MODELS = ['sonnet', 'haiku', 'opus'];

/**
 * Valid Claude lifecycle hooks
 * @constant {string[]}
 */
const CLAUDE_HOOKS = ['on_create', 'on_message', 'on_invoke', 'on_complete', 'on_error'];

/**
 * Platform prompt length limits (in characters)
 * @constant {Object}
 */
const PROMPT_LIMITS = {
  claude: 200000,   // Claude: 200k chars (Pitfall 7)
  copilot: 30000,   // Copilot: 30k chars (Pitfall 7)
};

/**
 * Validate Claude agent specification
 * 
 * @param {Object} frontmatter - Parsed frontmatter
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether spec is valid
 * @returns {Array} return.errors - Blocking errors
 * @returns {Array} return.warnings - Non-blocking warnings
 */
function validateClaudeSpec(frontmatter) {
  const errors = [];
  const warnings = [];

  if (!frontmatter || typeof frontmatter !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'frontmatter', message: 'Frontmatter must be a valid object' }],
      warnings: []
    };
  }

  // Required fields
  if (!frontmatter.name || typeof frontmatter.name !== 'string' || frontmatter.name.trim() === '') {
    errors.push({ field: 'name', message: 'name is required and must be a non-empty string' });
  }

  if (!frontmatter.description || typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push({ field: 'description', message: 'description is required and must be a non-empty string' });
  }

  // Tools validation (case-sensitive)
  if (frontmatter.tools) {
    // Claude accepts both string format (tools: Read, Write) and array format
    let toolsArray;
    if (typeof frontmatter.tools === 'string') {
      // Parse comma-separated string
      toolsArray = frontmatter.tools.split(',').map(t => t.trim());
    } else if (Array.isArray(frontmatter.tools)) {
      toolsArray = frontmatter.tools;
    } else {
      errors.push({ field: 'tools', message: 'tools must be either a comma-separated string or an array' });
      toolsArray = [];
    }
    
    if (toolsArray.length > 0) {
      // Check for wildcard syntax (not allowed on Claude)
      // Only check for standalone * or **, not * within tool names like mcp__context7__*
      if (toolsArray.some(t => t === '*' || t === '**')) {
        errors.push({ 
          field: 'tools', 
          message: 'Claude does not support wildcard tools ["*"]. Must specify tools explicitly.' 
        });
      }

      // Validate tool names are case-correct (Pitfall 1)
      toolsArray.forEach(tool => {
        // Skip MCP tool patterns (mcp__*__*) - these are dynamic and platform-specific
        if (tool.startsWith('mcp__') && tool.includes('__', 5)) {
          return;
        }
        
        const toolInfo = TOOL_COMPATIBILITY_MATRIX[tool];
        
        if (!toolInfo) {
          // Unknown tool - check if it's a lowercase version of canonical
          const correctCase = Object.keys(TOOL_COMPATIBILITY_MATRIX).find(
            canonical => canonical.toLowerCase() === tool.toLowerCase()
          );
          
          if (correctCase) {
            errors.push({ 
              field: 'tools', 
              message: `Tool name "${tool}" has incorrect case. Claude requires exact case: "${correctCase}"` 
            });
          } else {
            warnings.push({ 
              field: 'tools', 
              message: `Unknown tool "${tool}". Verify this tool exists on Claude.` 
            });
          }
        } else if (toolInfo.claude !== tool) {
          // Tool exists but case is wrong
          errors.push({ 
            field: 'tools', 
            message: `Tool name "${tool}" incorrect. Use "${toolInfo.claude}" for Claude.` 
          });
        }
        // Don't warn about Claude-only tools when generating FOR Claude
        // The warning "Tool is Claude-only" is for Copilot users, not Claude users
      });
    }
  }

  // Model validation
  if (frontmatter.model !== undefined) {
    if (typeof frontmatter.model !== 'string' || !CLAUDE_MODELS.includes(frontmatter.model)) {
      errors.push({ 
        field: 'model', 
        message: `model must be one of: ${CLAUDE_MODELS.join(', ')}` 
      });
    }
  }

  // Hooks validation
  if (frontmatter.hooks !== undefined) {
    if (typeof frontmatter.hooks !== 'object' || Array.isArray(frontmatter.hooks)) {
      errors.push({ field: 'hooks', message: 'hooks must be an object' });
    } else {
      const hookKeys = Object.keys(frontmatter.hooks);
      hookKeys.forEach(hookKey => {
        if (!CLAUDE_HOOKS.includes(hookKey)) {
          warnings.push({ 
            field: 'hooks', 
            message: `Unknown hook "${hookKey}". Valid hooks: ${CLAUDE_HOOKS.join(', ')}` 
          });
        }
      });
    }
  }

  // Skills validation
  if (frontmatter.skills !== undefined) {
    if (!Array.isArray(frontmatter.skills)) {
      errors.push({ field: 'skills', message: 'skills must be an array' });
    }
  }

  // disallowedTools validation
  if (frontmatter.disallowedTools !== undefined) {
    if (!Array.isArray(frontmatter.disallowedTools)) {
      errors.push({ field: 'disallowedTools', message: 'disallowedTools must be an array' });
    }
  }

  // Color validation (if present)
  if (frontmatter.color !== undefined && typeof frontmatter.color !== 'string') {
    warnings.push({ field: 'color', message: 'color should be a string' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Copilot agent specification
 * 
 * @param {Object} frontmatter - Parsed frontmatter
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether spec is valid
 * @returns {Array} return.errors - Blocking errors
 * @returns {Array} return.warnings - Non-blocking warnings
 */
function validateCopilotSpec(frontmatter) {
  const errors = [];
  const warnings = [];

  if (!frontmatter || typeof frontmatter !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'frontmatter', message: 'Frontmatter must be a valid object' }],
      warnings: []
    };
  }

  // Required fields
  if (!frontmatter.name || typeof frontmatter.name !== 'string' || frontmatter.name.trim() === '') {
    errors.push({ field: 'name', message: 'name is required and must be a non-empty string' });
  }

  if (!frontmatter.description || typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push({ field: 'description', message: 'description is required and must be a non-empty string' });
  }

  // Tools validation (Copilot allows wildcards)
  if (frontmatter.tools) {
    if (!Array.isArray(frontmatter.tools)) {
      errors.push({ field: 'tools', message: 'tools must be an array' });
    } else {
      // Wildcards are valid on Copilot
      const hasWildcard = frontmatter.tools.includes('*') || frontmatter.tools.includes('**');
      
      if (!hasWildcard) {
        // Validate individual tool names
        frontmatter.tools.forEach(tool => {
          const toolInfo = TOOL_COMPATIBILITY_MATRIX[tool];
          
          if (toolInfo && toolInfo.copilot === null) {
            warnings.push({ 
              field: 'tools', 
              message: `Tool "${tool}" is not available on Copilot. ${toolInfo.warning || ''}` 
            });
          }
        });
      }
    }
  }

  // Warn about Claude-only fields (Pitfall 3, 4, 10)
  if (frontmatter.model !== undefined) {
    warnings.push({ 
      field: 'model', 
      message: 'model field is ignored on Copilot (uses main conversation model)' 
    });
  }

  if (frontmatter.hooks !== undefined) {
    warnings.push({ 
      field: 'hooks', 
      message: 'hooks are not supported on Copilot (use prompt text for initialization)' 
    });
  }

  if (frontmatter.skills !== undefined) {
    warnings.push({ 
      field: 'skills', 
      message: 'skills are not supported on Copilot (embed content in prompt text)' 
    });
  }

  if (frontmatter.disallowedTools !== undefined) {
    warnings.push({ 
      field: 'disallowedTools', 
      message: 'disallowedTools is not supported on Copilot (use tools allowlist only)' 
    });
  }

  // MCP servers validation (Pitfall 8)
  if (frontmatter['mcp-servers'] !== undefined) {
    if (typeof frontmatter['mcp-servers'] !== 'object' || Array.isArray(frontmatter['mcp-servers'])) {
      errors.push({ field: 'mcp-servers', message: 'mcp-servers must be an object' });
    } else {
      // Validate structure: each key should map to server config
      const servers = frontmatter['mcp-servers'];
      Object.keys(servers).forEach(serverKey => {
        if (typeof servers[serverKey] !== 'object') {
          warnings.push({ 
            field: 'mcp-servers', 
            message: `MCP server "${serverKey}" config should be an object` 
          });
        }
      });
    }
  }

  // Color validation (if present)
  if (frontmatter.color !== undefined && typeof frontmatter.color !== 'string') {
    warnings.push({ field: 'color', message: 'color should be a string' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate agent/skill spec frontmatter for Codex platform
 * 
 * Codex is similar to Claude but uses lowercase tool names.
 * 
 * @param {Object} frontmatter - Parsed frontmatter from spec
 * @returns {Object} Validation result
 * @returns {boolean} return.valid - Whether spec is valid
 * @returns {Array} return.errors - Blocking errors
 * @returns {Array} return.warnings - Non-blocking warnings
 */
function validateCodexSpec(frontmatter) {
  const errors = [];
  const warnings = [];

  if (!frontmatter || typeof frontmatter !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'frontmatter', message: 'Frontmatter must be a valid object' }],
      warnings: []
    };
  }

  // Required fields
  if (!frontmatter.name || typeof frontmatter.name !== 'string' || frontmatter.name.trim() === '') {
    errors.push({ field: 'name', message: 'name is required and must be a non-empty string' });
  }

  if (!frontmatter.description || typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
    errors.push({ field: 'description', message: 'description is required and must be a non-empty string' });
  }

  // Tools validation (Codex uses lowercase tool names)
  if (frontmatter.tools) {
    // Codex accepts both string format and array format
    let toolsArray;
    if (typeof frontmatter.tools === 'string') {
      // Parse comma-separated string
      toolsArray = frontmatter.tools.split(',').map(t => t.trim());
    } else if (Array.isArray(frontmatter.tools)) {
      toolsArray = frontmatter.tools;
    } else {
      errors.push({ field: 'tools', message: 'tools must be either a comma-separated string or an array' });
      toolsArray = [];
    }
    
    if (toolsArray.length > 0) {
      // Validate tool names against codex format (lowercase)
      toolsArray.forEach(tool => {
        // Skip MCP tool patterns
        if (tool.startsWith('mcp__') && tool.includes('__', 5)) {
          return;
        }
        
        // Find canonical tool in matrix
        const canonicalTool = Object.keys(TOOL_COMPATIBILITY_MATRIX).find(
          canonical => TOOL_COMPATIBILITY_MATRIX[canonical].codex === tool
        );
        
        if (!canonicalTool) {
          // Check if it's an incorrectly cased version
          const correctCase = Object.keys(TOOL_COMPATIBILITY_MATRIX).find(
            canonical => {
              const codexName = TOOL_COMPATIBILITY_MATRIX[canonical].codex;
              return codexName && codexName.toLowerCase() === tool.toLowerCase();
            }
          );
          
          if (correctCase) {
            const expectedName = TOOL_COMPATIBILITY_MATRIX[correctCase].codex;
            errors.push({ 
              field: 'tools', 
              message: `Tool name "${tool}" has incorrect case. Codex requires: "${expectedName}"` 
            });
          } else {
            warnings.push({ 
              field: 'tools', 
              message: `Unknown tool "${tool}". Verify this tool exists on Codex.` 
            });
          }
        }
      });
    }
  }

  // Color validation
  if (frontmatter.color !== undefined && typeof frontmatter.color !== 'string') {
    warnings.push({ field: 'color', message: 'color should be a string' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate spec for target platform
 * 
 * @param {Object} frontmatter - Parsed frontmatter
 * @param {string} platform - Target platform ('claude' | 'copilot' | 'codex')
 * @returns {Object} Validation result
 */
function validateSpec(frontmatter, platform) {
  if (platform === 'claude') {
    return validateClaudeSpec(frontmatter);
  } else if (platform === 'copilot') {
    return validateCopilotSpec(frontmatter);
  } else if (platform === 'codex') {
    return validateCodexSpec(frontmatter);
  } else {
    return {
      valid: false,
      errors: [{ 
        field: 'platform', 
        message: `Unsupported platform: ${platform}. Must be 'claude', 'copilot', or 'codex'` 
      }],
      warnings: []
    };
  }
}

/**
 * Check if prompt text exceeds platform limits
 * 
 * @param {string} promptText - Full agent prompt (frontmatter + body)
 * @param {string} platform - Target platform
 * @returns {Object} Length check result
 * @returns {boolean} return.valid - Whether length is acceptable
 * @returns {number} return.length - Actual prompt length
 * @returns {number} return.limit - Platform limit
 * @returns {number} return.percentage - Usage percentage
 * @returns {Array} return.warnings - Warnings if approaching limit
 */
function checkPromptLength(promptText, platform) {
  const length = promptText ? promptText.length : 0;
  const limit = PROMPT_LIMITS[platform] || PROMPT_LIMITS.copilot; // Default to stricter limit
  const percentage = (length / limit) * 100;
  const warnings = [];

  // Warn if over 90% of limit (Pitfall 7)
  if (percentage > 100) {
    warnings.push({
      message: `Prompt exceeds ${platform} limit: ${length} chars > ${limit} chars (${percentage.toFixed(1)}%)`,
      severity: 'error'
    });
  } else if (percentage > 90) {
    warnings.push({
      message: `Prompt approaching ${platform} limit: ${length} chars / ${limit} chars (${percentage.toFixed(1)}%)`,
      severity: 'warning'
    });
  }

  return {
    valid: percentage <= 100,
    length,
    limit,
    percentage: percentage.toFixed(1),
    warnings
  };
}

module.exports = {
  validateClaudeSpec,
  validateCopilotSpec,
  validateCodexSpec,
  validateSpec,
  checkPromptLength,
  CLAUDE_MODELS,
  CLAUDE_HOOKS,
  PROMPT_LIMITS,
};
