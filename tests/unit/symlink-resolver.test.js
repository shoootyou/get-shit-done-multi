// tests/unit/symlink-resolver.test.js

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveSymlinkSingleLevel, isSymlink } from '../../bin/lib/paths/symlink-resolver.js';
import { mkdir, writeFile, symlink, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('symlink-resolver', () => {
  let testDir;
  
  beforeEach(async () => {
    // Create test directory in /tmp
    testDir = join(tmpdir(), `gsd-test-symlink-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    // Cleanup
    await rm(testDir, { recursive: true, force: true });
  });
  
  describe('resolveSymlinkSingleLevel', () => {
    it('should return isSymlink=false for regular file', async () => {
      const filePath = join(testDir, 'regular.txt');
      await writeFile(filePath, 'content');
      
      const result = await resolveSymlinkSingleLevel(filePath);
      
      expect(result.isSymlink).toBe(false);
      expect(result.target).toBe(filePath);
    });
    
    it('should return isSymlink=false for regular directory', async () => {
      const dirPath = join(testDir, 'regular-dir');
      await mkdir(dirPath);
      
      const result = await resolveSymlinkSingleLevel(dirPath);
      
      expect(result.isSymlink).toBe(false);
      expect(result.target).toBe(dirPath);
    });
    
    it('should resolve symlink to file', async () => {
      const targetFile = join(testDir, 'target.txt');
      await writeFile(targetFile, 'content');
      
      const symlinkPath = join(testDir, 'link.txt');
      await symlink(targetFile, symlinkPath);
      
      const result = await resolveSymlinkSingleLevel(symlinkPath);
      
      expect(result.isSymlink).toBe(true);
      expect(result.original).toBe(symlinkPath);
      expect(result.target).toBe(targetFile);
    });
    
    it('should resolve symlink to directory', async () => {
      const targetDir = join(testDir, 'target-dir');
      await mkdir(targetDir);
      
      const symlinkPath = join(testDir, 'link-dir');
      await symlink(targetDir, symlinkPath);
      
      const result = await resolveSymlinkSingleLevel(symlinkPath);
      
      expect(result.isSymlink).toBe(true);
      expect(result.target).toBe(targetDir);
    });
    
    it('should reject symlink chains', async () => {
      const targetFile = join(testDir, 'final.txt');
      await writeFile(targetFile, 'content');
      
      const link1 = join(testDir, 'link1.txt');
      await symlink(targetFile, link1);
      
      const link2 = join(testDir, 'link2.txt');
      await symlink(link1, link2);
      
      await expect(resolveSymlinkSingleLevel(link2))
        .rejects.toThrow('Symlink chain detected');
    });
    
    it('should reject broken symlinks', async () => {
      const symlinkPath = join(testDir, 'broken-link');
      const nonExistent = join(testDir, 'does-not-exist');
      await symlink(nonExistent, symlinkPath);
      
      await expect(resolveSymlinkSingleLevel(symlinkPath))
        .rejects.toThrow('Broken symlink');
    });
    
    it('should return isSymlink=false for non-existent path', async () => {
      const nonExistent = join(testDir, 'does-not-exist');
      
      const result = await resolveSymlinkSingleLevel(nonExistent);
      
      expect(result.isSymlink).toBe(false);
      expect(result.original).toBe(nonExistent);
      expect(result.target).toBe(nonExistent);
    });
  });
  
  describe('isSymlink', () => {
    it('should return false for regular file', async () => {
      const filePath = join(testDir, 'regular.txt');
      await writeFile(filePath, 'content');
      
      expect(await isSymlink(filePath)).toBe(false);
    });
    
    it('should return true for symlink', async () => {
      const targetFile = join(testDir, 'target.txt');
      await writeFile(targetFile, 'content');
      
      const symlinkPath = join(testDir, 'link.txt');
      await symlink(targetFile, symlinkPath);
      
      expect(await isSymlink(symlinkPath)).toBe(true);
    });
    
    it('should return false for non-existent path', async () => {
      const nonExistent = join(testDir, 'does-not-exist');
      
      expect(await isSymlink(nonExistent)).toBe(false);
    });
  });
});
