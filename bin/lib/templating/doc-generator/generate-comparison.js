#!/usr/bin/env node
/**
 * CLI Comparison Generator
 * 
 * Generates docs/cli-comparison.md from capability-matrix.js data.
 * Shows feature availability across Claude Code, Copilot CLI, and Codex CLI.
 * Zero npm dependencies - uses only Node.js built-ins.
 * 
 * @module generate-comparison
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Format support level with icon and notes
 * 
 * @param {string} level - 'full', 'partial', or 'unsupported'
 * @param {string} notes - Additional notes about support
 * @returns {string} Formatted cell content
 */
function formatSupportLevel(level, notes) {
  const icons = {
    full: '✓',
    partial: '⚠',
    unsupported: '✗'
  };
  
  const labels = {
    full: 'Full support',
    partial: 'Partial support',
    unsupported: 'Not supported'
  };
  
  const icon = icons[level] || '?';
  const label = labels[level] || 'Unknown';
  
  if (notes && notes.length > 0) {
    return `${icon} ${label}<br/><small>${notes}</small>`;
  }
  
  return `${icon} ${label}`;
}

/**
 * Generate legend section explaining icons and support levels
 * 
 * @returns {string} Markdown legend section
 */
function generateLegend() {
  return `
## Legend

| Icon | Meaning | Description |
|------|---------|-------------|
| ✓ | Full support | Feature fully implemented and tested |
| ⚠ | Partial support | Feature available with limitations |
| ✗ | Not supported | Feature not available on this CLI |

**Note:** All agents require the respective CLI to be installed on your system:
- **Claude Code:** \`claude-code\` command must be available
- **Copilot CLI:** \`gh\` command with \`copilot\` extension installed
- **Codex CLI:** \`codex\` command must be available
`;
}

/**
 * Generate CLI comparison table from capability matrix
 * 
 * @param {string} outputPath - Path to write docs/cli-comparison.md
 */
async function generateComparison(outputPath) {
  try {
    // Load capability matrix data
    const matrixPath = path.join(__dirname, '../../orchestration/capability-matrix.js');
    const { AGENT_CAPABILITIES, CLI_LIMITATIONS, generateCapabilityMatrix } = require(matrixPath);
    
    const matrix = generateCapabilityMatrix();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    
    // Build markdown content
    let md = `# CLI Comparison Matrix\n\n`;
    md += `**Last generated:** ${timestamp}\n\n`;
    md += `This document compares GSD (Get Shit Done) feature availability across Claude Code, GitHub Copilot CLI, and Codex CLI.\n\n`;
    md += `All features are implemented in the GSD codebase. Availability depends on CLI installation.\n\n`;
    
    // Agent Availability Table
    md += `## Agent Availability\n\n`;
    md += `The following custom agents are available in the GSD workflow:\n\n`;
    md += `| Agent | Claude Code | Copilot CLI | Codex CLI |\n`;
    md += `|-------|-------------|-------------|------------|\n`;
    
    for (const row of matrix) {
      const agent = row.agent;
      const claude = formatSupportLevel(row.claude.level, '');
      const copilot = formatSupportLevel(row.copilot.level, '');
      const codex = formatSupportLevel(row.codex.level, '');
      
      md += `| ${agent} | ${claude} | ${copilot} | ${codex} |\n`;
    }
    
    md += `\n`;
    
    // CLI Limitations
    md += `## CLI-Specific Limitations\n\n`;
    
    const clis = ['claude', 'copilot', 'codex'];
    const cliNames = {
      claude: 'Claude Code',
      copilot: 'Copilot CLI',
      codex: 'Codex CLI'
    };
    
    for (const cli of clis) {
      md += `### ${cliNames[cli]}\n\n`;
      
      const limitations = CLI_LIMITATIONS[cli];
      for (const [feature, data] of Object.entries(limitations)) {
        const icon = data.supported ? '✓' : '✗';
        const status = data.supported ? 'Supported' : 'Not Supported';
        md += `- **${feature}**: ${icon} ${status}\n`;
        if (data.notes) {
          md += `  - ${data.notes}\n`;
        }
      }
      md += `\n`;
    }
    
    // Add legend
    md += generateLegend();
    
    // Installation Requirements
    md += `## Installation Requirements\n\n`;
    md += `To use GSD with a specific CLI, you must have that CLI installed:\n\n`;
    md += `### Claude Code\n`;
    md += `\`\`\`bash\n`;
    md += `# Verify installation\n`;
    md += `claude-code --version\n`;
    md += `\`\`\`\n\n`;
    
    md += `### Copilot CLI\n`;
    md += `\`\`\`bash\n`;
    md += `# Install GitHub CLI\n`;
    md += `# See: https://cli.github.com/\n\n`;
    md += `# Install Copilot extension\n`;
    md += `gh extension install github/gh-copilot\n\n`;
    md += `# Verify installation\n`;
    md += `gh copilot --version\n`;
    md += `\`\`\`\n\n`;
    
    md += `### Codex CLI\n`;
    md += `\`\`\`bash\n`;
    md += `# Install via npm\n`;
    md += `npm install -g @openai/codex-cli\n\n`;
    md += `# Verify installation\n`;
    md += `codex --version\n`;
    md += `\`\`\`\n\n`;
    
    // Footer
    md += `---\n\n`;
    md += `*This document is auto-generated from \`bin/lib/orchestration/capability-matrix.js\`*\n`;
    md += `*Run \`node bin/doc-generator/generate-comparison.js\` to regenerate*\n`;
    
    // Write to file
    await fs.writeFile(outputPath, md, 'utf-8');
    console.log(`✓ Generated ${outputPath}`);
    console.log(`  - ${matrix.length} agents documented`);
    console.log(`  - ${clis.length} CLIs compared`);
    console.log(`  - Timestamp: ${timestamp}`);
    
  } catch (error) {
    console.error('Error generating comparison:', error.message);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const outputPath = path.join(__dirname, '../../../../docs/cli-comparison.md');
  
  generateComparison(outputPath)
    .then(() => {
      console.log('\n✅ CLI comparison generation complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Generation failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  generateComparison,
  formatSupportLevel,
  generateLegend
};
