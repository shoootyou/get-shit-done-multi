// tests/unit/path-validator.test.js

import { describe, it, expect } from 'vitest';
import { validatePath, validateAllPaths, isWindowsReservedName } from '../../bin/lib/validation/path-validator.js';
import { tmpdir } from 'os';
import { join } from 'path';

describe('path-validator', () => {
  const basePath = tmpdir();
  
  describe('validatePath - Attack Vector Tests', () => {
    it('should reject basic path traversal (../)', () => {
      expect(() => validatePath(basePath, '../../../etc/passwd'))
        .toThrow('Path traversal detected');
    });
    
    it('should reject URL-encoded path traversal (%2e%2e%2f)', () => {
      expect(() => validatePath(basePath, '%2e%2e%2fetc%2fpasswd'))
        .toThrow('Path traversal detected');
    });
    
    it('should reject absolute paths outside base', () => {
      expect(() => validatePath(basePath, '/etc/passwd'))
        .toThrow('Path escapes base directory');
    });
    
    it('should reject null bytes in path', () => {
      expect(() => validatePath(basePath, 'safe.txt\x00../../evil'))
        .toThrow('Null byte detected');
    });
    
    it('should reject Windows reserved names (CON)', () => {
      expect(() => validatePath(basePath, '.claude/CON'))
        .toThrow('Windows reserved name');
    });
    
    it('should reject Windows reserved names with extension (PRN.txt)', () => {
      expect(() => validatePath(basePath, '.github/PRN.txt'))
        .toThrow('Windows reserved name');
    });
    
    it('should reject Windows reserved names case-insensitive (con, CoN)', () => {
      expect(() => validatePath(basePath, '.codex/con'))
        .toThrow('Windows reserved name');
      expect(() => validatePath(basePath, '.claude/CoN.md'))
        .toThrow('Windows reserved name');
    });
    
    it('should reject paths outside allowlist', () => {
      expect(() => validatePath(basePath, 'evil/file.txt'))
        .toThrow('Path not in allowlist');
      expect(() => validatePath(basePath, '../attacker/payload'))
        .toThrow('Path traversal detected');
    });
    
    it('should reject paths exceeding max length', () => {
      const longPath = '.claude/' + 'a'.repeat(5000);
      expect(() => validatePath(basePath, longPath))
        .toThrow('Path exceeds maximum length');
    });
    
    it('should reject components exceeding 255 characters', () => {
      const longComponent = 'a'.repeat(300);
      expect(() => validatePath(basePath, `.github/${longComponent}.txt`))
        .toThrow('Component exceeds 255 characters');
    });
  });
  
  describe('validatePath - Valid Paths', () => {
    it('should allow valid .claude path', () => {
      const result = validatePath(basePath, '.claude/skills/test.md');
      expect(result.normalized).toContain('.claude');
      expect(result.resolved).toBeTruthy();
    });
    
    it('should allow valid .github path', () => {
      const result = validatePath(basePath, '.github/agents/test.md');
      expect(result.normalized).toContain('.github');
    });
    
    it('should allow valid .codex path', () => {
      const result = validatePath(basePath, '.codex/get-shit-done/test.json');
      expect(result.normalized).toContain('.codex');
    });
    
    it('should allow valid get-shit-done path', () => {
      const result = validatePath(basePath, 'get-shit-done/.gsd-install-manifest.json');
      expect(result.normalized).toContain('get-shit-done');
    });
  });
  
  describe('validateAllPaths - Batch Validation', () => {
    it('should collect all errors without stopping', () => {
      const paths = [
        '.claude/valid.md',        // valid
        '../../../etc/passwd',     // invalid
        '.github/CON',             // invalid
        '.codex/good.json',        // valid
        'evil/file.txt'            // invalid
      ];
      
      const results = validateAllPaths(basePath, paths);
      
      expect(results.valid.length).toBe(2);
      expect(results.invalid.length).toBe(3);
      expect(results.totalErrors).toBe(3);
    });
  });
  
  describe('isWindowsReservedName', () => {
    it('should detect all reserved names', () => {
      expect(isWindowsReservedName('CON')).toBe(true);
      expect(isWindowsReservedName('PRN')).toBe(true);
      expect(isWindowsReservedName('AUX')).toBe(true);
      expect(isWindowsReservedName('NUL')).toBe(true);
      expect(isWindowsReservedName('COM1')).toBe(true);
      expect(isWindowsReservedName('LPT9')).toBe(true);
    });
    
    it('should detect reserved names case-insensitively', () => {
      expect(isWindowsReservedName('con')).toBe(true);
      expect(isWindowsReservedName('CoN')).toBe(true);
      expect(isWindowsReservedName('prn')).toBe(true);
    });
    
    it('should detect reserved names with extensions', () => {
      expect(isWindowsReservedName('CON.txt')).toBe(true);
      expect(isWindowsReservedName('PRN.md')).toBe(true);
    });
    
    it('should allow similar but non-reserved names', () => {
      expect(isWindowsReservedName('ICON')).toBe(false);
      expect(isWindowsReservedName('CONCERN')).toBe(false);
      expect(isWindowsReservedName('PRINTER')).toBe(false);
    });
  });
});
