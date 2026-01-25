/**
 * Tests for Flag Validator
 * 
 * Comprehensive test coverage for post-parse flag validation.
 * Tests conflicting scope detection, error messages, and exit codes.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Plan 3
 */

const validateFlags = require('./flag-validator');

describe('Flag Validator', () => {
  let consoleErrorSpy;
  let processExitSpy;
  
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
  
  describe('Conflicting scope flags', () => {
    test('rejects --local --global', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Cannot use both');
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('--local');
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('--global');
    });
    
    test('rejects -l -g short forms', () => {
      const argv = ['node', 'install.js', '-l', '-g'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    test('rejects mixed --local and -g', () => {
      const argv = ['node', 'install.js', '--local', '-g'];
      const config = { platforms: ['claude'], scope: 'global', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    test('rejects mixed -l and --global', () => {
      const argv = ['node', 'install.js', '-l', '--global'];
      const config = { platforms: ['copilot'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    test('shows example in error message', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(consoleErrorSpy.mock.calls[1][0]).toContain('Example:');
      expect(consoleErrorSpy.mock.calls[1][0]).toContain('--claude --global');
    });
    
    test('exits with code 2 (command misuse)', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
    });
  });
  
  describe('Valid combinations', () => {
    test('allows --claude --global', () => {
      const argv = ['node', 'install.js', '--claude', '--global'];
      const config = { platforms: ['claude'], scope: 'global', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    
    test('allows --claude --local', () => {
      const argv = ['node', 'install.js', '--claude', '--local'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    
    test('allows --all --global', () => {
      const argv = ['node', 'install.js', '--all', '--global'];
      const config = { platforms: ['claude', 'copilot', 'codex'], scope: 'global', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    
    test('allows --all --local', () => {
      const argv = ['node', 'install.js', '--all', '--local'];
      const config = { platforms: ['claude', 'copilot', 'codex'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows multiple platforms with scope', () => {
      const argv = ['node', 'install.js', '--claude', '--copilot', '--global'];
      const config = { platforms: ['claude', 'copilot'], scope: 'global', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows platform without explicit scope (defaults local)', () => {
      const argv = ['node', 'install.js', '--claude'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows scope without platform (triggers menu)', () => {
      const argv = ['node', 'install.js', '--global'];
      const config = { platforms: [], scope: 'global', needsMenu: true };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows no flags (triggers menu)', () => {
      const argv = ['node', 'install.js'];
      const config = { platforms: [], scope: 'local', needsMenu: true };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows short form -g', () => {
      const argv = ['node', 'install.js', '--claude', '-g'];
      const config = { platforms: ['claude'], scope: 'global', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('allows short form -l', () => {
      const argv = ['node', 'install.js', '--claude', '-l'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Edge cases', () => {
    test('handles flags in different positions', () => {
      const argv = ['node', '--global', 'install.js', '--local'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
    });
    
    test('does not false-positive on --locale vs --local', () => {
      const argv = ['node', 'install.js', '--claude', '--locale'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      // --locale is different from --local, should not trigger conflict
      validateFlags(argv, config);
      
      expect(processExitSpy).not.toHaveBeenCalled();
    });
    
    test('validates even when needsMenu is true', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: [], scope: 'local', needsMenu: true };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
    });
  });
  
  describe('Error message format', () => {
    test('error message is red/colored', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      // Check that error contains ANSI color codes (red)
      const errorMessage = consoleErrorSpy.mock.calls[0][0];
      expect(errorMessage).toContain('\x1b['); // ANSI escape code
    });
    
    test('error message includes both flags', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      const errorMessage = consoleErrorSpy.mock.calls[0][0];
      expect(errorMessage).toContain('--local');
      expect(errorMessage).toContain('--global');
    });
    
    test('error message is actionable', () => {
      const argv = ['node', 'install.js', '--local', '--global'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      const errorMessage = consoleErrorSpy.mock.calls[0][0];
      expect(errorMessage).toContain('Choose one');
    });
  });
  
  describe('Config parameter ignored when checking argv', () => {
    test('checks raw argv not config.scope', () => {
      // Validator should check argv for presence of flags, not rely on config
      const argv = ['node', 'install.js', '--local', '--global', '--claude'];
      const config = { platforms: ['claude'], scope: 'local', needsMenu: false };
      
      validateFlags(argv, config);
      
      expect(processExitSpy).toHaveBeenCalledWith(2);
    });
  });
});
