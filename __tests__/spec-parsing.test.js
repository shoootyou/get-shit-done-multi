const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

describe('Spec Parsing (TEST-01)', () => {
  const specsDir = path.join(__dirname, '..', 'specs', 'skills');
  
  test('All spec files can be read and have frontmatter', async () => {
    const specDirs = await fs.readdir(specsDir);
    const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
    
    expect(skillDirs.length).toBeGreaterThan(0);
    
    for (const dir of skillDirs) {
      const skillFile = path.join(specsDir, dir, 'SKILL.md');
      
      if (await fileExists(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        // Should have frontmatter
        expect(frontmatter).toBeDefined();
        expect(frontmatter.length).toBeGreaterThan(0);
        
        // If no template syntax, should parse as valid YAML
        if (!hasTemplateSyntax(frontmatter)) {
          expect(() => yaml.load(frontmatter)).not.toThrow();
          
          const parsed = yaml.load(frontmatter);
          expect(parsed).toBeDefined();
          expect(typeof parsed).toBe('object');
        }
      }
    }
  });
  
  test('All specs have required frontmatter fields', async () => {
    const specDirs = await fs.readdir(specsDir);
    const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
    
    const required = ['name', 'description'];
    
    for (const dir of skillDirs) {
      const skillFile = path.join(specsDir, dir, 'SKILL.md');
      
      if (await fileExists(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        // Check for required fields as text (works with templates)
        for (const field of required) {
          expect(frontmatter).toContain(`${field}:`);
        }
        
        // Also check tools (either direct or in conditional)
        const hasTools = frontmatter.includes('tools:') || frontmatter.includes('tools =');
        expect(hasTools).toBe(true);
      }
    }
  });
  
  test('Spec folder names match skill names in frontmatter', async () => {
    const specDirs = await fs.readdir(specsDir);
    const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
    
    for (const dir of skillDirs) {
      const skillFile = path.join(specsDir, dir, 'SKILL.md');
      
      if (await fileExists(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        // Check that name field matches directory
        expect(frontmatter).toContain(`name: ${dir}`);
      }
    }
  });
});

// Helper functions
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

function hasTemplateSyntax(text) {
  return text.includes('{{') || text.includes('}}');
}
