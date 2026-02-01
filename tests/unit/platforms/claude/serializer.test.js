import { describe, test, expect } from 'vitest';
import { serializeFrontmatter } from '../../../../bin/lib/platforms/claude/serializer.js';
import yaml from 'gray-matter';

describe('Claude Serializer', () => {
  describe('array formatting - block style', () => {
    test('serializes arrays as multi-line block style', () => {
      const data = { skills: ['gsd-help', 'gsd-verify'] };
      const result = serializeFrontmatter(data);
      
      // Verify block style formatting with dashes
      expect(result).toContain('skills:\n  - gsd-help');
      expect(result).toContain('  - gsd-verify');
      
      // Verify NOT flow style
      expect(result).not.toContain("skills: [");
    });
    
    test('formats tools as multi-line array', () => {
      const data = {
        tools: ['read', 'write', 'bash']
      };
      
      const result = serializeFrontmatter(data);
      
      expect(result).toContain('tools:');
      expect(result).toContain('  - read');
      expect(result).toContain('  - write');
      expect(result).toContain('  - bash');
      
      // Verify NOT single-line format
      expect(result).not.toContain("tools: [");
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
  });
  
  describe('nested object formatting', () => {
    test('formats metadata as multi-line block with 2-space indentation', () => {
      const data = {
        name: 'test-agent',
        metadata: {
          platform: 'claude',
          generated: '2026-01-28'
        }
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify multi-line format
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: claude');
      expect(result).toContain('  generated: \'2026-01-28\'');
      
      // Verify NOT inline format
      expect(result).not.toContain('metadata: {');
      
      // Parse as YAML to verify structure
      const parsed = yaml(`---\n${result}\n---`);
      expect(parsed.data.metadata).toEqual({
        platform: 'claude',
        generated: '2026-01-28'
      });
    });
    
    test('formats nested objects with proper indentation', () => {
      const data = {
        metadata: {
          platform: 'claude',
          config: {
            timeout: 30,
            retries: 3
          }
        }
      };
      
      const result = serializeFrontmatter(data);
      
      // Verify nested indentation (4 spaces for nested object)
      expect(result).toContain('metadata:');
      expect(result).toContain('  platform: claude');
      expect(result).toContain('  config:');
      expect(result).toContain('    timeout: 30');
      expect(result).toContain('    retries: 3');
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
      
      const result = serializeFrontmatter(data);
      
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
  
  describe('special characters', () => {
    test('handles strings with colons', () => {
      const data = {
        name: 'test',
        description: 'Description: with colon'
      };
      
      const result = serializeFrontmatter(data);
      
      // Should be quoted to handle colon
      expect(result).toMatch(/description: ['"]Description: with colon['"]/);
    });
    
    test('handles strings with hashes at start', () => {
      const data = {
        name: 'test',
        description: '# Code comment'
      };
      
      const result = serializeFrontmatter(data);
      
      // Should be quoted if hash is at start
      expect(result).toMatch(/description: ['"]# Code comment['"]/);
    });
  });
  
  describe('edge cases', () => {
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
        metadata: { platform: 'claude' },
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
