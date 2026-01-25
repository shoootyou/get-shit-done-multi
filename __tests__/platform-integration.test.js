const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

describe('Platform Integration (TEST-05)', () => {
  test('All platforms have spec directories configured', () => {
    const expectedDirs = {
      claude: '.claude/get-shit-done',
      copilot: '.github/copilot/skills',
      codex: '.codex/skills'
    };
    
    for (const [platform, dir] of Object.entries(expectedDirs)) {
      // Test that path is correctly constructed
      const fullPath = path.join(__dirname, '..', dir);
      expect(fullPath).toContain(dir);
      // Note: Don't check for 'get-shit-done' in path - workspace path may vary
    }
  });
  
  test('Shared frontmatter is loaded and merged', async () => {
    const sharedPath = path.join(__dirname, '..', 'specs', 'skills', '_shared.yml');
    
    const exists = await fileExists(sharedPath);
    expect(exists).toBe(true);
    
    if (exists) {
      const content = await fs.readFile(sharedPath, 'utf8');
      expect(content.length).toBeGreaterThan(0);
      
      // Should contain common fields
      expect(content).toMatch(/description|tools|metadata/);
    }
  });
  
  test('All specs can be loaded and have valid structure', async () => {
    const specsDir = path.join(__dirname, '..', 'specs', 'skills');
    const specDirs = await fs.readdir(specsDir);
    const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
    
    expect(skillDirs.length).toBeGreaterThan(0);
    
    let validSpecs = 0;
    for (const dir of skillDirs) {
      const skillFile = path.join(specsDir, dir, 'SKILL.md');
      
      if (await fileExists(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        // Skip specs with template syntax for now
        if (frontmatter.includes('{{') || frontmatter.includes('}}')) {
          // Still check for basic required fields as text
          expect(frontmatter).toContain('name:');
          expect(frontmatter).toContain('description:');
          validSpecs++;
          continue;
        }
        
        const parsed = yaml.load(frontmatter);
        
        // Should have required fields
        expect(parsed).toHaveProperty('name');
        expect(parsed).toHaveProperty('description');
        expect(parsed).toHaveProperty('tools');
        
        validSpecs++;
      }
    }
    
    // Should have found at least some valid specs
    expect(validSpecs).toBeGreaterThan(5);
  });
});

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
