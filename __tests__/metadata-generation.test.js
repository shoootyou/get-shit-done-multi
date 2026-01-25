const { generateFromSpec } = require('../bin/lib/templating/generator');

describe('Metadata Generation (TEST-04)', () => {
  test('Copilot generates metadata fields', () => {
    const testSpec = {
      frontmatter: {
        name: 'test-metadata',
        description: 'Test metadata generation',
        tools: ['view']
      },
      body: 'Test content'
    };
    
    const result = generateFromSpec(testSpec, 'copilot');
    
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    
    const rendered = result.output;
    
    // Copilot should contain metadata fields
    expect(rendered).toMatch(/metadata:/);
    expect(rendered).toMatch(/generated.*\d{4}-\d{2}-\d{2}/);
    expect(rendered).toMatch(/(templateVersion|projectVersion).*\d+\.\d+\.\d+/);
  });
  
  test('Claude does not generate metadata fields', () => {
    const testSpec = {
      frontmatter: {
        name: 'test-no-metadata',
        description: 'Test no metadata for Claude',
        tools: ['view']
      },
      body: 'Test content'
    };
    
    const result = generateFromSpec(testSpec, 'claude');
    
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    
    const rendered = result.output;
    
    // Claude should NOT contain metadata fields (per platform spec)
    expect(rendered).not.toContain('metadata:');
    expect(rendered).not.toContain('generated:');
  });
  
  test('Platform-specific tool names are correct', () => {
    const testSpec = {
      frontmatter: {
        name: 'test-tools',
        description: 'Test tool naming',
        tools: ['view', 'edit', 'bash']
      },
      body: 'Test content'
    };
    
    // Claude uses capitalized tool names
    const claudeResult = generateFromSpec(testSpec, 'claude');
    expect(claudeResult.success).toBe(true);
    // view -> Read, edit -> Edit, bash -> Bash
    expect(claudeResult.output).toContain('tools: Read, Edit, Bash');
    
    // Copilot uses lowercase tool names, bash -> execute
    const copilotResult = generateFromSpec(testSpec, 'copilot');
    expect(copilotResult.success).toBe(true);
    expect(copilotResult.output).toContain('tools: [read, edit, execute]');
    
    // Codex uses lowercase tool names, bash stays bash
    const codexResult = generateFromSpec(testSpec, 'codex');
    expect(codexResult.success).toBe(true);
    expect(codexResult.output).toContain('tools: [read, edit, bash]');
  });
});
