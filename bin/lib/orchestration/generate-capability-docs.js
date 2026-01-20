/**
 * Documentation Generator - Creates markdown documentation from capability matrix
 * Auto-generates user-facing docs showing agent support across CLIs
 * 
 * @module orchestration/generate-capability-docs
 */

const { generateCapabilityMatrix, CLI_LIMITATIONS } = require('./capability-matrix');
const fs = require('fs').promises;

/**
 * Generate markdown documentation for agent capabilities
 * Creates comprehensive documentation with support matrix, detailed notes, and CLI limitations
 * 
 * @param {string} outputPath - Path to output markdown file (default: 'docs/agent-capabilities.md')
 * @returns {Promise<void>}
 * 
 * @example
 * await generateCapabilityDocs();
 * // Creates docs/agent-capabilities.md with full capability matrix
 */
async function generateCapabilityDocs(outputPath = 'docs/agent-capabilities.md') {
  const matrix = generateCapabilityMatrix();
  
  // Build markdown document with sections
  let markdown = `# Agent Capability Matrix

This document shows which GSD agents are supported on each CLI platform.

**Generated:** ${new Date().toISOString().split('T')[0]}

## Support Levels

- ✓ **Full Support**: All features work without limitations
- ⚠ **Partial Support**: Most features work with documented limitations
- ✗ **Unsupported**: Agent cannot be used on this CLI

## Agent Support Matrix

| Agent | Claude Code | GitHub Copilot CLI | Codex CLI |
|-------|-------------|-------------------|-----------|
`;

  // Add table rows for each agent
  matrix.forEach(row => {
    const claudeIcon = row.claude.icon;
    const copilotIcon = row.copilot.icon;
    const codexIcon = row.codex.icon;
    
    markdown += `| ${row.agent} | ${claudeIcon} | ${copilotIcon} | ${codexIcon} |\n`;
  });
  
  // Add detailed notes section
  markdown += `\n## Detailed Notes

Each agent's specific implementation details and notes per CLI:

`;
  
  matrix.forEach(row => {
    markdown += `### ${row.agent}\n\n`;
    markdown += `- **Claude Code**: ${row.claude.notes}\n`;
    markdown += `- **GitHub Copilot CLI**: ${row.copilot.notes}\n`;
    markdown += `- **Codex CLI**: ${row.codex.notes}\n\n`;
  });
  
  // Add CLI limitations section
  markdown += `## CLI-Specific Limitations

Platform constraints that affect GSD workflow execution:

`;
  
  Object.entries(CLI_LIMITATIONS).forEach(([cli, limitations]) => {
    const cliName = cli === 'claude' ? 'Claude Code' : 
                    cli === 'copilot' ? 'GitHub Copilot CLI' : 
                    'Codex CLI';
    
    markdown += `### ${cliName}\n\n`;
    
    Object.entries(limitations).forEach(([feature, info]) => {
      const icon = info.supported ? '✓' : '✗';
      const featureName = feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      markdown += `- ${icon} **${featureName}**: ${info.notes}\n`;
    });
    
    markdown += `\n`;
  });
  
  // Add footer
  markdown += `---

*This document is auto-generated from capability-matrix.js*  
*Last updated: ${new Date().toISOString()}*
`;
  
  // Ensure docs directory exists
  const path = require('path');
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  
  // Write markdown to file
  await fs.writeFile(outputPath, markdown, 'utf8');
  console.log(`✅ Generated capability documentation: ${outputPath}`);
}

module.exports = { generateCapabilityDocs };
