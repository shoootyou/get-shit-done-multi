import { describe, test, expect } from 'vitest';
import { serializeFrontmatter } from '../../../../bin/lib/platforms/copilot/serializer.js';
import yaml from 'gray-matter';

describe('Copilot Serializer', () => {
  describe('array formatting - flow style', () => {
    test('serializes arrays as flow style with single quotes', () => {
      const data = { 
        tools: ['read', 'write', 'bash'] 
      };
      const result = serializeFrontmatter(data);
      
      // Verify flow style formatting
      expect(result).toContain("tools: ['read', 'write', 'bash']");
      
      // Verify NOT block style
      expect(result).not.toMatch(/tools:\n\s*-/);
    });
    
    test('formats disallowedTools as flow style', () => {
      const data = {
        name: 'test-agent',
        disallowedTools: ['dangerous-tool', 'legacy-tool']
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain("disallowedTools: ['dangerous-tool', 'legacy-tool']");
    });
  });
  
  describe('special characters in tool names', () => {
    test('handles slashes in tool names', () => {
      const data = {
        tools: ['custom-mcp/tool-1', 'read', 'another-mcp/tool-2']
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify slashes are kept as-is in single quotes
      expect(result).toContain("tools: ['custom-mcp/tool-1', 'read', 'another-mcp/tool-2']");
      
      // Verify no escaping of slashes
      expect(result).not.toContain('\\');
    });
    
    test('handles hyphens in tool names', () => {
      const data = {
        tools: ['tool-with-dash', 'another-tool']
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain("tools: ['tool-with-dash', 'another-tool']");
    });
    
    test('handles underscores in tool names', () => {
      const data = {
        tools: ['tool_with_underscore', 'read']
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain("tools: ['tool_with_underscore', 'read']");
    });
  });
  
  describe('empty value omission', () => {
    test('omits empty arrays', () => {
      const data = {
        name: 'test-agent',
        tools: [],
        description: 'Test agent'
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify empty array is not present
      expect(result).not.toContain('tools:');
      expect(result).not.toContain('[]');
      
      // Verify other fields are present
      expect(result).toContain('name: test-agent');
      expect(result).toContain('description: Test agent');
    });
    
    test('omits undefined fields', () => {
      const data = {
        name: 'test-agent',
        tools: undefined,
        description: 'Test agent',
        skills: undefined
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify undefined fields not present
      expect(result).not.toContain('tools:');
      expect(result).not.toContain('skills:');
      
      // Verify defined fields are present
      expect(result).toContain('name: test-agent');
      expect(result).toContain('description: Test agent');
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
      
      const result = serializeFrontmatter(data);
      
      // Verify undefined nested field not present
      expect(result).not.toContain('version:');
      
      // Verify defined nested fields are present
      expect(result).toContain('  platform: copilot');
      expect(result).toContain('  generated: \'2026-01-28\'');
    });
  });
  
  describe('nested object formatting', () => {
    test('formats metadata as multi-line block with 2-space indentation', () => {
      const data = {
        name: 'test-agent',
        metadata: {
          platform: 'copilot',
          generated: '2026-01-28'
        }
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify multi-line format
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: copilot');
      expect(result).toContain('  generated: \'2026-01-28\'');
      
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
          platform: 'copilot',
          config: {
            timeout: 30,
            retries: 3
          }
        }
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify nested indentation
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: copilot');
      expect(result).toContain('  config:');
      expect(result).toContain('    timeout: 30');
      expect(result).toContain('    retries: 3');
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
      
      const result = serializeFrontmatter(data);
      
      // Verify field ordering (name first)
      const lines = result.split('\n');
      expect(lines[0]).toContain('name:');
      
      // Verify tools format (flow style)
      expect(result).toContain("tools: ['read', 'write', 'bash', 'custom-mcp/file-ops']");
      
      // Verify disallowedTools format
      expect(result).toContain("disallowedTools: ['dangerous-tool']");
      
      // Verify metadata block
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: copilot');
      expect(result).toContain('  generated: \'2026-01-28T12:00:00Z\'');
      expect(result).toContain('  version: \'2.0.0\'');
      
      // Parse to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.name).toBe('gsd-install');
      expect(parsed.data.tools).toEqual(['read', 'write', 'bash', 'custom-mcp/file-ops']);
      expect(parsed.data.metadata.platform).toBe('copilot');
    });
  });
  
  describe('edge cases', () => {
    test('handles strings with spaces', () => {
      const data = {
        name: 'test',
        description: 'This is a long description'
      };
      
      const result = serializeFrontmatter(data);
      
      // Should NOT be quoted (spaces alone don't require quoting in YAML)
      expect(result).toContain('description: This is a long description');
    });
    
    test('handles strings with special characters', () => {
      const data = {
        name: 'test',
        description: 'Description: with colon'
      };
      
      const result = serializeFrontmatter(data);
      
      // Should be quoted to handle colon
      expect(result).toMatch(/description: ['"]Description: with colon['"]/);
    });
    
    test('handles empty object', () => {
      const data = {};
      
      const result = serializeFrontmatter(data);
      
      expect(result).toBe('');
    });
    
    test('handles boolean values', () => {
      const data = {
        name: 'test',
        enabled: true,
        deprecated: false
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain('enabled: true');
      expect(result).toContain('deprecated: false');
    });
    
    test('handles numeric values', () => {
      const data = {
        name: 'test',
        version: 2,
        timeout: 30.5
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain('version: 2');
      expect(result).toContain('timeout: 30.5');
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
      
      const result = serializeFrontmatter(data);
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
