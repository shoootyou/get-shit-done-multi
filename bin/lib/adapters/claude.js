/**
 * Claude CLI adapter module
 * Handles Claude CLI-specific directory structure and content transformation
 * 
 * @module adapters/claude
 */

const fs = require('fs');
const path = require('path');
const { getConfigPaths } = require('../paths');

/**
 * Get target installation directories for Claude CLI
 * 
 * @param {boolean} isGlobal - If true, returns global installation paths, else local (.claude/)
 * @returns {Object} Target directories with skills, agents, commands paths
 * @returns {string} return.skills - Skills directory path
 * @returns {string} return.agents - Agents directory path
 * @returns {string} return.commands - Commands directory path
 */
function getTargetDirs(isGlobal) {
  const { global, local } = getConfigPaths('claude');
  const basePath = isGlobal ? global : local;
  
  return {
    skills: path.join(basePath, 'get-shit-done'),
    agents: path.join(basePath, 'agents'),
    commands: path.join(basePath, 'commands', 'gsd')
  };
}

/**
 * Convert content for Claude CLI format
 * 
 * Claude CLI is the source format, so no conversion needed.
 * Content is used as-is.
 * 
 * @param {string} content - Content to convert
 * @param {string} type - Content type ('skill', 'agent', 'command')
 * @returns {string} Converted content (unchanged for Claude)
 */
function convertContent(content, type) {
  // Claude is source format - no conversion needed
  return content;
}

/**
 * Verify Claude CLI installation
 * 
 * Checks that all required files and directories exist:
 * - Skills directory with SKILL.md
 * - Agents directory with at least one .agent.md file
 * - Commands directory with at least one command file
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
  if (!fs.existsSync(dirs.commands)) {
    errors.push(`Commands directory missing: ${dirs.commands}`);
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
  
  // Check at least one command file exists
  if (fs.existsSync(dirs.commands)) {
    const commandFiles = fs.readdirSync(dirs.commands);
    if (commandFiles.length === 0) {
      errors.push(`No command files found in: ${dirs.commands}`);
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
