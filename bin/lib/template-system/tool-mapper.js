/**
 * Tool Mapper - Platform abstraction for tool names
 * 
 * Maps canonical tool names to platform-specific formats, handling
 * case sensitivity (Claude) and aliasing (Copilot) differences.
 * 
 * Based on research from .planning/research/PITFALLS.md
 */

/**
 * Canonical tool names that are safe to use across both platforms.
 * These tools exist on both Claude and Copilot with compatible behavior.
 * 
 * @constant {string[]}
 */
const CANONICAL_TOOLS = [
  'Bash',    // Execute capability - works on both platforms
  'Read',    // File read capability - works on both platforms
  'Edit',    // File write capability - works on both platforms
  'Grep',    // Code search capability - works on both platforms
  'Glob',    // File pattern matching - works on both platforms
  'Task',    // Sub-agent invocation - works on both platforms
];

/**
 * Tool compatibility matrix mapping canonical names to platform-specific formats.
 * 
 * Structure:
 * - claude: Exact case-sensitive name for Claude
 * - copilot: Primary name for Copilot (often lowercase)
 * - aliases: Array of alternative names Copilot accepts
 * - safe: Whether the tool behaves consistently across platforms
 * - warning: Optional warning message for platform-specific behavior
 * 
 * @constant {Object.<string, Object>}
 */
const TOOL_COMPATIBILITY_MATRIX = {
  'Bash': {
    claude: 'Bash',
    copilot: 'bash',
    aliases: ['execute', 'shell', 'Bash', 'powershell'],
    safe: true,
  },
  'Read': {
    claude: 'Read',
    copilot: 'read',
    aliases: ['Read', 'view', 'NotebookRead'],
    safe: true,
  },
  'Edit': {
    claude: 'Edit',
    copilot: 'edit',
    aliases: ['Edit', 'edit', 'Write', 'MultiEdit', 'create'],
    safe: true,
  },
  'Grep': {
    claude: 'Grep',
    copilot: 'grep',
    aliases: ['Grep', 'grep', 'search'],
    safe: true,
  },
  'Glob': {
    claude: 'Glob',
    copilot: 'glob',
    aliases: ['Glob', 'glob'],
    safe: true,
  },
  'Task': {
    claude: 'Task',
    copilot: 'task',
    aliases: ['Task', 'task', 'agent', 'custom-agent'],
    safe: true,
    warning: 'Task invocation may have different agent types available per platform',
  },
  'WebFetch': {
    claude: 'WebFetch',
    copilot: null,  // Not available on Copilot coding agent
    aliases: [],
    safe: false,
    warning: 'WebFetch is Claude-only. Not available on Copilot coding agent.',
  },
  'WebSearch': {
    claude: 'WebSearch',
    copilot: null,  // Not available on Copilot coding agent
    aliases: [],
    safe: false,
    warning: 'WebSearch is Claude-only. Not available on Copilot coding agent.',
  },
  'Write': {
    claude: 'Write',
    copilot: 'edit',  // Maps to edit on Copilot
    aliases: ['edit', 'Edit', 'Write', 'MultiEdit'],
    safe: false,
    warning: 'Write is Claude-specific. Use Edit for cross-platform compatibility.',
  },
};

/**
 * Maps an array of canonical tool names to platform-specific format.
 * 
 * @param {string[]} toolArray - Array of canonical tool names
 * @param {'claude'|'copilot'} platform - Target platform
 * @returns {string[]} Array of platform-specific tool names
 * 
 * @example
 * mapTools(['Bash', 'Read', 'Edit'], 'claude')
 * // Returns: ['Bash', 'Read', 'Edit']
 * 
 * @example
 * mapTools(['Bash', 'Read', 'Edit'], 'copilot')
 * // Returns: ['bash', 'read', 'edit']
 */
function mapTools(toolArray, platform) {
  if (!Array.isArray(toolArray)) {
    throw new Error('toolArray must be an array');
  }
  
  if (platform !== 'claude' && platform !== 'copilot') {
    throw new Error('platform must be "claude" or "copilot"');
  }
  
  return toolArray.map(tool => {
    const compatibility = TOOL_COMPATIBILITY_MATRIX[tool];
    
    if (!compatibility) {
      // Unknown tool - pass through unchanged with warning
      console.warn(`Warning: Unknown tool "${tool}" - passing through unchanged`);
      return tool;
    }
    
    return platform === 'claude' ? compatibility.claude : compatibility.copilot;
  }).filter(tool => tool !== null); // Remove tools not available on platform
}

/**
 * Get detailed compatibility information for a specific tool.
 * 
 * @param {string} toolName - The tool name to check
 * @returns {Object} Compatibility information
 * @returns {boolean} returns.isCanonical - Whether tool is in CANONICAL_TOOLS list
 * @returns {string|null} returns.claudeName - Tool name for Claude platform
 * @returns {string|null} returns.copilotName - Tool name for Copilot platform
 * @returns {boolean} returns.safe - Whether tool is safe for cross-platform use
 * @returns {string[]} returns.aliases - Alternative names (Copilot)
 * @returns {string|null} returns.warning - Warning message if tool has limitations
 * 
 * @example
 * getToolCompatibility('Bash')
 * // Returns: { isCanonical: true, claudeName: 'Bash', copilotName: 'bash', safe: true, ... }
 */
function getToolCompatibility(toolName) {
  const compatibility = TOOL_COMPATIBILITY_MATRIX[toolName];
  
  if (!compatibility) {
    return {
      isCanonical: false,
      claudeName: null,
      copilotName: null,
      safe: false,
      aliases: [],
      warning: `Unknown tool: "${toolName}" is not in the compatibility matrix`,
    };
  }
  
  return {
    isCanonical: CANONICAL_TOOLS.includes(toolName),
    claudeName: compatibility.claude,
    copilotName: compatibility.copilot,
    safe: compatibility.safe,
    aliases: compatibility.aliases || [],
    warning: compatibility.warning || null,
  };
}

/**
 * Validates a list of tools for a specific platform.
 * 
 * @param {string[]} tools - Array of tool names to validate
 * @param {'claude'|'copilot'} platform - Target platform
 * @returns {Object} Validation result
 * @returns {boolean} returns.valid - Whether all tools are valid
 * @returns {string[]} returns.warnings - Warning messages for risky tools
 * @returns {string[]} returns.errors - Error messages for unsupported tools
 * 
 * @example
 * validateToolList(['Bash', 'Read'], 'claude')
 * // Returns: { valid: true, warnings: [], errors: [] }
 * 
 * @example
 * validateToolList(['WebFetch'], 'copilot')
 * // Returns: { valid: false, warnings: [], errors: ['WebFetch is not available on copilot'] }
 */
function validateToolList(tools, platform) {
  if (!Array.isArray(tools)) {
    return {
      valid: false,
      warnings: [],
      errors: ['tools must be an array'],
    };
  }
  
  if (platform !== 'claude' && platform !== 'copilot') {
    return {
      valid: false,
      warnings: [],
      errors: ['platform must be "claude" or "copilot"'],
    };
  }
  
  const warnings = [];
  const errors = [];
  
  tools.forEach(tool => {
    const compatibility = TOOL_COMPATIBILITY_MATRIX[tool];
    
    if (!compatibility) {
      warnings.push(`Unknown tool: "${tool}" is not in the compatibility matrix`);
      return;
    }
    
    const platformName = platform === 'claude' ? compatibility.claude : compatibility.copilot;
    
    if (platformName === null) {
      errors.push(`${tool} is not available on ${platform}`);
      return;
    }
    
    if (!compatibility.safe && compatibility.warning) {
      warnings.push(`${tool}: ${compatibility.warning}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

module.exports = {
  CANONICAL_TOOLS,
  TOOL_COMPATIBILITY_MATRIX,
  mapTools,
  getToolCompatibility,
  validateToolList,
};
