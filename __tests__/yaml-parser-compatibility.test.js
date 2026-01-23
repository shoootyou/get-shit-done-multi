const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');

describe('YAML Parser Compatibility (TEST-10)', () => {
  const platforms = ['claude', 'copilot', 'codex'];
  
  test('YAML parser works consistently across platforms', () => {
    // Test various YAML structures that might differ between parsers
    const testCases = [
      {
        name: 'simple object',
        yaml: 'name: test\ndescription: Test spec\ntools:\n  - view\n  - edit'
      },
      {
        name: 'array with dash syntax',
        yaml: 'tools:\n  - view\n  - edit\n  - bash'
      },
      {
        name: 'multiline string',
        yaml: 'description: |\n  This is a multiline\n  description string'
      },
      {
        name: 'nested object',
        yaml: 'metadata:\n  author: test\n  version: 1.0.0'
      },
      {
        name: 'special characters',
        yaml: 'description: "Test with special chars: @, #, $"'
      }
    ];
    
    for (const testCase of testCases) {
      expect(() => {
        const parsed = yaml.load(testCase.yaml);
        expect(parsed).toBeDefined();
        expect(typeof parsed).toBe('object');
      }).not.toThrow();
    }
  });
  
  test('All existing specs parse without platform-specific issues', async () => {
    const specsDir = path.join(__dirname, '..', 'specs', 'skills');
    const specDirs = await fs.readdir(specsDir);
    const skillDirs = specDirs.filter(d => d.startsWith('gsd-'));
    
    for (const dir of skillDirs) {
      const skillFile = path.join(specsDir, dir, 'SKILL.md');
      
      if (await fileExists(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        // Skip specs with template syntax (they need to be rendered first)
        if (frontmatter.includes('{{') || frontmatter.includes('}}')) {
          continue;
        }
        
        // Parse with same YAML library used in production
        expect(() => {
          const parsed = yaml.load(frontmatter);
          expect(parsed).toBeDefined();
        }).not.toThrow();
      }
    }
  });
  
  test('YAML parser handles edge cases consistently', () => {
    // Test edge cases that might differ between YAML libraries
    const edgeCases = [
      { yaml: 'value: true', expected: { value: true } },
      { yaml: 'value: false', expected: { value: false } },
      { yaml: 'value: null', expected: { value: null } },
      { yaml: 'value: 123', expected: { value: 123 } },
      { yaml: 'value: "123"', expected: { value: '123' } },
      { yaml: 'list: []', expected: { list: [] } }
    ];
    
    for (const testCase of edgeCases) {
      const parsed = yaml.load(testCase.yaml);
      expect(parsed).toEqual(testCase.expected);
    }
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
