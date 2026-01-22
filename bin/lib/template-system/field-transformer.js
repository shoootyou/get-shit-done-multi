/**
 * Field transformer for platform-specific metadata handling
 * Handles conditional field inclusion/exclusion based on platform capabilities
 * Based on research/PITFALLS.md findings
 */

const path = require('path');
const fs = require('fs');

// Read package.json for project metadata
let projectInfo = { name: 'unknown', version: 'unknown' };
try {
  const pkgPath = path.join(__dirname, '../../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  projectInfo = { name: pkg.name, version: pkg.version };
} catch (err) {
  // Fallback if package.json not found
  console.warn('Could not read package.json for metadata:', err.message);
}

/**
 * Platform-specific field support rules
 * Derived from PITFALLS.md research on Claude/Copilot differences
 */
const FIELD_RULES = {
  // Pitfall 3: Model field for optimization (Claude-only)
  model: { 
    claude: true, 
    copilot: false,
    reason: 'Copilot ignores model field - uses main conversation model',
    suggestion: 'Remove model field for Copilot agents'
  },
  
  // Pitfall: Color field for agent UI customization (Claude-only)
  color: { 
    claude: true, 
    copilot: false,
    reason: 'Copilot does not support color field in agent frontmatter',
    suggestion: 'Remove color field for Copilot agents'
  },
  
  // Pitfall 10: Lifecycle hooks (Claude-only)
  hooks: { 
    claude: true, 
    copilot: false,
    reason: 'Copilot does not support lifecycle hooks',
    suggestion: 'Use prompt text for initialization instead of hooks'
  },
  
  // Pitfall 10: Skills system (Claude-only)
  skills: { 
    claude: true, 
    copilot: false,
    reason: 'Copilot does not support skills system',
    suggestion: 'Embed skill content directly in prompt text'
  },
  
  // Pitfall 4: Denylist tool restrictions (Claude-only)
  disallowedTools: { 
    claude: true, 
    copilot: false,
    reason: 'Copilot only supports allowlist (tools field)',
    suggestion: 'Use tools allowlist instead of disallowedTools denylist'
  },
  
  // Pitfall 8: MCP server configuration (platform-specific handling)
  'mcp-servers': { 
    claude: false,  // Claude inherits from global MCP config
    copilot: true,  // Copilot supports mcp-servers in frontmatter (org/enterprise)
    reason: 'Claude inherits MCP from global config, Copilot uses frontmatter',
    suggestion: 'For Claude, configure MCP globally. For Copilot, use mcp-servers field'
  },
  
  // Common fields supported on both platforms
  tools: { 
    claude: true, 
    copilot: true 
  },
  description: { 
    claude: true, 
    copilot: true 
  },
  name: { 
    claude: true, 
    copilot: true 
  },
  location: {
    claude: true,
    copilot: true
  }
};

/**
 * Transform frontmatter fields for target platform
 * @param {Object} frontmatter - Raw frontmatter from spec file
 * @param {string} platform - Target platform ('claude' or 'copilot')
 * @returns {Object} Transformed frontmatter with warnings
 */
function transformFields(frontmatter, platform) {
  // Validate inputs
  if (!frontmatter || typeof frontmatter !== 'object') {
    return { 
      transformed: {}, 
      warnings: [{ 
        field: 'frontmatter', 
        reason: 'Invalid or null frontmatter provided', 
        impact: 'No fields transformed' 
      }] 
    };
  }

  if (!platform || (platform !== 'claude' && platform !== 'copilot')) {
    return { 
      transformed: frontmatter, 
      warnings: [{ 
        field: 'platform', 
        reason: `Unsupported platform: ${platform}`, 
        impact: 'No transformation applied' 
      }] 
    };
  }

  const transformed = {};
  const warnings = [];

  // Process each field in frontmatter
  for (const [fieldName, fieldValue] of Object.entries(frontmatter)) {
    const rule = FIELD_RULES[fieldName];

    if (!rule) {
      // Unknown field - preserve with warning
      transformed[fieldName] = fieldValue;
      warnings.push({
        field: fieldName,
        reason: 'Unknown field - not in FIELD_RULES',
        impact: 'Field preserved for forward compatibility',
        suggestion: 'Verify field is supported by target platform'
      });
      continue;
    }

    // Check if field is supported on target platform
    if (rule[platform] === true) {
      // Field supported - include it
      transformed[fieldName] = fieldValue;
    } else {
      // Field not supported - exclude with warning
      warnings.push({
        field: fieldName,
        reason: rule.reason || `Field not supported on ${platform}`,
        impact: `Field excluded from ${platform} configuration`,
        suggestion: rule.suggestion || `Remove ${fieldName} for ${platform} agents`
      });
      // Do NOT include field in transformed output
    }
  }

  return { transformed, warnings };
}

/**
 * Validate field support for a specific platform
 * @param {string} fieldName - Name of the field to check
 * @param {string} platform - Target platform ('claude' or 'copilot')
 * @returns {Object} Validation result with support status and warnings
 */
function validateFieldSupport(fieldName, platform) {
  const rule = FIELD_RULES[fieldName];

  if (!rule) {
    return {
      supported: null,
      warning: `Unknown field "${fieldName}" - not in FIELD_RULES`,
      suggestion: 'Verify field is supported by target platform',
      impact: 'Field will be preserved with warning'
    };
  }

  const supported = rule[platform] === true;

  if (supported) {
    return {
      supported: true,
      warning: null,
      suggestion: null,
      impact: null
    };
  }

  return {
    supported: false,
    warning: rule.reason || `Field "${fieldName}" not supported on ${platform}`,
    suggestion: rule.suggestion || `Remove ${fieldName} for ${platform} agents`,
    impact: `Field will be excluded from ${platform} configuration`
  };
}

/**
 * Add platform-specific generation metadata to frontmatter
 * @param {Object} frontmatter - Transformed frontmatter object
 * @param {string} platform - Target platform ('claude' or 'copilot')
 * @param {Object} options - Generation options
 * @param {string} options.specPath - Path to source spec file
 * @param {string} options.version - Template system version
 * @returns {Object} Frontmatter with metadata added
 */
/**
 * Add platform-specific generation metadata to frontmatter
 * @param {Object} frontmatter - Transformed frontmatter object
 * @param {string} platform - Target platform ('claude' or 'copilot')
 * @param {Object} options - Generation options
 * @param {string} options.specPath - Path to source spec file
 * @param {string} options.version - Template system version
 * @returns {Object} Frontmatter with metadata added (platform-specific)
 */
function addPlatformMetadata(frontmatter, platform, options = {}) {
  if (!frontmatter || typeof frontmatter !== 'object') {
    return frontmatter;
  }

  // Claude: NO metadata fields (not in official spec)
  // Reference: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
  if (platform === 'claude') {
    return frontmatter;  // Return unchanged
  }

  // Copilot: Metadata MUST be nested under 'metadata' object
  // Reference: https://docs.github.com/en/copilot/reference/custom-agents-configuration
  if (platform === 'copilot') {
    const now = new Date();
    const metadata = {
      platform: platform,
      generated: now.toISOString().split('T')[0], // YYYY-MM-DD format
      templateVersion: '1.0.0', // Template system version
      projectVersion: projectInfo.version, // Package version (e.g., 1.8.1)
      projectName: projectInfo.name,
      ...(options.specPath && { sourceSpec: options.specPath })
    };
    
    return {
      ...frontmatter,
      metadata: metadata  // Nested under metadata object
    };
  }

  // Unknown platform - return unchanged with no metadata
  return frontmatter;
}

/**
 * Get all field rules for inspection
 * @returns {Object} Complete FIELD_RULES object (deep copy)
 */
function getFieldRules() {
  return JSON.parse(JSON.stringify(FIELD_RULES));
}

/**
 * Check if a specific field is supported on a platform
 * @param {string} fieldName - Name of the field
 * @param {string} platform - Target platform
 * @returns {boolean} True if field is supported
 */
function supportsField(fieldName, platform) {
  const rule = FIELD_RULES[fieldName];
  if (!rule) return null; // Unknown field
  return rule[platform] === true;
}

module.exports = {
  transformFields,
  validateFieldSupport,
  addPlatformMetadata,
  getFieldRules,
  supportsField,
  FIELD_RULES
};
