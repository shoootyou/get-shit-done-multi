const { generateFromSpec } = require('../bin/lib/templating/generator');

describe('Conditional Rendering (TEST-02)', () => {
  const platforms = ['claude', 'copilot', 'codex'];
  
  test('Platform conditionals render correctly', () => {
    // Test with sample spec containing conditionals
    const testSpec = {
      frontmatter: {
        name: 'test-conditional',
        description: 'Test conditional rendering',
        tools: ['view', 'edit']
      },
      body: `
{{#isClaude}}
Claude-specific content
{{/isClaude}}
{{#isCopilot}}
Copilot-specific content
{{/isCopilot}}
{{#isCodex}}
Codex-specific content
{{/isCodex}}
      `.trim()
    };
    
    for (const platform of platforms) {
      const result = generateFromSpec(testSpec, platform);
      
      // Should succeed
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      
      const rendered = result.output;
      
      // Each platform should only see its own content
      if (platform === 'claude') {
        expect(rendered).toContain('Claude-specific content');
        expect(rendered).not.toContain('Copilot-specific content');
        expect(rendered).not.toContain('Codex-specific content');
      } else if (platform === 'copilot') {
        expect(rendered).not.toContain('Claude-specific content');
        expect(rendered).toContain('Copilot-specific content');
        expect(rendered).not.toContain('Codex-specific content');
      } else if (platform === 'codex') {
        expect(rendered).not.toContain('Claude-specific content');
        expect(rendered).not.toContain('Copilot-specific content');
        expect(rendered).toContain('Codex-specific content');
      }
    }
  });
  
  test('Tools array renders without conditionals', () => {
    const testSpec = {
      frontmatter: {
        name: 'test-tools',
        description: 'Test tool rendering',
        tools: ['view', 'edit', 'bash', 'create']
      },
      body: 'Test content'
    };
    
    for (const platform of platforms) {
      const result = generateFromSpec(testSpec, platform);
      
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      
      const rendered = result.output;
      
      // Tools should be present (but transformed to platform-specific names)
      if (platform === 'claude') {
        expect(rendered).toContain('Read');    // view -> Read
        expect(rendered).toContain('Edit');    // edit -> Edit
        expect(rendered).toContain('Bash');    // bash -> Bash  
        expect(rendered).toContain('Edit');    // create -> Edit
      } else if (platform === 'copilot') {
        expect(rendered).toContain('read');
        expect(rendered).toContain('edit');
        expect(rendered).toContain('execute'); // bash -> execute for Copilot
      } else if (platform === 'codex') {
        expect(rendered).toContain('read');
        expect(rendered).toContain('edit');
        expect(rendered).toContain('bash');    // bash stays bash for Codex
      }
    }
  });
});
