// tests/unit/path-resolver.test.js

import { describe, it, expect } from 'vitest';
import { resolveTargetDirectory, validatePath, normalizePath, joinPaths } from '../../bin/lib/paths/path-resolver.js';
import { homedir } from 'os';
import { join } from 'path';

describe('path-resolver', () => {
  describe('resolveTargetDirectory', () => {
    it('should resolve global directory', () => {
      const result = resolveTargetDirectory(true, 'claude');
      expect(result).toBe(join(homedir(), '.claude'));
    });
    
    it('should resolve local directory', () => {
      const result = resolveTargetDirectory(false, 'claude');
      expect(result).toBe(join(process.cwd(), '.claude'));
    });
  });
  
  describe('validatePath', () => {
    it('should accept valid paths', () => {
      const base = '/tmp/test';
      const target = '/tmp/test/subdir';
      expect(() => validatePath(target, base)).not.toThrow();
    });
    
    it('should reject path traversal attempts', () => {
      const base = '/tmp/test';
      const target = '/tmp/test/../etc/passwd';
      expect(() => validatePath(target, base)).toThrow('outside target directory');
    });
    
    it('should reject paths with .. pattern', () => {
      expect(() => validatePath('/tmp/../etc', '/tmp')).toThrow('outside target directory');
    });
  });
  
  describe('normalizePath', () => {
    it('should normalize paths', () => {
      const result = normalizePath('/tmp//test/./file');
      expect(result).toBe(join('/tmp', 'test', 'file'));
    });
  });
  
  describe('joinPaths', () => {
    it('should join paths correctly', () => {
      const result = joinPaths('/tmp', 'test', 'file.txt');
      expect(result).toBe(join('/tmp', 'test', 'file.txt'));
    });
  });
});
