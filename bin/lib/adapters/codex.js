/**
 * Codex CLI adapter module
 * Handles Codex CLI-specific directory structure and content transformation
 * 
 * @module adapters/codex
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getConfigPaths } = require('../paths');
const { replaceClaudePaths } = require('./shared/path-rewriter');
const { agentToSkill } = require('./shared/format-converter');

/**
 * Get target installation directories for Codex CLI
 * 
 * Codex uses skills-based structure with unique characteristics:
 * - Skills in ~/.codex/skills/get-shit-done/ or .codex/skills/get-shit-done/
 * - Agents converted to skills in ~/.codex/skills/get-shit-done/agents/ or .codex/skills/get-shit-done/agents/
 * - Commands (prompts) ONLY for global: ~/.codex/prompts/gsd/ (null for local per research)
 * 
 * @param {boolean} isGlobal - If true, returns global installation paths, else local (.codex/)
 * @returns {Object} Target directories with skills, agents, commands paths
 * @returns {string} return.skills - Skills directory path
 * @returns {string} return.agents - Agents directory path (nested in skills)
 * @returns {string|null} return.commands - Commands directory path (null for local installations)
 */
function getTargetDirs(isGlobal) {
  const { global, local } = getConfigPaths('codex');
  const basePath = isGlobal ? global : local;
  
  const skillsPath = path.join(basePath, 'skills', 'get-shit-done');
  
  return {
    skills: skillsPath,
    agents: path.join(skillsPath, 'agents'), // Agents nested in skills for Codex
    commands: null // Commands embedded in skills, invoked with $get-shit-done
  };
}

/**
 * Convert content for Codex CLI format
 * 
 * Applies two transformations:
 * 1. Path replacement: Claude paths → Codex paths
 * 2. Format conversion: For agents, converts .agent.md to SKILL.md format
 * 
 * Path replacement:
 * - ~/.claude/get-shit-done/ → .codex/skills/get-shit-done/
 * - ~/.claude/agents/ → .github/agents/
 * 
 * Format conversion (agents only):
 * - Removes GitHub Copilot-specific 'target' field
 * - Adds skill document structure
 * 
 * @param {string} content - Content to convert
 * @param {string} type - Content type ('skill', 'agent', 'command')
 * @returns {string} Converted content with Codex paths and format
 */
function convertContent(content, type) {
  // Step 1: Replace Claude paths with Codex paths
  let converted = replaceClaudePaths(content, '.codex/skills/get-shit-done/', { isLocal: true });
  
  // Step 2: Replace command syntax for Codex
  // Claude: /gsd:command or /gsd:command arg
  // Codex: $get-shit-done command arg
  converted = converted.replace(/\/gsd:(\S+)/g, '$get-shit-done $1');
  converted = converted.replace(/`\/gsd:(\S+)`/g, '`$get-shit-done $1`');
  
  // Step 3: Replace CLI-specific references
  converted = converted.replace(/\bClaude Code\b/g, 'Codex CLI');
  converted = converted.replace(/\bLaunch Claude Code\b/g, 'Start Codex CLI');
  converted = converted.replace(/\brun Claude Code\b/g, 'use Codex CLI');
  
  // Step 4: Replace assistant references with generic terms
  // "Claude = builder" → "AI = builder"
  // "Claude handles" → "AI handles"
  // "Claude's discretion" → "AI's discretion"
  converted = converted.replace(/\bClaude = /g, 'AI = ');
  converted = converted.replace(/\bClaude handles\b/g, 'AI handles');
  converted = converted.replace(/\bClaude's discretion\b/gi, "AI's discretion");
  converted = converted.replace(/\bClaude's Discretion\b/g, "AI's Discretion");
  converted = converted.replace(/\bcaptures Claude discretion\b/g, "captures AI discretion");
  
  // Step 5: For agents, apply format conversion
  if (type === 'agent') {
    // Extract agent name from content or use default
    const nameMatch = converted.match(/name:\s*(.+)/);
    const agentName = nameMatch ? nameMatch[1].trim() : 'Agent';
    
    converted = agentToSkill(converted, agentName);
  }
  
  return converted;
}

/**
 * Verify Codex CLI installation
 * 
 * Checks that all required files and directories exist:
 * - Skills directory with SKILL.md
 * - Agents directory with subfolder structure (each agent gets folder)
 * - Commands directory (if global) with at least one prompt file
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
  
  // Check agents directory has subfolder structure
  if (fs.existsSync(dirs.agents)) {
    const agentDirs = fs.readdirSync(dirs.agents, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    if (agentDirs.length === 0) {
      errors.push(`No agent subdirectories found in: ${dirs.agents}`);
    }
  }
  
  // Check commands directory (only if global)
  if (dirs.commands !== null) {
    if (!fs.existsSync(dirs.commands)) {
      errors.push(`Commands directory missing: ${dirs.commands}`);
    } else {
      const commandFiles = fs.readdirSync(dirs.commands);
      if (commandFiles.length === 0) {
        errors.push(`No command files found in: ${dirs.commands}`);
      }
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
