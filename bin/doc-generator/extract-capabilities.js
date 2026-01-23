#!/usr/bin/env node
/**
 * Capability Data Extractor
 * 
 * Extracts capability data from codebase and generates capability-data.json.
 * Aggregates agent capabilities, command availability, and state features.
 * Zero npm dependencies - uses only Node.js built-ins.
 * 
 * @module extract-capabilities
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Extract agent capabilities from capability-matrix.js
 * 
 * @returns {Array<Object>} Array of agent capability entries
 */
function extractAgentCapabilities() {
  const matrixPath = path.join(__dirname, '../lib/orchestration/capability-matrix.js');
  const { AGENT_CAPABILITIES } = require(matrixPath);
  
  const capabilities = [];
  
  for (const [agentName, cliCapabilities] of Object.entries(AGENT_CAPABILITIES)) {
    const entry = {
      feature: agentName,
      category: 'agents',
      description: getAgentDescription(agentName),
      claude: cliCapabilities.claude.level,
      copilot: cliCapabilities.copilot.level,
      codex: cliCapabilities.codex.level,
      notes: {
        claude: cliCapabilities.claude.notes || '',
        copilot: cliCapabilities.copilot.notes || '',
        codex: cliCapabilities.codex.notes || ''
      }
    };
    capabilities.push(entry);
  }
  
  return capabilities;
}

/**
 * Get human-readable description for agent
 * 
 * @param {string} agentName - Agent name (e.g., 'gsd-executor')
 * @returns {string} Description
 */
function getAgentDescription(agentName) {
  const descriptions = {
    'gsd-executor': 'Executes phase plans with atomic commits and deviation handling',
    'gsd-planner': 'Creates executable phase plans with task breakdown and dependencies',
    'gsd-verifier': 'Verifies phase goal achievement through goal-backward analysis',
    'gsd-debugger': 'Investigates bugs using scientific method and debug sessions',
    'gsd-phase-researcher': 'Researches implementation approaches before planning',
    'gsd-plan-checker': 'Verifies plans will achieve goals before execution',
    'gsd-codebase-mapper': 'Explores codebase and writes structured analysis documents',
    'gsd-project-researcher': 'Researches domain ecosystem before roadmap creation',
    'gsd-research-synthesizer': 'Synthesizes research outputs from parallel agents',
    'gsd-roadmapper': 'Creates project roadmaps with phase breakdown and requirements',
    'gsd-integration-checker': 'Verifies cross-phase integration and E2E flows'
  };
  return descriptions[agentName] || 'GSD workflow agent';
}

/**
 * Extract command capabilities from command system
 * 
 * @returns {Array<Object>} Array of command capability entries
 */
function extractCommandCapabilities() {
  const matrixPath = path.join(__dirname, '../lib/orchestration/capability-matrix.js');
  const { CLI_LIMITATIONS } = require(matrixPath);
  
  const capabilities = [];
  
  // Slash commands support
  capabilities.push({
    feature: '/gsd-* slash commands',
    category: 'commands',
    description: 'Native slash command syntax (e.g., /gsd-new-project)',
    claude: CLI_LIMITATIONS.claude.slash_commands.supported ? 'full' : 'unsupported',
    copilot: CLI_LIMITATIONS.copilot.slash_commands.supported ? 'full' : 'unsupported',
    codex: CLI_LIMITATIONS.codex.slash_commands.supported ? 'full' : 'unsupported',
    notes: {
      claude: CLI_LIMITATIONS.claude.slash_commands.notes,
      copilot: CLI_LIMITATIONS.copilot.slash_commands.notes,
      codex: CLI_LIMITATIONS.codex.slash_commands.notes
    }
  });
  
  // Extract available GSD commands from filesystem
  const commandsDir = path.join(__dirname, '../../commands/gsd');
  try {
    const commandFiles = require('fs').readdirSync(commandsDir)
      .filter(f => f.endsWith('.md'))
      .sort();
    
    for (const file of commandFiles) {
      const commandName = file.replace('.md', '');
      const filePath = path.join(commandsDir, file);
      const content = require('fs').readFileSync(filePath, 'utf-8');
      
      // Extract description from frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      let description = `GSD command: ${commandName}`;
      
      if (match) {
        const frontmatter = match[1];
        const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
        if (descMatch) {
          description = descMatch[1].trim().replace(/^["']|["']$/g, '');
        }
      }
      
      capabilities.push({
        feature: `/gsd-${commandName}`,
        category: 'commands',
        description: description,
        claude: 'full',
        copilot: 'full',
        codex: 'full',
        notes: {
          claude: 'Native skill support via .github/skills/',
          copilot: 'Skill-based via .github/skills/',
          codex: 'Skill-based via .codex/skills/'
        }
      });
    }
  } catch (error) {
    console.warn('Warning: Could not read command files:', error.message);
  }
  
  return capabilities;
}

/**
 * Extract state management capabilities
 * 
 * @returns {Array<Object>} Array of state feature entries
 */
function extractStateCapabilities() {
  const matrixPath = path.join(__dirname, '../lib/orchestration/capability-matrix.js');
  const { CLI_LIMITATIONS } = require(matrixPath);
  
  const capabilities = [];
  
  // Custom agents
  capabilities.push({
    feature: 'Custom agent definitions',
    category: 'state',
    description: 'Define project-specific agents for specialized workflows',
    claude: CLI_LIMITATIONS.claude.custom_agents.supported ? 'full' : 'unsupported',
    copilot: CLI_LIMITATIONS.copilot.custom_agents.supported ? 'full' : 'unsupported',
    codex: CLI_LIMITATIONS.codex.custom_agents.supported ? 'full' : 'unsupported',
    notes: {
      claude: CLI_LIMITATIONS.claude.custom_agents.notes,
      copilot: CLI_LIMITATIONS.copilot.custom_agents.notes,
      codex: CLI_LIMITATIONS.codex.custom_agents.notes
    }
  });
  
  // Parallel agents
  capabilities.push({
    feature: 'Parallel agent invocation',
    category: 'state',
    description: 'Run multiple agents concurrently for faster execution',
    claude: CLI_LIMITATIONS.claude.parallel_agents.supported ? 'full' : 'unsupported',
    copilot: CLI_LIMITATIONS.copilot.parallel_agents.supported ? 'full' : 'unsupported',
    codex: CLI_LIMITATIONS.codex.parallel_agents.supported ? 'full' : 'unsupported',
    notes: {
      claude: CLI_LIMITATIONS.claude.parallel_agents.notes,
      copilot: CLI_LIMITATIONS.copilot.parallel_agents.notes,
      codex: CLI_LIMITATIONS.codex.parallel_agents.notes
    }
  });
  
  // State persistence features
  const stateFeatures = [
    {
      feature: 'Atomic file operations',
      description: 'Write-then-rename for crash-safe state updates',
      supported: 'full'
    },
    {
      feature: 'Directory locking',
      description: 'Multi-process coordination for concurrent CLI usage',
      supported: 'full'
    },
    {
      feature: 'Session persistence',
      description: 'Save and restore work context across CLI sessions',
      supported: 'full'
    },
    {
      feature: 'CLI failover',
      description: 'Automatic fallback to alternate CLI if primary unavailable',
      supported: 'full'
    },
    {
      feature: 'Usage tracking',
      description: 'Track agent invocations and costs per CLI',
      supported: 'full'
    },
    {
      feature: 'State validation',
      description: 'Detect and repair corrupted planning state',
      supported: 'full'
    }
  ];
  
  for (const feature of stateFeatures) {
    capabilities.push({
      feature: feature.feature,
      category: 'state',
      description: feature.description,
      claude: feature.supported,
      copilot: feature.supported,
      codex: feature.supported,
      notes: {
        claude: 'Implemented in lib-ghcc/state-*.js modules',
        copilot: 'Implemented in lib-ghcc/state-*.js modules',
        codex: 'Implemented in lib-ghcc/state-*.js modules'
      }
    });
  }
  
  return capabilities;
}

/**
 * Aggregate capabilities by feature
 * Groups and formats all capability data
 * 
 * @param {Array<Object>} capabilities - Raw capability entries
 * @returns {Array<Object>} Aggregated and formatted capabilities
 */
function aggregateByFeature(capabilities) {
  // Capabilities are already in the correct format
  // Sort by category, then by feature name
  return capabilities.sort((a, b) => {
    if (a.category !== b.category) {
      const order = { agents: 0, commands: 1, state: 2 };
      return order[a.category] - order[b.category];
    }
    return a.feature.localeCompare(b.feature);
  });
}

/**
 * Main extractor - aggregates all capabilities
 * 
 * @param {string} sourcePath - Optional path override (for testing)
 * @returns {Array<Object>} Complete capability dataset
 */
function extractCapabilities(sourcePath = null) {
  const agents = extractAgentCapabilities();
  const commands = extractCommandCapabilities();
  const state = extractStateCapabilities();
  
  const allCapabilities = [...agents, ...commands, ...state];
  
  return aggregateByFeature(allCapabilities);
}

/**
 * Write capability data to JSON file
 * 
 * @param {string} outputPath - Path to write capability-data.json
 */
async function writeCapabilityData(outputPath) {
  try {
    const capabilities = extractCapabilities();
    
    const output = {
      _meta: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        source: 'bin/lib/orchestration/capability-matrix.js',
        generator: 'bin/doc-generator/extract-capabilities.js',
        featureCount: capabilities.length
      },
      capabilities
    };
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write JSON file
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`✓ Generated ${outputPath}`);
    console.log(`  - ${capabilities.length} capability entries`);
    
    // Count by category
    const byCategory = capabilities.reduce((acc, cap) => {
      acc[cap.category] = (acc[cap.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`  - Agents: ${byCategory.agents || 0}`);
    console.log(`  - Commands: ${byCategory.commands || 0}`);
    console.log(`  - State: ${byCategory.state || 0}`);
    console.log(`  - Timestamp: ${output._meta.generated}`);
    
    return output;
    
  } catch (error) {
    console.error('Error writing capability data:', error.message);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const outputPath = path.join(__dirname, '../../docs/capability-data.json');
  
  writeCapabilityData(outputPath)
    .then(() => {
      console.log('\n✅ Capability data extraction complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Extraction failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  extractCapabilities,
  extractAgentCapabilities,
  extractCommandCapabilities,
  extractStateCapabilities,
  aggregateByFeature,
  writeCapabilityData
};
