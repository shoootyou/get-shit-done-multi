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
 * @private
 */
function getPlatformCapabilities(platform) {
  // Claude capabilities
  if (platform === 'claude') {
    return {
      supportsModel: true,      // Claude: model selection in frontmatter
      supportsHooks: true,       // Claude: lifecycle hooks (onStart, onFinish)
      supportsMCP: true,         // Claude: MCP via skills system
      supportsSkills: true,      // Claude: explicit skills system
      charLimit: 200000,         // Claude: higher character limits
      supportsWildcards: false   // Claude: no tool wildcards
    };
  }

  // Copilot capabilities
  if (platform === 'copilot') {
    return {
      supportsModel: false,      // Copilot: no model selection
      supportsHooks: false,      // Copilot: no lifecycle hooks
      supportsMCP: true,         // Copilot: MCP in frontmatter
      supportsSkills: true,      // Copilot: skills via @-references
      charLimit: 30000,          // Copilot: 30k character limit
      supportsWildcards: true    // Copilot: tool wildcards (e.g., "github-*")
    };
  }

  // Codex capabilities (placeholder - adjust based on actual capabilities)
  if (platform === 'codex') {
    return {
      supportsModel: true,       // Codex: model selection (assumed similar to Claude)
      supportsHooks: false,      // Codex: no lifecycle hooks (assumed)
      supportsMCP: true,         // Codex: MCP support (assumed)
      supportsSkills: true,      // Codex: skills system (assumed)
      charLimit: 100000,         // Codex: character limit (assumed)
      supportsWildcards: false   // Codex: no wildcards (assumed)
    };
  }

  return {};
}

module.exports = {
  buildContext
};
