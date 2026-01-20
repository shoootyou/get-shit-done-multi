/**
 * Agent Registry - Maps agent names to CLI-specific implementations
 * Follows enterprise pattern: dynamic discovery with capability metadata
 * 
 * @module orchestration/agent-registry
 */

const path = require('path');

/**
 * Registry for GSD specialized agents with CLI-specific metadata
 * Provides O(1) lookup and capability tracking across CLIs
 */
class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.capabilities = new Map();
    this._loadAgents();
  }

  /**
   * Load all 11 GSD agents with CLI-specific paths
   * @private
   */
  _loadAgents() {
    const agentNames = [
      'gsd-executor',
      'gsd-planner',
      'gsd-verifier',
      'gsd-debugger',
      'gsd-phase-researcher',
      'gsd-plan-checker',
      'gsd-codebase-mapper',
      'gsd-project-researcher',
      'gsd-research-synthesizer',
      'gsd-roadmapper',
      'gsd-integration-checker'
    ];

    agentNames.forEach(name => {
      // Agent source file (shared across all CLIs)
      const sourceFile = `${name}.md`;
      
      // CLI-specific implementations
      const agent = {
        name,
        source: path.join('.github', 'skills', 'get-shit-done', 'agents', sourceFile),
        
        // Claude Code: .agent.md files in global/local directories
        claude: {
          type: 'agent',
          path: path.join('agents', sourceFile)
        },
        
        // GitHub Copilot CLI: custom agent definitions
        copilot: {
          type: 'custom-agent',
          path: path.join('.github', 'agents', sourceFile)
        },
        
        // Codex CLI: skill-based approach
        codex: {
          type: 'skill',
          path: path.join('.codex', 'skills', sourceFile)
        }
      };
      
      this.agents.set(name, agent);
      
      // Set default capability to 'full' for all agents on all CLIs
      this.setCapability(name, 'claude', 'full');
      this.setCapability(name, 'copilot', 'full');
      this.setCapability(name, 'codex', 'full');
    });
  }

  /**
   * Get agent metadata for specified CLI
   * @param {string} agentName - Agent name (e.g., 'gsd-executor')
   * @param {string} cli - Target CLI ('claude', 'copilot', 'codex')
   * @returns {Object|null} Agent metadata with CLI-specific implementation, or null if not found
   */
  getAgent(agentName, cli) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return null;
    }
    
    // Get capability for this agent on this CLI
    const capabilityKey = `${agentName}:${cli}`;
    const capability = this.capabilities.get(capabilityKey) || 'unsupported';
    
    return {
      ...agent,
      capability
    };
  }

  /**
   * Set capability level for an agent on a specific CLI
   * @param {string} agentName - Agent name
   * @param {string} cli - Target CLI ('claude', 'copilot', 'codex')
   * @param {string} level - Capability level ('full', 'partial', 'unsupported')
   */
  setCapability(agentName, cli, level) {
    const validLevels = ['full', 'partial', 'unsupported'];
    if (!validLevels.includes(level)) {
      throw new Error(`Invalid capability level: ${level}. Must be one of: ${validLevels.join(', ')}`);
    }
    
    const capabilityKey = `${agentName}:${cli}`;
    this.capabilities.set(capabilityKey, level);
  }

  /**
   * Get capability matrix showing support across all CLIs
   * @returns {Array<Object>} Array of objects with agent name and capability per CLI
   */
  getCapabilityMatrix() {
    const matrix = [];
    
    for (const [agentName, _] of this.agents) {
      const row = {
        agent: agentName,
        claude: this.capabilities.get(`${agentName}:claude`) || 'unsupported',
        copilot: this.capabilities.get(`${agentName}:copilot`) || 'unsupported',
        codex: this.capabilities.get(`${agentName}:codex`) || 'unsupported'
      };
      matrix.push(row);
    }
    
    return matrix;
  }

  /**
   * Get all registered agent names
   * @returns {Array<string>} Array of agent names
   */
  getAgentNames() {
    return Array.from(this.agents.keys());
  }

  /**
   * Check if an agent is registered
   * @param {string} agentName - Agent name to check
   * @returns {boolean} True if agent exists in registry
   */
  hasAgent(agentName) {
    return this.agents.has(agentName);
  }
}

module.exports = { AgentRegistry };
