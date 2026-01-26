// tests/unit/file-operations.test.js

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ensureDirectory, writeFile, readFile, pathExists } from '../../bin/lib/io/file-operations.js';
import { createTestDir, cleanupTestDir } from '../helpers/test-utils.js';
import { join } from 'path';

describe('file-operations', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await createTestDir();
  });
  
  afterEach(async () => {
    await cleanupTestDir(testDir);
  });
  
  describe('ensureDirectory', () => {
    it('should create directory', async () => {
      const dir = join(testDir, 'subdir');
      await ensureDirectory(dir);
      const exists = await pathExists(dir);
      expect(exists).toBe(true);
    });
    
    it('should create nested directories', async () => {
      const dir = join(testDir, 'a', 'b', 'c');
      await ensureDirectory(dir);
      const exists = await pathExists(dir);
      expect(exists).toBe(true);
    });
  });
  
  describe('writeFile', () => {
    it('should write file', async () => {
      const file = join(testDir, 'test.txt');
      await writeFile(file, 'content');
      const exists = await pathExists(file);
      expect(exists).toBe(true);
    });
    
    it('should create parent directories', async () => {
      const file = join(testDir, 'subdir', 'test.txt');
      await writeFile(file, 'content');
      const exists = await pathExists(file);
      expect(exists).toBe(true);
    });
  });
  
  describe('readFile', () => {
    it('should read file content', async () => {
      const file = join(testDir, 'test.txt');
      await writeFile(file, 'hello world');
      const content = await readFile(file);
      expect(content).toBe('hello world');
    });
  });
  
  describe('pathExists', () => {
    it('should return true for existing path', async () => {
      const file = join(testDir, 'test.txt');
      await writeFile(file, 'content');
      const exists = await pathExists(file);
      expect(exists).toBe(true);
    });
    
    it('should return false for non-existing path', async () => {
      const file = join(testDir, 'nonexistent.txt');
      const exists = await pathExists(file);
      expect(exists).toBe(false);
    });
  });
});
