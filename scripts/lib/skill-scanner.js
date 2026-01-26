import path from 'node:path';
import fs from 'fs-extra';

/**
 * Scan agent content for skill references
 * Looks for patterns: /gsd-*, $gsd-*, gsd-* (in markdown links, text)
 * Cross-references with actual skills in templates/skills/ directory
 * 
 * @param {string} content - Agent markdown content
 * @param {string} skillsDir - Path to templates/skills/ directory
 * @returns {Array<string>} - Array of skill command names (e.g., ['gsd-new-project', 'gsd-execute-phase'])
 */
export async function scanForSkillReferences(content, skillsDir) {
  const references = new Set();
  
  // Patterns to match skill references
  const patterns = [
    /\/gsd-([a-z-]+)/g,      // /gsd-new-project
    /\$gsd-([a-z-]+)/g,      // $gsd-new-project (Codex)
    /`gsd-([a-z-]+)`/g,      // `gsd-new-project` (inline code)
    /\bgsd-([a-z-]+)\b/g     // gsd-new-project (plain text)
  ];
  
  // Extract all potential skill names
  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      references.add(`gsd-${match[1]}`);
    }
  });
  
  // Get list of actual skills from templates/skills/ directory
  let actualSkills = [];
  if (await fs.pathExists(skillsDir)) {
    const dirs = await fs.readdir(skillsDir);
    actualSkills = dirs.filter(dir => dir.startsWith('gsd-'));
  }
  
  // Filter to only include references that match actual skills
  const validSkills = Array.from(references).filter(ref => 
    actualSkills.includes(ref)
  );
  
  return validSkills.sort();
}
