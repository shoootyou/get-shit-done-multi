// tests/unit/template-renderer.test.js

import { describe, it, expect } from 'vitest';
import { renderTemplate, getClaudeVariables, findUnknownVariables } from '../../bin/lib/rendering/template-renderer.js';

describe('template-renderer', () => {
  describe('renderTemplate', () => {
    it('should replace single variable', () => {
      const result = renderTemplate('Hello {{NAME}}', { NAME: 'World' });
      expect(result).toBe('Hello World');
    });
    
    it('should replace multiple variables', () => {
      const result = renderTemplate(
        '{{PLATFORM_ROOT}}/{{COMMAND_PREFIX}}help',
        { PLATFORM_ROOT: '.claude', COMMAND_PREFIX: '/gsd-' }
      );
      expect(result).toBe('.claude//gsd-help');
    });
    
    it('should replace multiple occurrences', () => {
      const result = renderTemplate(
        '{{VAR}} and {{VAR}} again',
        { VAR: 'test' }
      );
      expect(result).toBe('test and test again');
    });
    
    it('should leave unknown variables unchanged', () => {
      const result = renderTemplate('{{KNOWN}} {{UNKNOWN}}', { KNOWN: 'yes' });
      expect(result).toBe('yes {{UNKNOWN}}');
    });
  });
  
  describe('getClaudeVariables', () => {
    it('should return global variables', () => {
      const vars = getClaudeVariables(true);
      expect(vars).toMatchObject({
        PLATFORM_ROOT: '~/.claude',
        COMMAND_PREFIX: '/gsd-',
        VERSION: '2.0.0',
        PLATFORM_NAME: 'claude'
      });
    });
    
    it('should return local variables', () => {
      const vars = getClaudeVariables(false);
      expect(vars.PLATFORM_ROOT).toBe('.claude');
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
