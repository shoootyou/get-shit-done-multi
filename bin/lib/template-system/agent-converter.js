/**
 * Agent-to-Spec Converter
 * 
 * Converts existing agent files to spec-as-template format with platform conditionals.
 * Preserves all original content while adding template variables for platform differences.
 */

const fs = require('fs');
const matter = require('gray-matter');
const { parseSpecString } = require('./spec-parser');

/**
 * Claude-specific tools that need conditional wrapping
 */
const CLAUDE_SPECIFIC_TOOLS = [
  'WebFetch',
  'mcp__context7__*',
  'mcp__context7_search_code',
  'mcp__context7_search_repos', 
  'mcp__context7_search_prs',
  'mcp__context7_search_issues',
  'mcp__context7_search_users',
  'mcp__context7_read_issue',
  'mcp__context7_read_pr',
  'mcp__context7_get_commit',
  'mcp__context7_get_file',
  'mcp__context7_list_commits'
];

/**
 * Tools available on both platforms (case-insensitive on Copilot)
 */
const SHARED_TOOLS = [
  'Bash',
  'Read', 
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Create'
];

/**
 * Claude-only frontmatter fields
 */
const CLAUDE_ONLY_FIELDS = [
  'model',
  'hooks',
  'skills'
];

/**
 * Convert an agent file to spec-as-template format
 * 
 * @param {string} agentPath - Path to agent .md file or raw content
 * @param {object} options - Conversion options
 * @returns {object} {success: boolean, spec: string, warnings: [], errors: []}
 */
function convertAgentToSpec(agentPath, options = {}) {
  const warnings = [];
  const errors = [];
  
  try {
    // Read agent content (either from file or passed as string)
    let agentContent;
    if (fs.existsSync(agentPath)) {
      agentContent = fs.readFileSync(agentPath, 'utf8');
    } else {
      // Treat as raw content
      agentContent = agentPath;
    }
    
    // Parse frontmatter and body
    const parsed = matter(agentContent);
    const { data: frontmatter, content: body } = parsed;
    
    if (!frontmatter || Object.keys(frontmatter).length === 0) {
      warnings.push('No frontmatter found - agent may not have metadata');
    }
    
    // Convert frontmatter to template format
    const templateFrontmatter = convertFrontmatter(frontmatter, warnings);
    
    // Reconstruct spec with template variables
    const spec = assembleSpec(templateFrontmatter, body);
    
    // NOTE: We don't validate the spec here because it contains template variables
    // (e.g., {{#isClaude}}) which aren't valid YAML. Validation happens after
    // template rendering during agent generation.
    
    return {
      success: true,
      spec,
      warnings,
      errors: []
    };
    
  } catch (error) {
    errors.push(`Conversion failed: ${error.message}`);
    return {
      success: false,
      spec: null,
      warnings,
      errors
    };
  }
}

/**
 * Convert frontmatter to template format with platform conditionals
 * 
 * @param {object} frontmatter - Original frontmatter object
 * @param {array} warnings - Array to collect warnings
 * @returns {array} Lines of template frontmatter
 */
function convertFrontmatter(frontmatter, warnings) {
  const lines = [];
  
  // Always include shared fields first
  const sharedFields = ['name', 'description', 'color'];
  for (const field of sharedFields) {
    if (frontmatter[field]) {
      lines.push(`${field}: ${formatValue(frontmatter[field])}`);
    }
  }
  
  // Handle tools field with platform conditionals
  if (frontmatter.tools) {
    const toolsResult = convertTools(frontmatter.tools);
    lines.push('');
    lines.push('{{#isClaude}}');
    lines.push(`tools: [${toolsResult.claudeTools.join(', ')}]`);
    lines.push('{{/isClaude}}');
    lines.push('{{#isCopilot}}');
    lines.push(`tools: [${toolsResult.copilotTools.join(', ')}]`);
    lines.push('{{/isCopilot}}');
    
    if (toolsResult.warnings.length > 0) {
      warnings.push(...toolsResult.warnings);
    }
  }
  
  // Handle Claude-only fields
  const claudeOnlyPresent = CLAUDE_ONLY_FIELDS.filter(f => frontmatter[f]);
  if (claudeOnlyPresent.length > 0) {
    lines.push('');
    lines.push('{{#isClaude}}');
    for (const field of claudeOnlyPresent) {
      lines.push(`${field}: ${formatValue(frontmatter[field])}`);
    }
    lines.push('{{/isClaude}}');
  }
  
  // Handle any other fields (preserve but warn)
  const handledFields = [...sharedFields, 'tools', ...CLAUDE_ONLY_FIELDS];
  const otherFields = Object.keys(frontmatter).filter(f => !handledFields.includes(f));
  if (otherFields.length > 0) {
    for (const field of otherFields) {
      lines.push(`${field}: ${formatValue(frontmatter[field])}`);
      warnings.push(`Unknown field '${field}' preserved without platform conditional`);
    }
  }
  
  return lines;
}

/**
 * Convert tools list to platform-specific versions
 * 
 * @param {string|array} tools - Tools field value
 * @returns {object} {claudeTools: [], copilotTools: [], warnings: []}
 */
function convertTools(tools) {
  const warnings = [];
  
  // Parse tools (can be string or array)
  let toolList = [];
  if (typeof tools === 'string') {
    // Parse comma-separated string or array-like string
    const cleaned = tools.replace(/[\[\]]/g, '').trim();
    toolList = cleaned.split(',').map(t => t.trim()).filter(t => t);
  } else if (Array.isArray(tools)) {
    toolList = tools;
  } else {
    warnings.push('Tools field has unexpected format');
    return { claudeTools: [], copilotTools: [], warnings };
  }
  
  // Separate into shared and Claude-specific
  const claudeTools = [];
  const sharedForCopilot = [];
  
  for (const tool of toolList) {
    if (isClaudeSpecificTool(tool)) {
      claudeTools.push(tool);
    } else if (isSharedTool(tool)) {
      claudeTools.push(tool);
      // Copilot uses lowercase
      sharedForCopilot.push(tool.toLowerCase());
    } else {
      warnings.push(`Unknown tool '${tool}' - assuming Claude-specific`);
      claudeTools.push(tool);
    }
  }
  
  return {
    claudeTools,
    copilotTools: sharedForCopilot,
    warnings
  };
}

/**
 * Check if tool is Claude-specific
 */
function isClaudeSpecificTool(tool) {
  return CLAUDE_SPECIFIC_TOOLS.some(ct => {
    if (ct.endsWith('*')) {
      return tool.startsWith(ct.slice(0, -1));
    }
    return tool === ct;
  });
}

/**
 * Check if tool is shared across platforms
 */
function isSharedTool(tool) {
  return SHARED_TOOLS.some(st => st.toLowerCase() === tool.toLowerCase());
}

/**
 * Format a value for YAML frontmatter
 */
function formatValue(value) {
  if (typeof value === 'string') {
    // Quote if contains special characters
    if (value.includes(':') || value.includes('#') || value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Assemble final spec from template frontmatter and body
 */
function assembleSpec(frontmatterLines, body) {
  const parts = [];
  
  parts.push('---');
  parts.push(...frontmatterLines);
  parts.push('---');
  parts.push('');
  parts.push(body.trim());
  parts.push('');
  
  return parts.join('\n');
}

/**
 * Extract platform-specific variables from agent content
 * (for analysis/debugging purposes)
 * 
 * @param {string} agentContent - Raw agent content
 * @returns {object} Analysis of platform-specific content
 */
function extractPlatformVariables(agentContent) {
  const parsed = matter(agentContent);
  const { data: frontmatter } = parsed;
  
  const analysis = {
    claudeOnlyTools: [],
    sharedTools: [],
    claudeOnlyFields: [],
    unknownTools: [],
    unknownFields: []
  };
  
  // Analyze tools
  if (frontmatter.tools) {
    const toolsResult = convertTools(frontmatter.tools);
    analysis.claudeOnlyTools = toolsResult.claudeTools.filter(t => !isSharedTool(t));
    analysis.sharedTools = toolsResult.claudeTools.filter(t => isSharedTool(t));
  }
  
  // Analyze fields
  const knownFields = ['name', 'description', 'color', 'tools', ...CLAUDE_ONLY_FIELDS];
  for (const field of Object.keys(frontmatter)) {
    if (CLAUDE_ONLY_FIELDS.includes(field)) {
      analysis.claudeOnlyFields.push(field);
    } else if (!knownFields.includes(field)) {
      analysis.unknownFields.push(field);
    }
  }
  
  return analysis;
}

/**
 * Wrap content with platform conditionals
 * (helper for manual template creation)
 * 
 * @param {string} content - Content to wrap
 * @param {string} platform - 'claude' or 'copilot'
 * @returns {string} Wrapped content
 */
function wrapWithConditionals(content, platform) {
  const platformKey = platform.toLowerCase() === 'claude' ? 'isClaude' : 'isCopilot';
  return `{{#${platformKey}}}\n${content}\n{{/${platformKey}}}`;
}

module.exports = {
  convertAgentToSpec,
  extractPlatformVariables,
  wrapWithConditionals,
  // Export for testing
  convertTools,
  isClaudeSpecificTool,
  isSharedTool
};
