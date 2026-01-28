import { describe, test, expect } from 'vitest';
import { serializeFrontmatter } from '../../bin/lib/rendering/frontmatter-serializer.js';
import yaml from 'gray-matter';

describe('frontmatter-serializer', () => {
  describe('empty array omission', () => {
    test('omits empty tools array from output', () => {
      const data = {
        name: 'test-agent',
        tools: [],
        description: 'Test agent'
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify empty array is not present
      expect(result).not.toContain('tools:');
      expect(result).not.toContain('[]');
      
      // Verify other fields are present
      expect(result).toContain('name: test-agent');
      expect(result).toContain("description: 'Test agent'");
    });
    
    test('omits empty skills array from output', () => {
      const data = {
        name: 'test-agent',
        skills: []
      };
      
      const result = serializeFrontmatter(data, 'claude');
      
      expect(result).not.toContain('skills:');
      expect(result).not.toContain('[]');
    });
  });
  
  describe('Copilot single-line tools format', () => {
    test('formats tools as single-line array with single quotes', () => {
      const data = {
        name: 'test-agent',
        tools: ['read', 'write', 'bash']
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify single-line format with single quotes
      expect(result).toContain("tools: ['read', 'write', 'bash']");
      
      // Verify NOT multi-line format
      expect(result).not.toMatch(/tools:\n\s*-/);
    });
    
    test('formats disallowedTools as single-line array', () => {
      const data = {
        name: 'test-agent',
        disallowedTools: ['dangerous-tool', 'legacy-tool']
      };
      
      const result = serializeFrontmatter(data, 'codex');
      
      expect(result).toContain("disallowedTools: ['dangerous-tool', 'legacy-tool']");
    });
  });
  
  describe('special characters in tool names', () => {
    test('handles slashes in tool names', () => {
      const data = {
        tools: ['custom-mcp/tool-1', 'read', 'another-mcp/tool-2']
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify slashes are kept as-is in single quotes
      expect(result).toContain("tools: ['custom-mcp/tool-1', 'read', 'another-mcp/tool-2']");
      
      // Verify no escaping of slashes
      expect(result).not.toContain('\\');
    });
    
    test('handles hyphens in tool names', () => {
      const data = {
        tools: ['tool-with-dash', 'another-tool']
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain("tools: ['tool-with-dash', 'another-tool']");
    });
    
    test('handles underscores in tool names', () => {
      const data = {
        tools: ['tool_with_underscore', 'read']
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain("tools: ['tool_with_underscore', 'read']");
    });
  });
  
  describe('metadata block indentation', () => {
    test('formats metadata as multi-line block with 2-space indentation', () => {
      const data = {
        name: 'test-agent',
        metadata: {
          platform: 'copilot',
          generated: '2026-01-28'
        }
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify multi-line format
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: copilot');
      expect(result).toContain("  generated: '2026-01-28'");
      
      // Verify NOT inline format
      expect(result).not.toContain('metadata: {');
      
      // Parse as YAML to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.metadata).toEqual({
        platform: 'copilot',
        generated: '2026-01-28'
      });
    });
    
    test('formats nested objects with proper indentation', () => {
      const data = {
        metadata: {
          platform: 'codex',
          config: {
            timeout: 30,
            retries: 3
          }
        }
      };
      
      const result = serializeFrontmatter(data, 'codex');
      
      // Verify nested indentation (4 spaces for nested object)
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: codex');
      expect(result).toContain('  config:');
      expect(result).toContain('    timeout: 30');
      expect(result).toContain('    retries: 3');
    });
  });
  
  describe('Claude multi-line skills format', () => {
    test('formats skills as multi-line array with dash prefix', () => {
      const data = {
        name: 'test-agent',
        skills: ['gsd-help', 'gsd-verify']
      };
      
      const result = serializeFrontmatter(data, 'claude');
      
      // Verify multi-line format with dashes
      expect(result).toContain('skills:');
      expect(result).toContain('  - gsd-help');
      expect(result).toContain('  - gsd-verify');
      
      // Verify NOT single-line format
      expect(result).not.toContain("skills: [");
      
      // Parse as YAML to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.skills).toEqual(['gsd-help', 'gsd-verify']);
    });
    
    test('formats Claude tools as multi-line array', () => {
      const data = {
        tools: ['read', 'write', 'bash']
      };
      
      const result = serializeFrontmatter(data, 'claude');
      
      expect(result).toContain('tools:');
      expect(result).toContain('  - read');
      expect(result).toContain('  - write');
      expect(result).toContain('  - bash');
    });
  });
  
  describe('undefined field omission', () => {
    test('omits undefined fields from output', () => {
      const data = {
        name: 'test-agent',
        tools: undefined,
        description: 'Test agent',
        skills: undefined
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify undefined fields not present
      expect(result).not.toContain('tools:');
      expect(result).not.toContain('skills:');
      
      // Verify defined fields are present
      expect(result).toContain('name: test-agent');
      expect(result).toContain("description: 'Test agent'");
    });
    
    test('omits undefined nested fields', () => {
      const data = {
        name: 'test-agent',
        metadata: {
          platform: 'copilot',
          version: undefined,
          generated: '2026-01-28'
        }
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify undefined nested field not present
      expect(result).not.toContain('version:');
      
      // Verify defined nested fields are present
      expect(result).toContain('  platform: copilot');
      expect(result).toContain("  generated: '2026-01-28'");
    });
  });
  
  describe('complete Copilot agent', () => {
    test('formats real-world Copilot agent with all fields', () => {
      const data = {
        name: 'gsd-install',
        description: 'Install GSD skills and agents to multiple platforms',
        tools: ['read', 'write', 'bash', 'custom-mcp/file-ops'],
        disallowedTools: ['dangerous-tool'],
        metadata: {
          platform: 'copilot',
          generated: '2026-01-28T12:00:00Z',
          version: '2.0.0'
        }
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Verify field ordering (name first)
      const lines = result.split('\n');
      expect(lines[0]).toContain('name:');
      
      // Verify tools format
      expect(result).toContain("tools: ['read', 'write', 'bash', 'custom-mcp/file-ops']");
      
      // Verify disallowedTools format
      expect(result).toContain("disallowedTools: ['dangerous-tool']");
      
      // Verify metadata block
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: copilot');
      expect(result).toContain("  generated: '2026-01-28T12:00:00Z'");
      expect(result).toContain("  version: '2.0.0'");
      
      // Parse to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.name).toBe('gsd-install');
      expect(parsed.data.tools).toEqual(['read', 'write', 'bash', 'custom-mcp/file-ops']);
      expect(parsed.data.metadata.platform).toBe('copilot');
    });
  });
  
  describe('complete Claude agent', () => {
    test('formats real-world Claude agent with skills', () => {
      const data = {
        name: 'gsd-helper',
        description: 'GSD helper agent with skill access',
        skills: ['gsd-help', 'gsd-install', 'gsd-verify'],
        metadata: {
          platform: 'claude',
          generated: '2026-01-28'
        }
      };
      
      const result = serializeFrontmatter(data, 'claude');
      
      // Verify skills multi-line format
      expect(result).toContain('skills:');
      expect(result).toContain('  - gsd-help');
      expect(result).toContain('  - gsd-install');
      expect(result).toContain('  - gsd-verify');
      
      // Verify metadata block
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: claude');
      
      // Parse to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.skills).toEqual(['gsd-help', 'gsd-install', 'gsd-verify']);
    });
  });
  
  describe('edge cases', () => {
    test('handles null values', () => {
      const data = {
        name: 'test',
        description: null
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain('description: null');
    });
    
    test('handles boolean values', () => {
      const data = {
        name: 'test',
        enabled: true,
        deprecated: false
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain('enabled: true');
      expect(result).toContain('deprecated: false');
    });
    
    test('handles numeric values', () => {
      const data = {
        name: 'test',
        version: 2,
        timeout: 30.5
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toContain('version: 2');
      expect(result).toContain('timeout: 30.5');
    });
    
    test('handles strings with spaces', () => {
      const data = {
        name: 'test',
        description: 'This is a long description'
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Should be quoted
      expect(result).toContain("description: 'This is a long description'");
    });
    
    test('handles strings with special characters', () => {
      const data = {
        name: 'test',
        description: 'Description: with colon'
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      
      // Should be quoted to handle colon
      expect(result).toMatch(/description: ['"]Description: with colon['"]/);
    });
    
    test('handles empty object', () => {
      const data = {};
      
      const result = serializeFrontmatter(data, 'copilot');
      
      expect(result).toBe('');
    });
  });
  
  describe('field ordering', () => {
    test('maintains standard field order', () => {
      const data = {
        // Intentionally out of order
        metadata: { platform: 'copilot' },
        tools: ['read'],
        description: 'Test',
        name: 'test-agent'
      };
      
      const result = serializeFrontmatter(data, 'copilot');
      const lines = result.split('\n');
      
      // Find line indices
      const nameIndex = lines.findIndex(l => l.startsWith('name:'));
      const descIndex = lines.findIndex(l => l.startsWith('description:'));
      const toolsIndex = lines.findIndex(l => l.startsWith('tools:'));
      const metadataIndex = lines.findIndex(l => l.startsWith('metadata:'));
      
      // Verify order: name, description, tools, metadata
      expect(nameIndex).toBeLessThan(descIndex);
      expect(descIndex).toBeLessThan(toolsIndex);
      expect(toolsIndex).toBeLessThan(metadataIndex);
    });
  });
});
