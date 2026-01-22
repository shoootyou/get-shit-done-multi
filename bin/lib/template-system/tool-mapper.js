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
    copilot: 'execute',  // PRIMARY alias (was: 'bash')
    aliases: ['execute', 'bash', 'shell', 'Bash', 'powershell'],
    safe: true,
  },
  'Read': {
    claude: 'Read',
    copilot: 'read',  // Already PRIMARY
    aliases: ['Read', 'read', 'view', 'NotebookRead'],
    safe: true,
  },
  'Edit': {
    claude: 'Edit',
    copilot: 'edit',  // PRIMARY alias (replaces 'write')
    aliases: ['Edit', 'edit', 'MultiEdit', 'create'],
    safe: true,
  },
  'Grep': {
    claude: 'Grep',
    copilot: 'search',  // PRIMARY alias (was: 'grep')
    aliases: ['Grep', 'grep', 'search'],
    safe: true,
  },
  'Glob': {
    claude: 'Glob',
    copilot: 'search',  // PRIMARY - DEDUPLICATES with Grep
    aliases: ['Glob', 'glob'],
    safe: true,
  },
  'Task': {
    claude: 'Task',
    copilot: 'agent',  // PRIMARY alias (was: 'task')
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
    aliases: ['Write', 'MultiEdit'],
    safe: false,
    warning: 'Write is Claude-specific. Use Edit for cross-platform compatibility.',
  },
};

/**
 * Reverse index mapping all tool name variants to canonical names.
 * Built at module load time from TOOL_COMPATIBILITY_MATRIX.
 * Enables bidirectional lookup: accepts uppercase, lowercase, aliases → returns canonical.
 * 
 * Build order: Non-canonical tools first, then canonical tools.
 * This ensures canonical tools take precedence when there are conflicts.
 * 
 * @constant {Object.<string, string>}
 */
const REVERSE_TOOL_INDEX = {};

// Build reverse index at module load time
// Pass 1: Non-canonical tools first
for (const [canonical, config] of Object.entries(TOOL_COMPATIBILITY_MATRIX)) {
  if (CANONICAL_TOOLS.includes(canonical)) continue; // Skip canonical tools in pass 1
  
  // Canonical name itself (any case)
  REVERSE_TOOL_INDEX[canonical] = canonical;
  REVERSE_TOOL_INDEX[canonical.toLowerCase()] = canonical;
  REVERSE_TOOL_INDEX[canonical.toUpperCase()] = canonical;
  
  // Claude name (any case)
  if (config.claude) {
    REVERSE_TOOL_INDEX[config.claude] = canonical;
    REVERSE_TOOL_INDEX[config.claude.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[config.claude.toUpperCase()] = canonical;
  }
  
  // Copilot name (any case)
  if (config.copilot) {
    REVERSE_TOOL_INDEX[config.copilot] = canonical;
    REVERSE_TOOL_INDEX[config.copilot.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[config.copilot.toUpperCase()] = canonical;
  }
  
  // All aliases (any case)
  config.aliases.forEach(alias => {
    REVERSE_TOOL_INDEX[alias] = canonical;
    REVERSE_TOOL_INDEX[alias.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[alias.toUpperCase()] = canonical;
  });
}

// Pass 2: Canonical tools override non-canonical mappings
for (const [canonical, config] of Object.entries(TOOL_COMPATIBILITY_MATRIX)) {
  if (!CANONICAL_TOOLS.includes(canonical)) continue; // Skip non-canonical in pass 2
  
  // Canonical name itself (any case)
  REVERSE_TOOL_INDEX[canonical] = canonical;
  REVERSE_TOOL_INDEX[canonical.toLowerCase()] = canonical;
  REVERSE_TOOL_INDEX[canonical.toUpperCase()] = canonical;
  
  // Claude name (any case)
  if (config.claude) {
    REVERSE_TOOL_INDEX[config.claude] = canonical;
    REVERSE_TOOL_INDEX[config.claude.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[config.claude.toUpperCase()] = canonical;
  }
  
  // Copilot name (any case)
  if (config.copilot) {
    REVERSE_TOOL_INDEX[config.copilot] = canonical;
    REVERSE_TOOL_INDEX[config.copilot.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[config.copilot.toUpperCase()] = canonical;
  }
  
  // All aliases (any case)
  config.aliases.forEach(alias => {
    REVERSE_TOOL_INDEX[alias] = canonical;
    REVERSE_TOOL_INDEX[alias.toLowerCase()] = canonical;
    REVERSE_TOOL_INDEX[alias.toUpperCase()] = canonical;
  });
}

/**
 * Maps an array of tool names (canonical, aliases, any case) to platform-specific format.
 * 
 * Uses REVERSE_TOOL_INDEX for bidirectional lookup:
 * 1. Resolve input tool name (any variant) to canonical name
 * 2. Map canonical to platform-specific PRIMARY name
 * 3. Deduplicate for Copilot (Grep+Glob both → 'search')
 * 
 * @param {string[]} toolArray - Array of tool names (any variant: canonical, alias, any case)
 * @param {'claude'|'copilot'} platform - Target platform
 * @returns {string[]} Array of platform-specific tool names (PRIMARY aliases for Copilot)
 * 
 * @example
 * mapTools(['Bash', 'Read', 'Edit'], 'claude')
 * // Returns: ['Bash', 'Read', 'Edit']
 * 
 * @example
 * mapTools(['bash', 'read', 'edit'], 'copilot')
 * // Returns: ['execute', 'read', 'edit']
 * 
 * @example
 * mapTools(['Grep', 'Glob'], 'copilot')
 * // Returns: ['search'] (deduplicated)
 */
function mapTools(toolArray, platform) {
  if (!Array.isArray(toolArray)) {
    throw new Error('toolArray must be an array');
  }
  
  if (platform !== 'claude' && platform !== 'copilot') {
    throw new Error('platform must be "claude" or "copilot"');
  }
  
  const mapped = toolArray.map(tool => {
    // 1. Resolve to canonical name via REVERSE_INDEX
    const canonical = REVERSE_TOOL_INDEX[tool];
    
    if (!canonical) {
      // Unknown tool - pass through unchanged with warning
      console.warn(`Warning: Unknown tool "${tool}" - passing through unchanged`);
      return tool;
    }
    
    // 2. Map canonical to platform-specific PRIMARY name
    const compatibility = TOOL_COMPATIBILITY_MATRIX[canonical];
    return platform === 'claude' ? compatibility.claude : compatibility.copilot;
  }).filter(tool => tool !== null); // Remove tools not available on platform
  
  // 3. Deduplicate for Copilot (Grep + Glob both → 'search')
  if (platform === 'copilot') {
    return [...new Set(mapped)];
  }
  
  return mapped;
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
  // Resolve tool name to canonical via REVERSE_INDEX (handles any case, aliases)
  const canonical = REVERSE_TOOL_INDEX[toolName];
  
  if (!canonical) {
    return {
      isCanonical: false,
      claudeName: null,
      copilotName: null,
      safe: false,
      aliases: [],
      warning: `Unknown tool: "${toolName}" is not in the compatibility matrix`,
    };
  }
  
  // Look up canonical name in compatibility matrix
  const compatibility = TOOL_COMPATIBILITY_MATRIX[canonical];
  
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
    isCanonical: CANONICAL_TOOLS.includes(canonical),
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
    // Resolve tool name to canonical via REVERSE_INDEX (handles any case, aliases)
    const canonical = REVERSE_TOOL_INDEX[tool];
    
    if (!canonical) {
      warnings.push(`Unknown tool: "${tool}" is not in the compatibility matrix`);
      return;
    }
    
    // Now look up canonical name in compatibility matrix
    const compatibility = TOOL_COMPATIBILITY_MATRIX[canonical];
    
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
  REVERSE_TOOL_INDEX,
  mapTools,
  getToolCompatibility,
  validateToolList,
};
