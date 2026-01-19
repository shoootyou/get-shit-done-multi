/**
 * Capability Matrix - Documents agent support across CLIs
 * Used to generate user-facing documentation showing which agents work on which CLIs
 * 
 * @module orchestration/capability-matrix
 */

/**
 * Agent capability definitions across all three CLI platforms
 * Level values: 'full', 'partial', 'unsupported'
 */
const AGENT_CAPABILITIES = {
  'gsd-executor': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-planner': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-verifier': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-debugger': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-phase-researcher': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-plan-checker': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-codebase-mapper': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-project-researcher': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-research-synthesizer': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-roadmapper': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-integration-checker': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  }
};

/**
 * CLI-specific limitations and workarounds
 * Documents platform constraints that affect GSD workflow execution
 */
const CLI_LIMITATIONS = {
  claude: {
    slash_commands: { 
      supported: true, 
      notes: 'Full /gsd:* command support via native slash command system' 
    },
    custom_agents: { 
      supported: true, 
      notes: 'Native .agent.md format in .agent/ directories' 
    },
    parallel_agents: { 
      supported: true, 
      notes: 'No limitations on concurrent agent invocation' 
    }
  },
  copilot: {
    slash_commands: { 
      supported: false, 
      notes: 'Use skills with $get-shit-done instead of /gsd:* commands' 
    },
    custom_agents: { 
      supported: true, 
      notes: 'Custom agent definitions in .github/agents/' 
    },
    parallel_agents: { 
      supported: true, 
      notes: 'No limitations on concurrent agent invocation' 
    }
  },
  codex: {
    slash_commands: { 
      supported: false, 
      notes: 'Use skills with $get-shit-done instead of /gsd:* commands' 
    },
    custom_agents: { 
      supported: true, 
      notes: 'Skill-based approach in .codex/skills/' 
    },
    parallel_agents: { 
      supported: true, 
      notes: 'No limitations on concurrent agent invocation' 
    }
  }
};

/**
 * Generate capability matrix for documentation
 * Returns structured array with agent support across all CLIs
 * 
 * @returns {Array<Object>} Array of agent capability objects
 * @example
 * [
 *   {
 *     agent: 'gsd-executor',
 *     claude: { level: 'full', icon: '✓', notes: '...' },
 *     copilot: { level: 'full', icon: '✓', notes: '...' },
 *     codex: { level: 'full', icon: '✓', notes: '...' }
 *   },
 *   ...
 * ]
 */
function generateCapabilityMatrix() {
  const agents = Object.keys(AGENT_CAPABILITIES);
  const clis = ['claude', 'copilot', 'codex'];
  
  const matrix = agents.map(agent => {
    const row = { agent };
    
    clis.forEach(cli => {
      const cap = AGENT_CAPABILITIES[agent][cli];
      row[cli] = {
        level: cap.level,
        icon: cap.level === 'full' ? '✓' : (cap.level === 'partial' ? '⚠' : '✗'),
        notes: cap.notes
      };
    });
    
    return row;
  });
  
  return matrix;
}

module.exports = { 
  AGENT_CAPABILITIES, 
  CLI_LIMITATIONS,
  generateCapabilityMatrix 
};
