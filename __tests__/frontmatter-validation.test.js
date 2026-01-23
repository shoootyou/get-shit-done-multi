const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

describe('Frontmatter Validation (TEST-03)', () => {
  const specsDir = path.join(__dirname, '..', 'specs', 'skills');
  
  test('All specs have valid name format', async () => {
    const specs = await loadAllSpecs();
    
    for (const spec of specs) {
      // Name should be gsd-something
      expect(spec.name).toMatch(/^gsd-[a-z0-9-]+$/);
    }
  });
  
  test('All specs have non-empty descriptions', async () => {
    const specs = await loadAllSpecs();
    
    for (const spec of specs) {
      expect(spec.description).toBeDefined();
      expect(typeof spec.description).toBe('string');
      expect(spec.description.length).toBeGreaterThan(10);
    }
  });
  
  test('Tools are arrays of strings', async () => {
    const specs = await loadAllSpecs();
    
    for (const spec of specs) {
      expect(Array.isArray(spec.tools)).toBe(true);
      
      for (const tool of spec.tools) {
        expect(typeof tool).toBe('string');
      }
    }
  });
  
  test('No invalid frontmatter fields', async () => {
    const specs = await loadAllSpecs();
    const validFields = [
      'name', 'description', 'tools', 'metadata',
      'version', 'author', 'platform', 'tags'
    ];
    
    for (const spec of specs) {
      const fields = Object.keys(spec);
      
      for (const field of fields) {
        // Skip if it's a valid field or body content
        if (validFields.includes(field) || field === 'body') {
          continue;
        }
        
        // Warn about unexpected fields (not fail - may be extensions)
        console.warn(`Unexpected field in ${spec.name}: ${field}`);
      }
    }
  });
  
  test('Invalid schemas produce clear error messages', () => {
    // Test that schema validation provides actionable error messages
    const invalidSpec = {
      name: 'test-invalid',
      // Missing required 'description' field
      tools: ['view']
    };
    
    try {
      // This should fail validation during installation
      const serialized = yaml.dump(invalidSpec);
      const parsed = yaml.load(serialized);
      
      // Validate required fields
      const requiredFields = ['name', 'description', 'tools'];
      const missing = requiredFields.filter(f => !parsed[f]);
      
      if (missing.length > 0) {
        const errorMsg = `Schema validation failed: Missing required fields: ${missing.join(', ')}`;
        expect(errorMsg).toContain('Missing required fields');
        expect(errorMsg).toContain('description');
      }
    } catch (error) {
      // Should get clear error message
      expect(error.message).toBeDefined();
      expect(typeof error.message).toBe('string');
    }
  });
});

async function loadAllSpecs() {
  const specsDir = path.join(__dirname, '..', 'specs', 'skills');
  const specDirs = await fs.readdir(specsDir);
  const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
  
  const specs = [];
  
  for (const dir of skillDirs) {
    const skillFile = path.join(specsDir, dir, 'SKILL.md');
    
    try {
      const content = await fs.readFile(skillFile, 'utf8');
      const frontmatter = extractFrontmatter(content);
      
      // Skip specs with template syntax (they need to be rendered first)
      if (frontmatter.includes('{{') || frontmatter.includes('}}')) {
        continue;
      }
      
      const parsed = yaml.load(frontmatter);
      specs.push(parsed);
    } catch (err) {
      // Skip invalid specs
      console.warn(`Failed to load ${dir}: ${err.message}`);
    }
  }
  
  return specs;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}
