import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import {
  generateAndWriteManifest,
  collectInstalledFiles
} from '../../bin/lib/validation/manifest-generator.js';

describe('Manifest Generation', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'gsd-manifest-test-'));
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  describe('collectInstalledFiles', () => {
    test('collects all files in directory', async () => {
      // Create test structure
      await mkdir(join(testDir, 'skills', 'gsd-test'), { recursive: true });
      await writeFile(join(testDir, 'skills', 'gsd-test', 'SKILL.md'), 'test');
      await writeFile(join(testDir, 'skills', 'gsd-test', 'version.json'), '{}');
      await mkdir(join(testDir, 'agents'), { recursive: true });
      await writeFile(join(testDir, 'agents', 'gsd-test.agent.md'), 'test');
      
      const files = await collectInstalledFiles(testDir);
      
      expect(files).toContain('skills/gsd-test/SKILL.md');
      expect(files).toContain('skills/gsd-test/version.json');
      expect(files).toContain('agents/gsd-test.agent.md');
      expect(files).toHaveLength(3);
    });
    
    test('returns sorted file list', async () => {
      await writeFile(join(testDir, 'z-file.txt'), 'z');
      await writeFile(join(testDir, 'a-file.txt'), 'a');
      await writeFile(join(testDir, 'm-file.txt'), 'm');
      
      const files = await collectInstalledFiles(testDir);
      
      expect(files).toEqual(['a-file.txt', 'm-file.txt', 'z-file.txt']);
    });
    
    test('excludes directories from file list', async () => {
      await mkdir(join(testDir, 'subdir'), { recursive: true });
      await writeFile(join(testDir, 'file.txt'), 'test');
      
      const files = await collectInstalledFiles(testDir);
      
      expect(files).toContain('file.txt');
      expect(files).not.toContain('subdir');
      expect(files).toHaveLength(1);
    });
  });
  
  describe('generateAndWriteManifest', () => {
    test('creates manifest with required fields', async () => {
      await mkdir(join(testDir, 'get-shit-done'), { recursive: true });
      await writeFile(join(testDir, 'test.txt'), 'test');
      
      await generateAndWriteManifest(testDir, '2.0.0', 'claude', true);
      
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      const content = await readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);
      
      expect(manifest).toHaveProperty('gsd_version', '2.0.0');
      expect(manifest).toHaveProperty('platform', 'claude');
      expect(manifest).toHaveProperty('scope', 'global');
      expect(manifest).toHaveProperty('installed_at');
      expect(manifest).toHaveProperty('files');
      expect(Array.isArray(manifest.files)).toBe(true);
    });
    
    test('includes all files including manifest itself', async () => {
      await mkdir(join(testDir, 'skills'), { recursive: true });
      await writeFile(join(testDir, 'skills', 'test.md'), 'test');
      
      await generateAndWriteManifest(testDir, '2.0.0', 'claude', true);
      
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      
      expect(manifest.files).toContain('skills/test.md');
      expect(manifest.files).toContain('get-shit-done/.gsd-install-manifest.json');
    });
    
    test('sets scope to local when isGlobal is false', async () => {
      await mkdir(join(testDir, 'get-shit-done'), { recursive: true });
      
      await generateAndWriteManifest(testDir, '2.0.0', 'copilot', false);
      
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      
      expect(manifest.scope).toBe('local');
    });
    
    test('installed_at is valid ISO timestamp', async () => {
      await mkdir(join(testDir, 'get-shit-done'), { recursive: true });
      
      await generateAndWriteManifest(testDir, '2.0.0', 'codex', true);
      
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      
      const timestamp = new Date(manifest.installed_at);
      expect(timestamp.toISOString()).toBe(manifest.installed_at);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    });
  });
});
