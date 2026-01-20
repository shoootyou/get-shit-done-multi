#!/usr/bin/env node
/**
 * Capability Matrix Data Generator
 * 
 * Generates docs/capability-data.json for interactive matrix UI.
 * Transforms capability-matrix.js data into JSON format for programmatic use.
 * Zero npm dependencies - uses only Node.js built-ins.
 * 
 * @module generate-matrix
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Transform capability to JSON format
 * 
 * @param {string} agentName - Agent name (e.g., 'gsd-executor')
 * @param {string} cliName - CLI name ('claude', 'copilot', 'codex')
 * @param {Object} capability - Capability object with level and notes
 * @returns {Object} JSON-formatted capability entry
 */
function transformCapabilityToJSON(agentName, cliName, capability) {
  return {
    feature: agentName,
    category: 'agents',
    cli: cliName,
    level: capability.level,
    notes: capability.notes || ''
  };
}

/**
 * Add metadata to generated data
 * 
 * @param {Array} data - Capability data array
 * @returns {Object} Data with metadata
 */
function addMetadata(data) {
  return {
    _meta: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      source: 'bin/lib/orchestration/capability-matrix.js',
      generator: 'bin/doc-generator/generate-matrix.js'
    },
    capabilities: data
  };
}

/**
 * Generate capability matrix data as JSON
 * 
 * @param {string} outputPath - Path to write docs/capability-data.json
 */
async function generateMatrixData(outputPath) {
  try {
    // Load capability matrix
    const matrixPath = path.join(__dirname, '../lib/orchestration/capability-matrix.js');
    const { AGENT_CAPABILITIES, CLI_LIMITATIONS } = require(matrixPath);
    
    const data = [];
    
    // Transform agent capabilities
    for (const [agentName, cliCapabilities] of Object.entries(AGENT_CAPABILITIES)) {
      const entry = {
        feature: agentName,
        category: 'agents',
        claude: cliCapabilities.claude.level,
        copilot: cliCapabilities.copilot.level,
        codex: cliCapabilities.codex.level,
        notes: {
          claude: cliCapabilities.claude.notes || '',
          copilot: cliCapabilities.copilot.notes || '',
          codex: cliCapabilities.codex.notes || ''
        }
      };
      data.push(entry);
    }
    
    // Add state management features (extracted from limitations)
    const stateFeatures = [
      {
        feature: 'slash_commands',
        category: 'commands',
        claude: CLI_LIMITATIONS.claude.slash_commands.supported ? 'full' : 'unsupported',
        copilot: CLI_LIMITATIONS.copilot.slash_commands.supported ? 'full' : 'unsupported',
        codex: CLI_LIMITATIONS.codex.slash_commands.supported ? 'full' : 'unsupported',
        notes: {
          claude: CLI_LIMITATIONS.claude.slash_commands.notes,
          copilot: CLI_LIMITATIONS.copilot.slash_commands.notes,
          codex: CLI_LIMITATIONS.codex.slash_commands.notes
        }
      },
      {
        feature: 'custom_agents',
        category: 'state',
        claude: CLI_LIMITATIONS.claude.custom_agents.supported ? 'full' : 'unsupported',
        copilot: CLI_LIMITATIONS.copilot.custom_agents.supported ? 'full' : 'unsupported',
        codex: CLI_LIMITATIONS.codex.custom_agents.supported ? 'full' : 'unsupported',
        notes: {
          claude: CLI_LIMITATIONS.claude.custom_agents.notes,
          copilot: CLI_LIMITATIONS.copilot.custom_agents.notes,
          codex: CLI_LIMITATIONS.codex.custom_agents.notes
        }
      },
      {
        feature: 'parallel_agents',
        category: 'state',
        claude: CLI_LIMITATIONS.claude.parallel_agents.supported ? 'full' : 'unsupported',
        copilot: CLI_LIMITATIONS.copilot.parallel_agents.supported ? 'full' : 'unsupported',
        codex: CLI_LIMITATIONS.codex.parallel_agents.supported ? 'full' : 'unsupported',
        notes: {
          claude: CLI_LIMITATIONS.claude.parallel_agents.notes,
          copilot: CLI_LIMITATIONS.copilot.parallel_agents.notes,
          codex: CLI_LIMITATIONS.codex.parallel_agents.notes
        }
      }
    ];
    
    data.push(...stateFeatures);
    
    // Add metadata
    const output = addMetadata(data);
    
    // Write to file
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`✓ Generated ${outputPath}`);
    console.log(`  - ${data.length} capability entries`);
    console.log(`  - Categories: agents, commands, state`);
    console.log(`  - Timestamp: ${output._meta.generated}`);
    
  } catch (error) {
    console.error('Error generating matrix data:', error.message);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const outputPath = path.join(__dirname, '../../docs/capability-data.json');
  
  generateMatrixData(outputPath)
    .then(() => {
      console.log('\n✅ Capability matrix data generation complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Generation failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  generateMatrixData,
  transformCapabilityToJSON,
  addMetadata
};
