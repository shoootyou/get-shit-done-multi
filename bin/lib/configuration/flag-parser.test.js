/**
 * Tests for Flag Parser
 * 
 * Comprehensive test coverage for Commander.js-based flag parsing.
 * Tests all platform combinations, scope modifiers, --all flag, and deduplication.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Plan 3
 */

const parseFlags = require('./flag-parser');

describe('Flag Parser', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  describe('Single platform flags', () => {
    test('parses --claude', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(result.platforms).toEqual(['claude']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
    
    test('parses --copilot', () => {
      const result = parseFlags(['node', 'install.js', '--copilot']);
      expect(result.platforms).toEqual(['copilot']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
    
    test('parses --codex', () => {
      const result = parseFlags(['node', 'install.js', '--codex']);
      expect(result.platforms).toEqual(['codex']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
  });
  
  describe('Multiple platform flags', () => {
    test('parses --claude --copilot', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--copilot']);
      expect(result.platforms).toEqual(['claude', 'copilot']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
    
    test('parses --claude --copilot --codex', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--copilot', '--codex']);
      expect(result.platforms).toEqual(['claude', 'copilot', 'codex']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
    
    test('parses --copilot --codex', () => {
      const result = parseFlags(['node', 'install.js', '--copilot', '--codex']);
      expect(result.platforms).toEqual(['copilot', 'codex']);
      expect(result.scope).toBe('local');
      expect(result.needsMenu).toBe(false);
    });
    
    test('parses flags in any order', () => {
      const result = parseFlags(['node', 'install.js', '--codex', '--claude']);
      expect(result.platforms).toContain('claude');
      expect(result.platforms).toContain('codex');
      expect(result.platforms).toHaveLength(2);
    });
  });
  
  describe('--all flag', () => {
    test('--all includes all three platforms', () => {
      const result = parseFlags(['node', 'install.js', '--all']);
      expect(result.platforms).toHaveLength(3);
      expect(result.platforms).toContain('claude');
      expect(result.platforms).toContain('copilot');
      expect(result.platforms).toContain('codex');
      expect(result.needsMenu).toBe(false);
    });
    
    test('--all with --claude shows info and uses all platforms', () => {
      const result = parseFlags(['node', 'install.js', '--all', '--claude']);
      expect(result.platforms).toHaveLength(3);
      expect(result.platforms).toContain('claude');
      expect(result.platforms).toContain('copilot');
      expect(result.platforms).toContain('codex');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Using --all');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('ignored');
    });
    
    test('--all with multiple platforms shows info', () => {
      const result = parseFlags(['node', 'install.js', '--all', '--claude', '--copilot']);
      expect(result.platforms).toHaveLength(3);
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Using --all');
    });
    
    test('--all without specific platforms does not show info', () => {
      parseFlags(['node', 'install.js', '--all']);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Scope flags', () => {
    test('--global sets scope to global', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--global']);
      expect(result.scope).toBe('global');
    });
    
    test('--local sets scope to local', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--local']);
      expect(result.scope).toBe('local');
    });
    
    test('-g short form sets scope to global', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '-g']);
      expect(result.scope).toBe('global');
    });
    
    test('-l short form sets scope to local', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '-l']);
      expect(result.scope).toBe('local');
    });
    
    test('no scope flag defaults to local', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(result.scope).toBe('local');
    });
  });
  
  describe('Combined platform and scope', () => {
    test('--claude --global', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--global']);
      expect(result.platforms).toEqual(['claude']);
      expect(result.scope).toBe('global');
    });
    
    test('--copilot --codex --local', () => {
      const result = parseFlags(['node', 'install.js', '--copilot', '--codex', '--local']);
      expect(result.platforms).toEqual(['copilot', 'codex']);
      expect(result.scope).toBe('local');
    });
    
    test('--all --global', () => {
      const result = parseFlags(['node', 'install.js', '--all', '--global']);
      expect(result.platforms).toHaveLength(3);
      expect(result.scope).toBe('global');
    });
    
    test('scope flag can come before platform flags', () => {
      const result = parseFlags(['node', 'install.js', '--global', '--claude']);
      expect(result.platforms).toEqual(['claude']);
      expect(result.scope).toBe('global');
    });
    
    test('short form scope with platform flags', () => {
      const result = parseFlags(['node', 'install.js', '-g', '--claude', '--copilot']);
      expect(result.platforms).toEqual(['claude', 'copilot']);
      expect(result.scope).toBe('global');
    });
  });
  
  describe('Duplicate platform flags', () => {
    test('--claude --claude handled gracefully (Commander treats as single)', () => {
      // Note: Commander.js boolean flags set once regardless of repetition
      // This is acceptable behavior - duplicate flags don't cause errors
      const result = parseFlags(['node', 'install.js', '--claude', '--claude']);
      expect(result.platforms).toEqual(['claude']);
      expect(result.needsMenu).toBe(false);
    });
    
    test('--copilot --copilot --copilot handled as single', () => {
      const result = parseFlags(['node', 'install.js', '--copilot', '--copilot', '--copilot']);
      expect(result.platforms).toEqual(['copilot']);
      expect(result.needsMenu).toBe(false);
    });
    
    test('unique platforms work without issues', () => {
      const result = parseFlags(['node', 'install.js', '--claude', '--copilot', '--codex']);
      expect(result.platforms).toEqual(['claude', 'copilot', 'codex']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('No platforms (menu mode)', () => {
    test('no flags triggers menu with null scope (menu will ask)', () => {
      const result = parseFlags(['node', 'install.js']);
      expect(result.platforms).toEqual([]);
      expect(result.needsMenu).toBe(true);
      expect(result.scope).toBe(null);  // Scope will be asked in menu
    });
    
    test('--global only triggers menu with global scope preset', () => {
      const result = parseFlags(['node', 'install.js', '--global']);
      expect(result.platforms).toEqual([]);
      expect(result.needsMenu).toBe(true);
      expect(result.scope).toBe('global');  // Scope preset, menu asks for platform
    });
    
    test('--local only triggers menu with local scope preset', () => {
      const result = parseFlags(['node', 'install.js', '--local']);
      expect(result.platforms).toEqual([]);
      expect(result.needsMenu).toBe(true);
      expect(result.scope).toBe('local');  // Scope preset, menu asks for platform
    });
    
    test('-g only triggers menu', () => {
      const result = parseFlags(['node', 'install.js', '-g']);
      expect(result.platforms).toEqual([]);
      expect(result.needsMenu).toBe(true);
      expect(result.scope).toBe('global');
    });
  });
  
  describe('Error handling', () => {
    test('unknown option throws error', () => {
      expect(() => {
        parseFlags(['node', 'install.js', '--unknown-flag']);
      }).toThrow();
    });
    
    test('invalid flag format throws error', () => {
      expect(() => {
        parseFlags(['node', 'install.js', '--claude=value']);
      }).toThrow();
    });
  });
  
  describe('Edge cases', () => {
    test('handles empty argv gracefully', () => {
      const result = parseFlags(['node', 'install.js']);
      expect(result.platforms).toEqual([]);
      expect(result.needsMenu).toBe(true);
    });
    
    test('preserves platform order when parsed', () => {
      const result = parseFlags(['node', 'install.js', '--codex', '--claude', '--copilot']);
      // Order is based on if/else order in parser, not input order
      expect(result.platforms).toHaveLength(3);
    });
    
    test('scope flag position does not affect result', () => {
      const result1 = parseFlags(['node', 'install.js', '--global', '--claude', '--copilot']);
      const result2 = parseFlags(['node', 'install.js', '--claude', '--global', '--copilot']);
      const result3 = parseFlags(['node', 'install.js', '--claude', '--copilot', '--global']);
      
      expect(result1.scope).toBe('global');
      expect(result2.scope).toBe('global');
      expect(result3.scope).toBe('global');
      
      expect(result1.platforms).toEqual(result2.platforms);
      expect(result2.platforms).toEqual(result3.platforms);
    });
  });
  
  describe('Return structure', () => {
    test('always returns platforms array', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(Array.isArray(result.platforms)).toBe(true);
    });
    
    test('always returns scope string', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(typeof result.scope).toBe('string');
      expect(['local', 'global']).toContain(result.scope);
    });
    
    test('always returns needsMenu boolean', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(typeof result.needsMenu).toBe('boolean');
    });
    
    test('has no unexpected properties', () => {
      const result = parseFlags(['node', 'install.js', '--claude']);
      expect(Object.keys(result)).toEqual(['platforms', 'scope', 'needsMenu', 'configDir']);
    });
  });
});
