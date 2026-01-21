/**
 * Context builder for template rendering
 * Constructs platform-specific context objects with flags and capabilities
 */

const path = require('path');
const { getConfigPaths } = require('../paths');

/**
 * Build template rendering context for a specific platform
 * @param {string} platform - Target platform: 'claude', 'copilot', or 'codex'
 * @param {Object} options - Configuration options
 * @param {Object} options.paths - Path overrides (optional)
 * @param {string} options.workDir - Working directory (optional, defaults to cwd)
 * @param {Object} options.additionalVars - Additional variables to merge (optional)
 * @returns {Object} Context object for template rendering
 */
function buildContext(platform, options = {}) {
  // Validate platform parameter
  const validPlatforms = ['claude', 'copilot', 'codex'];
  if (!validPlatforms.includes(platform)) {
    throw new Error(
      `Unsupported platform: "${platform}". Must be one of: ${validPlatforms.join(', ')}`
    );
  }

  // Get default paths from existing paths.js logic
  const configPaths = getConfigPaths(platform);
  
  // Build platform-specific paths
  const agentsPath = options.paths?.agents || getAgentsPath(platform, configPaths);
  const skillsPath = options.paths?.skills || getSkillsPath(platform, configPaths);
  const workDir = options.workDir || process.cwd();

  // Platform flags (for conditional sections in templates)
  const isClaude = platform === 'claude';
  const isCopilot = platform === 'copilot';
  const isCodex = platform === 'codex';

  // Platform capabilities (based on research/PITFALLS.md findings)
  const capabilities = getPlatformCapabilities(platform);

  // Build final context object
  const context = {
    // Platform identification
    platform,
    isClaude,
    isCopilot,
    isCodex,
    
    // Paths
    agentsPath,
    skillsPath,
    workDir,
    
    // Capabilities
    ...capabilities,
    
    // Merge any additional variables
    ...(options.additionalVars || {})
  };

  return context;
}

/**
 * Get agents directory path for platform
 * @private
 */
function getAgentsPath(platform, configPaths) {
  const agentsPaths = {
    claude: path.join(configPaths.global, 'agents'),
    copilot: path.join(configPaths.local, 'copilot', 'agents'),
    codex: path.join(configPaths.global, 'agents')
  };
  return agentsPaths[platform];
}

/**
 * Get skills directory path for platform
 * @private
 */
function getSkillsPath(platform, configPaths) {
  const skillsPaths = {
    claude: path.join(configPaths.global, 'skills'),
    copilot: path.join(configPaths.local, 'copilot', 'skills'),
    codex: path.join(configPaths.global, 'skills')
  };
  return skillsPaths[platform];
}

/**
 * Get platform-specific capability flags
 * Based on research/PITFALLS.md and platform documentation
 * Enhanced with detailed capability flags for fine-grained platform abstraction
 * @private
 */
function getPlatformCapabilities(platform) {
  // Claude capabilities (from PITFALLS.md research)
  if (platform === 'claude') {
    return {
      // Pitfall 3: Model field support
      supportsModel: true,            // Can use model field for optimization (haiku, sonnet, opus)
      
      // Pitfall 10: Hooks and Skills
      supportsHooks: true,            // Lifecycle events available (on_create, on_finish, etc.)
      supportsSkills: true,           // Content injection via skills system
      
      // Pitfall 8: MCP configuration
      supportsMCP: true,              // Inherits from global MCP config (no frontmatter config)
      
      // Pitfall 4: Tool restrictions
      supportsDisallowedTools: true,  // Denylist available (disallowedTools field)
      
      // Pitfall 9: Wildcards
      supportsWildcards: false,       // No tools: ['*'] syntax (must list explicitly)
      
      // Pitfall 7: Character limits
      maxPromptLength: 200000,        // 200k character limit for prompts
      
      // Pitfall 1: Tool name case sensitivity
      toolCaseSensitive: true         // Exact case required (Bash not bash)
    };
  }

  // Copilot capabilities (from PITFALLS.md research)
  if (platform === 'copilot') {
    return {
      // Pitfall 3: Model field ignored
      supportsModel: false,           // Model field ignored - uses main conversation model
      
      // Pitfall 10: No hooks or skills
      supportsHooks: false,           // No lifecycle events
      supportsSkills: false,          // No skills system (use @-references in prompt instead)
      
      // Pitfall 8: MCP in frontmatter
      supportsMCP: true,              // Org/enterprise: mcp-servers in frontmatter. Repo: inherits
      
      // Pitfall 4: Only allowlist
      supportsDisallowedTools: false, // Only allowlist via tools field (no denylist)
      
      // Pitfall 9: Wildcards supported
      supportsWildcards: true,        // tools: ["*"] means all tools
      
      // Pitfall 7: Lower character limit
      maxPromptLength: 30000,         // 30k character limit per PITFALLS.md
      
      // Pitfall 1: Case insensitive
      toolCaseSensitive: false        // Case-insensitive tool names (bash = Bash = BASH)
    };
  }

  // Codex capabilities (placeholder - to be refined based on Codex specifications)
  if (platform === 'codex') {
    return {
      supportsModel: true,            // Assumed similar to Claude
      supportsHooks: false,           // Assumed no lifecycle hooks
      supportsSkills: true,           // Assumed skills system exists
      supportsMCP: true,              // Assumed MCP support
      supportsDisallowedTools: false, // To be determined
      supportsWildcards: false,       // To be determined
      maxPromptLength: 100000,        // Assumed character limit
      toolCaseSensitive: true         // Assumed case-sensitive
      // NOTE: To be refined based on Codex specifications
    };
  }

  return {};
}

/**
 * Check if a specific field is supported on a platform
 * @param {string} platform - Target platform
 * @param {string} fieldName - Field name to check
 * @returns {boolean|null} True if supported, false if not, null if unknown
 */
function supportsField(platform, fieldName) {
  const capabilities = getPlatformCapabilities(platform);
  
  // Map field names to capability flags
  const fieldCapabilityMap = {
    'model': 'supportsModel',
    'hooks': 'supportsHooks',
    'skills': 'supportsSkills',
    'mcp-servers': 'supportsMCP',
    'disallowedTools': 'supportsDisallowedTools'
  };
  
  const capabilityKey = fieldCapabilityMap[fieldName];
  
  if (capabilityKey && capabilityKey in capabilities) {
    return capabilities[capabilityKey];
  }
  
  // Common fields assumed supported on all platforms
  const commonFields = ['name', 'description', 'tools', 'location'];
  if (commonFields.includes(fieldName)) {
    return true;
  }
  
  return null; // Unknown field
}

/**
 * Get warning message for unsupported field
 * @param {string} platform - Target platform
 * @param {string} fieldName - Field name
 * @returns {string|null} Warning message or null if supported
 */
function getFieldWarning(platform, fieldName) {
  const supported = supportsField(platform, fieldName);
  
  if (supported === null) {
    return `Unknown field "${fieldName}" - verify platform support`;
  }
  
  if (supported === true) {
    return null; // No warning needed
  }
  
  // Generate helpful warning messages
  const warnings = {
    claude: {
      'mcp-servers': 'Claude inherits MCP from global config - mcp-servers field not used in agent frontmatter',
      'skills': 'Skills not supported on Claude (should not reach here - skills ARE supported)',
    },
    copilot: {
      'model': 'Copilot ignores model field - uses main conversation model. Remove for clarity.',
      'hooks': 'Copilot does not support lifecycle hooks - use prompt text for initialization',
      'skills': 'Copilot does not support skills system - embed content directly in prompt',
      'disallowedTools': 'Copilot only supports allowlist (tools field) - use tools array instead of disallowedTools',
      'mcp-servers': 'Copilot requires mcp-servers in frontmatter (org/enterprise only)'
    }
  };
  
  return warnings[platform]?.[fieldName] || `Field "${fieldName}" not supported on ${platform}`;
}

/**
 * Get platform-specific limits and constraints
 * @param {string} platform - Target platform
 * @returns {Object} Limits object with maxPromptLength, toolCaseSensitive, etc.
 */
function getPlatformLimits(platform) {
  const capabilities = getPlatformCapabilities(platform);
  
  return {
    maxPromptLength: capabilities.maxPromptLength || 30000, // Default to lowest common denominator
    toolCaseSensitive: capabilities.toolCaseSensitive !== false, // Default to true (safer)
    supportsWildcards: capabilities.supportsWildcards === true,
    platform
  };
}

module.exports = {
  buildContext,
  supportsField,
  getFieldWarning,
  getPlatformLimits
};
