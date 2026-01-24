/**
 * Tests for Old Flag Detector
 * 
 * Comprehensive test coverage for old flag detection logic.
 * Tests detection, removal, warnings, and edge cases.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Plan 3
 */

const detectAndFilterOldFlags = require('./old-flag-detector');

describe('Old Flag Detector', () => {
  let consoleWarnSpy;
  
  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });
  
  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });
  
  describe('Scope flags without platform flags (NEW v1.10.0 behavior)', () => {
    test('--local alone is KEPT (scope preset for menu)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--local']);
      expect(cleaned).toEqual(['node', 'install.js', '--local']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('--global alone is KEPT (scope preset for menu)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--global']);
      expect(cleaned).toEqual(['node', 'install.js', '--global']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('--codex-global is ALWAYS removed (truly old flag)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--codex-global']);
      expect(cleaned).toEqual(['node', 'install.js']);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('removed in v1.10.0');
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('--codex-global');
    });
    
    test('--codex-global shows migration example', () => {
      detectAndFilterOldFlags(['node', 'install.js', '--codex-global']);
      expect(consoleWarnSpy.mock.calls[1][0]).toContain('--codex --local');
      expect(consoleWarnSpy.mock.calls[1][0]).toContain('instead of');
    });
    
    test('--codex-global warning references MIGRATION.md', () => {
      detectAndFilterOldFlags(['node', 'install.js', '--codex-global']);
      expect(consoleWarnSpy.mock.calls[2][0]).toContain('MIGRATION.md');
    });
  });
  
  describe('Multiple flags (no platform)', () => {
    test('--local and --global both kept (will conflict in validator)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--local', '--global']);
      expect(cleaned).toEqual(['node', 'install.js', '--local', '--global']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('--codex-global with --local: only codex-global removed', () => {
      const cleaned = detectAndFilterOldFlags([
        'node', 'install.js', '--local', '--codex-global'
      ]);
      expect(cleaned).toEqual(['node', 'install.js', '--local']);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
    
    test('single warning for old flags only', () => {
      detectAndFilterOldFlags(['node', 'install.js', '--codex-global']);
      // Should have exactly 3 warnings: main warning, example, reference
      expect(consoleWarnSpy).toHaveBeenCalledTimes(4); // 3 warnings + 1 blank line
    });
  });
  
  describe('Mixed scope flags with platform flags (NEW usage)', () => {
    test('keeps --local when used with --claude (new usage)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude', '--local']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude', '--local']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('keeps --global when used with --copilot (new usage)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--copilot', '--global']);
      expect(cleaned).toEqual(['node', 'install.js', '--copilot', '--global']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('always treats --codex-global as old even with platform flags', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude', '--codex-global']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude']);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('--codex-global');
    });
    
    test('treats --all as platform flag (keeps --local)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--all', '--local']);
      expect(cleaned).toEqual(['node', 'install.js', '--all', '--local']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('No old flags present', () => {
    test('no warning for new flag usage', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude', '--global']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude', '--global']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('no warning for platform-only flags', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('no warning for --all flag', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--all']);
      expect(cleaned).toEqual(['node', 'install.js', '--all']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('no warning for no flags', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js']);
      expect(cleaned).toEqual(['node', 'install.js']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Edge cases and variations', () => {
    test('does not detect --locale (different flag)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--locale']);
      expect(cleaned).toEqual(['node', 'install.js', '--locale']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('does not detect -l short form as old (it is new)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude', '-l']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude', '-l']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('does not detect -g short form as old (it is new)', () => {
      const cleaned = detectAndFilterOldFlags(['node', 'install.js', '--claude', '-g']);
      expect(cleaned).toEqual(['node', 'install.js', '--claude', '-g']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('handles flags at different positions (NEW: kept)', () => {
      const cleaned = detectAndFilterOldFlags(['node', '--local', 'install.js']);
      expect(cleaned).toEqual(['node', '--local', 'install.js']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    test('preserves other arguments (NEW: --local kept)', () => {
      const cleaned = detectAndFilterOldFlags([
        'node', 'install.js', '--local', 'some-arg', '--other-flag'
      ]);
      expect(cleaned).toEqual(['node', 'install.js', '--local', 'some-arg', '--other-flag']);
    });
    
    test('handles argv with only scope flags (NEW: kept)', () => {
      const cleaned = detectAndFilterOldFlags(['--local', '--global']);
      expect(cleaned).toEqual(['--local', '--global']);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
