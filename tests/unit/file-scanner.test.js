import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { scanInstallationFiles, hasInstallationFiles } from '../../bin/lib/utils/file-scanner.js';

describe('file-scanner', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `.gsd-test-file-scanner-${Math.random().toString(36).slice(2)}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('scanInstallationFiles', () => {
    it('should scan and return all files recursively', async () => {
      // Create test file structure
      await fs.writeFile(path.join(testDir, 'file1.txt'), 'content');
      await fs.ensureDir(path.join(testDir, 'subdir'));
      await fs.writeFile(path.join(testDir, 'subdir', 'file2.txt'), 'content');
      await fs.ensureDir(path.join(testDir, 'subdir', 'nested'));
      await fs.writeFile(path.join(testDir, 'subdir', 'nested', 'file3.txt'), 'content');

      const files = await scanInstallationFiles(testDir);

      expect(files).toHaveLength(3);
      expect(files).toContain('file1.txt');
      expect(files).toContain(path.join('subdir', 'file2.txt'));
      expect(files).toContain(path.join('subdir', 'nested', 'file3.txt'));
    });

    it('should exclude files with specified prefix', async () => {
      await fs.writeFile(path.join(testDir, 'normal.txt'), 'content');
      await fs.writeFile(path.join(testDir, '.gsd-manifest.json'), 'manifest');
      await fs.writeFile(path.join(testDir, '.gsd-backup.json'), 'backup');

      const files = await scanInstallationFiles(testDir);

      expect(files).toHaveLength(1);
      expect(files).toContain('normal.txt');
      expect(files).not.toContain('.gsd-manifest.json');
      expect(files).not.toContain('.gsd-backup.json');
    });

    it('should use custom exclude prefix', async () => {
      await fs.writeFile(path.join(testDir, 'keep.txt'), 'content');
      await fs.writeFile(path.join(testDir, '.gsd-manifest.json'), 'manifest');
      await fs.writeFile(path.join(testDir, 'temp-file.txt'), 'temp');

      const files = await scanInstallationFiles(testDir, 'temp-');

      expect(files).toHaveLength(2);
      expect(files).toContain('keep.txt');
      expect(files).toContain('.gsd-manifest.json');
      expect(files).not.toContain('temp-file.txt');
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await scanInstallationFiles(path.join(testDir, 'nonexistent'));

      expect(files).toEqual([]);
    });

    it('should return empty array for empty directory', async () => {
      const files = await scanInstallationFiles(testDir);

      expect(files).toEqual([]);
    });

    it('should return sorted file list', async () => {
      await fs.writeFile(path.join(testDir, 'z-file.txt'), 'content');
      await fs.writeFile(path.join(testDir, 'a-file.txt'), 'content');
      await fs.writeFile(path.join(testDir, 'm-file.txt'), 'content');

      const files = await scanInstallationFiles(testDir);

      expect(files).toEqual(['a-file.txt', 'm-file.txt', 'z-file.txt']);
    });

    it('should only include files, not directories', async () => {
      await fs.writeFile(path.join(testDir, 'file.txt'), 'content');
      await fs.ensureDir(path.join(testDir, 'empty-dir'));
      await fs.ensureDir(path.join(testDir, 'another-dir'));

      const files = await scanInstallationFiles(testDir);

      expect(files).toEqual(['file.txt']);
    });
  });

  describe('hasInstallationFiles', () => {
    it('should return true for directory with files', async () => {
      await fs.writeFile(path.join(testDir, 'file.txt'), 'content');

      const result = await hasInstallationFiles(testDir);

      expect(result).toBe(true);
    });

    it('should return true for directory with subdirectories', async () => {
      await fs.ensureDir(path.join(testDir, 'subdir'));

      const result = await hasInstallationFiles(testDir);

      expect(result).toBe(true);
    });

    it('should return false for empty directory', async () => {
      const result = await hasInstallationFiles(testDir);

      expect(result).toBe(false);
    });

    it('should return false for non-existent directory', async () => {
      const result = await hasInstallationFiles(path.join(testDir, 'nonexistent'));

      expect(result).toBe(false);
    });

    it('should return false for directory with only hidden directories', async () => {
      await fs.ensureDir(path.join(testDir, '.hidden'));

      const result = await hasInstallationFiles(testDir);

      expect(result).toBe(false);
    });
  });
});
