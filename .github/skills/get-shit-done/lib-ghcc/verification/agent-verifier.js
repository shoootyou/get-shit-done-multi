/**
 * Agent Verification Tests - Verify agent compatibility for current CLI
 * Loads capability matrix to check agent support levels
 * 
 * @module verification/agent-verifier
 */

const { DiagnosticTest } = require('./diagnostic-test');
const path = require('path');

/**
 * Test if a specific agent is supported in the current CLI
 * Uses capability matrix to determine support level
 */
class AgentCapabilityTest extends DiagnosticTest {
  /**
   * Create agent capability test
   * @param {string} agentName - Agent name (e.g., 'gsd-executor', 'gsd-planner')
   * @param {string} currentCLI - Current CLI name (e.g., 'claude', 'copilot', 'codex')
   */
  constructor(agentName, currentCLI = null) {
    super(
      `Agent: ${agentName}`,
      `Verify ${agentName} support in current CLI`
    );
    this.agentName = agentName;
    this.currentCLI = currentCLI;
  }
  
  async run() {
    try {
      // Detect current CLI if not provided
      const cli = this.currentCLI || this.detectCurrentCLI();
      
      // Load capability matrix
      const capabilityMatrix = this.loadCapabilityMatrix();
      
      if (!capabilityMatrix[this.agentName]) {
        return {
          status: 'fail',
          message: `Unknown agent: ${this.agentName}`,
          fixes: ['Check agent name spelling', 'See docs/agent-capabilities.md for valid agents']
        };
      }
      
      const agentCapability = capabilityMatrix[this.agentName][cli];
      
      if (!agentCapability) {
        return {
          status: 'fail',
          message: `No capability info for ${this.agentName} on ${cli}`,
          fixes: ['Report this issue - capability matrix incomplete']
        };
      }
      
      // Determine status based on support level
      const { level, notes } = agentCapability;
      
      if (level === 'full') {
        return {
          status: 'pass',
          message: `${this.agentName} fully supported on ${cli}`,
          fixes: []
        };
      } else if (level === 'partial') {
        return {
          status: 'warn',
          message: `${this.agentName} partially supported on ${cli}: ${notes}`,
          fixes: [
            'Some features may not work as expected',
            'Consider using a different CLI for full support',
            'See docs/agent-capabilities.md for details'
          ]
        };
      } else {
        // unsupported
        const otherCLIs = this.getAlternateCLIs(this.agentName, capabilityMatrix);
        const fixes = [`${this.agentName} not supported on ${cli}`];
        
        if (otherCLIs.length > 0) {
          fixes.push(`Try using: ${otherCLIs.join(' or ')}`);
        }
        fixes.push('See docs/agent-capabilities.md for compatibility matrix');
        
        return {
          status: 'fail',
          message: `${this.agentName} unsupported on ${cli}`,
          fixes
        };
      }
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Agent verification error: ${error.message}`,
        fixes: ['Check capability matrix exists in bin/lib/orchestration/capability-matrix.js']
      };
    }
  }
  
  /**
   * Detect current CLI using detect.js module
   * @returns {string} CLI identifier ('claude', 'copilot', 'codex')
   */
  detectCurrentCLI() {
    try {
      // Try to load detect module
      const detectPath = path.join(__dirname, '..', '..', 'bin', 'lib', 'detect.js');
      const { detectCLI } = require(detectPath);
      const detected = detectCLI();
      
      // Convert CLI name format (e.g., 'claude-code' -> 'claude')
      return detected.split('-')[0];
    } catch (error) {
      // Fallback to environment variable checks
      if (process.env.CLAUDE_CODE || process.env.CLAUDE_CLI) return 'claude';
      if (process.env.GITHUB_COPILOT_CLI || process.env.COPILOT_CLI) return 'copilot';
      if (process.env.CODEX_CLI) return 'codex';
      
      // Default to claude
      return 'claude';
    }
  }
  
  /**
   * Load capability matrix from orchestration module
   * @returns {object} AGENT_CAPABILITIES object
   */
  loadCapabilityMatrix() {
    try {
      const matrixPath = path.join(__dirname, '..', '..', 'bin', 'lib', 'orchestration', 'capability-matrix.js');
      
      // Use require to load CommonJS module
      const matrixModule = require(matrixPath);
      
      // Handle both named export and default export patterns
      return matrixModule.AGENT_CAPABILITIES || matrixModule.default?.AGENT_CAPABILITIES || {};
    } catch (error) {
      throw new Error(`Failed to load capability matrix: ${error.message}`);
    }
  }
  
  /**
   * Get list of CLIs that fully support this agent
   * @param {string} agentName - Agent name
   * @param {object} capabilityMatrix - Capability matrix object
   * @returns {string[]} Array of CLI names with full support
   */
  getAlternateCLIs(agentName, capabilityMatrix) {
    const agent = capabilityMatrix[agentName];
    if (!agent) return [];
    
    return ['claude', 'copilot', 'codex'].filter(cli => 
      agent[cli] && agent[cli].level === 'full'
    );
  }
}

module.exports = {
  AgentCapabilityTest
};
