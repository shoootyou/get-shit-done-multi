/**
 * Format conversion utility for multi-CLI deployment
 * Converts GitHub Copilot agent format to Codex skill format
 * 
 * @module format-converter
 */

/**
 * Convert GitHub Copilot agent content to Codex skill format
 * 
 * Agent Skills specification is 90% compatible across CLIs.
 * Minimal conversion needed:
 * - Remove GitHub Copilot-specific 'target' field from frontmatter
 * - Preserve all other frontmatter fields (name, description, etc.)
 * - Preserve body content
 * - Add skill document structure (heading, description)
 * 
 * @param {string} agentContent - Content from .agent.md file
 * @param {string} agentName - Name of the agent (for heading)
 * @returns {string} Formatted SKILL.md content
 * 
 * @example
 * const agent = `---
 * name: TestAgent
 * target: copilot
 * description: Test agent
 * ---
 * Agent body content`;
 * 
 * const skill = agentToSkill(agent, 'TestAgent');
 * // Returns:
 * // ---
 * // name: TestAgent
 * // description: Test agent
 * // ---
 * //
 * // # TestAgent
 * //
 * // Test agent
 * //
 * // Agent body content
 */
function agentToSkill(agentContent, agentName) {
  // Parse YAML frontmatter
  const frontmatterMatch = agentContent.match(/^---\n([\s\S]+?)\n---/);
  
  if (!frontmatterMatch) {
    // No frontmatter, return content as-is with heading
    return `# ${agentName}\n\n${agentContent}`;
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = agentContent.slice(frontmatterMatch[0].length).trim();
  
  // Parse frontmatter fields
  const fields = {};
  const lines = frontmatter.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      
      // Remove GitHub Copilot-specific 'target' field
      if (key !== 'target') {
        fields[key] = value;
      }
    }
  }
  
  // Rebuild frontmatter
  const newFrontmatter = Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  
  // Extract description for section
  const description = fields.description || '';
  
  // Build skill format
  return `---
${newFrontmatter}
---

# ${agentName}

${description}

${body}`;
}

module.exports = { agentToSkill };
