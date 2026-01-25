/**
 * GitHub Copilot CLI adapter module
 * Handles Copilot CLI-specific directory structure and content transformation
 * 
 * @module adapters/copilot
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { getConfigPaths } = require('../configuration/paths');
const { replaceClaudePaths } = require('./shared/path-rewriter');

const execFileAsync = promisify(execFile);

/**
 * Get target installation directories for Copilot CLI
 * 
 * Copilot uses skills-based structure:
 * - Skills in ~/.copilot/skills/ (global) or .github/skills/ (local)
 * - Individual skills: .github/skills/gsd-help/, .github/skills/gsd-execute-phase/, etc.
 * - Legacy skill: .github/skills/get-shit-done/
 * - Agents in ~/.copilot/agents/ or .github/agents/
 * - Commands embedded in skills (no separate commands directory)
 * 
 * @param {string} scope - Installation scope: 'global' or 'local'
 * @param {string|null} [configDir=null] - Optional custom config directory
 * @returns {Object} Target directories with skills, agents, commands paths
 * @returns {string} return.skills - Skills directory path
 * @returns {string} return.agents - Agents directory path
 * @returns {string|null} return.commands - Commands directory path (null for Copilot)
 */
function getTargetDirs(scope, configDir = null) {
  const basePath = getConfigPaths('copilot', scope, configDir);
  
  return {
    skills: path.join(basePath, 'skills', 'get-shit-done'),
    agents: path.join(basePath, 'agents'),
    gsd: path.join(basePath, 'get-shit-done'), // workflows, templates, references
    commands: null // Copilot embeds commands in skills
  };
}

/**
 * Convert content for Copilot CLI format
 * 
 * Replaces Claude CLI paths with Copilot CLI paths:
 * - ~/.claude/get-shit-done/ → .github/skills/ (local) or ~/.copilot/skills/ (global)
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

/**
 * Invoke an agent on GitHub Copilot CLI
 * 
 * GitHub Copilot CLI uses custom agent definitions.
 * Agent files are in .github/agents/ or ~/.copilot/agents/.
 * 
 * @param {Object} agent - Agent metadata from AgentRegistry
 * @param {string} prompt - Prompt to send to agent
 * @param {Object} options - Additional options (description, model, etc.)
 * @returns {Promise<Object>} Structured result with success, cli, agent, result, duration
 */
async function invokeAgent(agent, prompt, options = {}) {
  try {
    // GitHub CLI with copilot extension
    // Command: gh copilot agent run {agentName} --prompt "{prompt}"
    const { stdout, stderr } = await execFileAsync('gh', [
      'copilot', 'agent', 'run', agent.name,
      '--prompt', prompt
    ]);
    
    return {
      success: true,
      cli: 'copilot',
      agent: agent.name,
      result: stdout.trim(),
      duration: 0
    };
  } catch (error) {
    return {
      success: false,
      cli: 'copilot',
      agent: agent.name,
      error: error.message,
      stderr: error.stderr || '',
      duration: 0
    };
  }
}

module.exports = {
  getTargetDirs,
  convertContent,
  verify,
  invokeAgent
};
