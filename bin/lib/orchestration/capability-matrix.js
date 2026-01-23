/**
 * Capability Matrix - Documents agent support across CLIs
 * Used to generate user-facing documentation showing which agents work on which CLIs
 * 
 * @module orchestration/capability-matrix
 */

/**
 * Capability Matrix Status (Phase 4 Gap Closure Complete):
 * 
 * ✅ Agent registry: All 11 agents registered
 * ✅ Agent invoker: CLI-agnostic invocation layer
 * ✅ Adapters: Real CLI command execution (not mocks)
 * ✅ Performance tracking: Sub-millisecond precision
 * ✅ Command integration: User-facing invoke-agent command
 * 
 * Level 'full' indicates infrastructure complete and CLI execution implemented.
 * Actual availability depends on CLI installation (claude-code, gh, codex).
 * Use /gsd-invoke-agent to test agent availability on your system.
 */

/**
 * Agent capability definitions across all three CLI platforms
 * Level values: 'full', 'partial', 'unsupported'
 */
const AGENT_CAPABILITIES = {
  'gsd-executor': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-planner': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-verifier': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-debugger': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-phase-researcher': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-plan-checker': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-codebase-mapper': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-project-researcher': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-research-synthesizer': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-roadmapper': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
  },
  'gsd-integration-checker': {
    claude: { level: 'full', notes: 'Real CLI execution via claude-code command (requires Claude CLI installed)' },
    copilot: { level: 'full', notes: 'Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)' },
    codex: { level: 'full', notes: 'Real CLI execution via codex skill command (requires Codex CLI installed)' }
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
      notes: 'Full /gsd-* command support via native slash command system' 
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
      notes: 'Use skills with $get-shit-done instead of /gsd-* commands' 
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
      notes: 'Use skills with $get-shit-done instead of /gsd-* commands' 
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
