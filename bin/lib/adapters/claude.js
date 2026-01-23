/**
 * Claude CLI adapter module
 * Handles Claude CLI-specific directory structure and content transformation
 * 
 * @module adapters/claude
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { getConfigPaths } = require('../paths');

const execFileAsync = promisify(execFile);

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
    skills: path.join(basePath, 'skills'),
    agents: path.join(basePath, 'agents'),
    gsd: path.join(basePath, 'get-shit-done'), // workflows, templates, references
    commands: null // Commands removed - embedded in skills
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
  
  // Claude doesn't use SKILL.md (that's for Copilot/Codex only)
  // Check for workflows directory instead (core GSD content)
  const workflowsDir = path.join(dirs.skills, 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    errors.push(`Workflows directory missing: ${workflowsDir}`);
  }
  
  // Check at least one agent file exists (Claude uses .md not .agent.md)
  if (fs.existsSync(dirs.agents)) {
    const agentFiles = fs.readdirSync(dirs.agents).filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
    if (agentFiles.length === 0) {
      errors.push(`No GSD agent files found in: ${dirs.agents}`);
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

/**
 * Invoke an agent on Claude Code CLI
 * 
 * Claude Code supports native .agent.md format with agent invocation.
 * Agent files are in global config or project directories.
 * 
 * @param {Object} agent - Agent metadata from AgentRegistry
 * @param {string} prompt - Prompt to send to agent
 * @param {Object} options - Additional options (description, model, etc.)
 * @returns {Promise<Object>} Structured result with success, cli, agent, result, duration
 */
async function invokeAgent(agent, prompt, options = {}) {
  try {
    // Construct CLI command
    // Note: Exact command TBD based on Claude CLI docs - may be `claude-code agent invoke` or similar
    // For now, use placeholder that will be updated during testing
    const { stdout, stderr } = await execFileAsync('claude-code', [
      'agent', 'invoke', agent.name,
      '--prompt', prompt
    ]);
    
    return {
      success: true,
      cli: 'claude',
      agent: agent.name,
      result: stdout.trim(),
      duration: 0 // Will be tracked by PerformanceTracker in agent-invoker
    };
  } catch (error) {
    return {
      success: false,
      cli: 'claude',
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
