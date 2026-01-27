// bin/lib/manifests/schema.js

/**
 * Single source of truth for manifest structure
 * All manifest fields defined here with requirements and defaults
 */

const FIELD_DEFINITIONS = {
  gsd_version: { 
    required: true, 
    default: null,
    description: 'GSD version that created this manifest (e.g., "2.0.0")'
  },
  platform: { 
    required: true, 
    default: null,
    description: 'Platform name (claude/copilot/codex)'
  },
  scope: { 
    required: true, 
    default: null,
    description: 'Installation scope (global/local)'
  },
  installed_at: { 
    required: true, 
    default: () => new Date().toISOString(),
    description: 'ISO timestamp of installation'
  },
  files: { 
    required: true, 
    default: () => [],
    description: 'Array of installed file paths (string array)'
  }
};

/**
 * Create manifest object from partial data
 * Automatically fills in defaults for missing fields
 * 
 * @param {Object} data - Partial manifest data
 * @param {string} data.gsd_version - GSD version
 * @param {string} data.platform - Platform name
 * @param {string} data.scope - Installation scope
 * @param {string} [data.installed_at] - Installation timestamp (auto-generated if omitted)
 * @param {string[]} [data.files] - File list (defaults to empty array)
 * @returns {Object} Complete manifest object
 * 
 * @example
 * const manifest = createManifest({
 *   gsd_version: '2.0.0',
 *   platform: 'claude',
 *   scope: 'global',
 *   files: ['skill.md', 'agent.md']
 *   // installed_at auto-filled with current timestamp
 * });
 */
export function createManifest(data) {
  const manifest = {};
  
  for (const [field, definition] of Object.entries(FIELD_DEFINITIONS)) {
    // Use provided value if available
    if (data[field] !== undefined) {
      manifest[field] = data[field];
    } 
    // Otherwise use default (call if function, use directly if value)
    else if (typeof definition.default === 'function') {
      manifest[field] = definition.default();
    } else {
      manifest[field] = definition.default;
    }
  }
  
  return manifest;
}

/**
 * Validate manifest has all required fields
 * 
 * @param {Object} manifest - Manifest object to validate
 * @returns {Object} Validation result
 * @returns {boolean} result.valid - Whether manifest is valid
 * @returns {string[]} result.missing - Array of missing required field names
 * @returns {string[]} result.fields - Array of all required field names
 * 
 * @example
 * const result = validateManifest(manifest);
 * if (!result.valid) {
 *   console.error(`Missing fields: ${result.missing.join(', ')}`);
 * }
 */
export function validateManifest(manifest) {
  const requiredFields = Object.entries(FIELD_DEFINITIONS)
    .filter(([, definition]) => definition.required)
    .map(([field]) => field);
  
  const missing = requiredFields.filter(field => !manifest[field]);
  
  return {
    valid: missing.length === 0,
    missing,
    fields: requiredFields
  };
}

/**
 * Get list of all field names
 * Useful for iteration, testing, or documentation
 */
export const FIELDS = Object.keys(FIELD_DEFINITIONS);

/**
 * Get list of required field names
 * Useful for validation and documentation
 */
export const REQUIRED_FIELDS = Object.entries(FIELD_DEFINITIONS)
  .filter(([, def]) => def.required)
  .map(([field]) => field);

/**
 * Get field definitions for documentation or tooling
 * @returns {Object} Field definitions with metadata
 */
export function getFieldDefinitions() {
  return { ...FIELD_DEFINITIONS };
}
