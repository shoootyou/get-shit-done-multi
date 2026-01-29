// tests/unit/template-renderer.test.js

import { describe, it, expect } from 'vitest';
import { replaceVariables, findUnknownVariables } from '../../bin/lib/rendering/template-renderer.js';

describe('template-renderer', () => {
  describe('replaceVariables', () => {
    it('should replace single variable', () => {
      const result = replaceVariables('Hello {{NAME}}', { NAME: 'World' });
      expect(result).toBe('Hello World');
    });
    
    it('should replace multiple variables', () => {
      const result = replaceVariables(
        '{{PLATFORM_ROOT}}/{{COMMAND_PREFIX}}help',
        { PLATFORM_ROOT: '.claude', COMMAND_PREFIX: '/gsd-' }
      );
      expect(result).toBe('.claude//gsd-help');
    });
    
    it('should replace multiple occurrences', () => {
      const result = replaceVariables(
        '{{VAR}} and {{VAR}} again',
        { VAR: 'test' }
      );
      expect(result).toBe('test and test again');
    });
    
    it('should leave unknown variables unchanged', () => {
      const result = replaceVariables('{{KNOWN}} {{UNKNOWN}}', { KNOWN: 'yes' });
      expect(result).toBe('yes {{UNKNOWN}}');
    });
  });
  
  describe('findUnknownVariables', () => {
    it('should find unknown variables', () => {
      const result = findUnknownVariables(
        '{{KNOWN}} {{UNKNOWN1}} {{UNKNOWN2}}',
        { KNOWN: 'value' }
      );
      expect(result).toEqual(['UNKNOWN1', 'UNKNOWN2']);
    });
    
    it('should return empty array if all known', () => {
      const result = findUnknownVariables(
        '{{VAR1}} {{VAR2}}',
        { VAR1: 'a', VAR2: 'b' }
      );
      expect(result).toEqual([]);
    });
  });
});
