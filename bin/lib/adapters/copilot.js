/**
 * GitHub Copilot CLI adapter module
 * Handles Copilot CLI-specific directory structure and content transformation
 * 
 * @module adapters/copilot
 */

const fs = require('fs');
const path = require('path');
const { getConfigPaths } = require('../paths');
const { replaceClaudePaths } = require('./shared/path-rewriter');

/**
 * Get target installation directories for Copilot CLI
 * 
 * Copilot uses skills-based structure:
 * - Skills in ~/.copilot/skills/get-shit-done/ or .github/skills/get-shit-done/
 * - Agents in ~/.copilot/agents/ or .github/agents/
 * - Commands embedded in skills (no separate commands directory)
 * 
 * @param {boolean} isGlobal - If true, returns global installation paths, else local (.github/)
 * @returns {Object} Target directories with skills, agents, commands paths
 * @returns {string} return.skills - Skills directory path
 * @returns {string} return.agents - Agents directory path
 * @returns {string|null} return.commands - Commands directory path (null for Copilot)
 */
function getTargetDirs(isGlobal) {
  const { globalConfigPath, localConfigPath } = getConfigPaths('copilot');
  const basePath = isGlobal ? globalConfigPath : localConfigPath;
  
  return {
    skills: path.join(basePath, 'skills', 'get-shit-done'),
    agents: path.join(basePath, 'agents'),
    commands: null // Copilot embeds commands in skills
  };
}

/**
 * Convert content for Copilot CLI format
 * 
 * Replaces Claude CLI paths with Copilot CLI paths:
 * - ~/.claude/get-shit-done/ → .github/skills/get-shit-done/ (local) or ~/.copilot/skills/get-shit-done/ (global)
 * - ~/.claude/agents/ → .github/agents/ (local) or ~/.copilot/agents/ (global)
 * - Commands path embedded in skills
 * 
 * @param {string} content - Content to convert
 * @param {string} type - Content type ('skill', 'agent', 'command')
 * @returns {string} Converted content with Copilot paths
 */
function convertContent(content, type) {
  // Replace Claude paths with Copilot paths
  return replaceClaudePaths(content, '.github/skills/get-shit-done/', { isLocal: true });
}

/**
 * Verify Copilot CLI installation
 * 
 * Checks that all required files and directories exist:
 * - Skills directory with SKILL.md
 * - Agents directory with at least one .agent.md file
 * 
 * @param {Object} dirs - Target directories from getTargetDirs()
 * @returns {Object} Verification result
 * @returns {boolean} return.success - True if all checks pass
 * @returns {string[]} return.errors - Array of error messages (empty if success)
 */
function verify(dirs) {
  const errors = [];
  
  // Check directories exist
  if (!fs.existsSync(dirs.skills)) {
    errors.push(`Skills directory missing: ${dirs.skills}`);
  }
  if (!fs.existsSync(dirs.agents)) {
    errors.push(`Agents directory missing: ${dirs.agents}`);
  }
  
  // Check SKILL.md exists
  const skillFile = path.join(dirs.skills, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    errors.push(`SKILL.md missing: ${skillFile}`);
  }
  
  // Check at least one agent file exists
  if (fs.existsSync(dirs.agents)) {
    const agentFiles = fs.readdirSync(dirs.agents).filter(f => f.endsWith('.agent.md'));
    if (agentFiles.length === 0) {
      errors.push(`No .agent.md files found in: ${dirs.agents}`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}

module.exports = {
  getTargetDirs,
  convertContent,
  verify
};
