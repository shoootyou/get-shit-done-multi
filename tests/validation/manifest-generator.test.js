import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { generateManifestData, writeManifest } from '../../bin/lib/manifests/writer.js';

describe('Manifest Generation', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'gsd-manifest-test-'));
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  describe('generateManifestData', () => {
    test('creates manifest data with required fields', async () => {
      await mkdir(join(testDir, 'get-shit-done'), { recursive: true });
      await writeFile(join(testDir, 'test.txt'), 'test');
      
      const data = await generateManifestData(testDir, '2.0.0', 'claude', true);
      
      expect(data).toHaveProperty('gsd_version', '2.0.0');
      expect(data).toHaveProperty('platform', 'claude');
      expect(data).toHaveProperty('scope', 'global');
      expect(data).toHaveProperty('installed_at');
      expect(data).toHaveProperty('files');
      expect(Array.isArray(data.files)).toBe(true);
    });
    
    test('collects all files in directory', async () => {
      await mkdir(join(testDir, 'skills', 'gsd-test'), { recursive: true });
      await writeFile(join(testDir, 'skills', 'gsd-test', 'SKILL.md'), 'test');
      await writeFile(join(testDir, 'skills', 'gsd-test', 'version.json'), '{}');
      await mkdir(join(testDir, 'agents'), { recursive: true });
      await writeFile(join(testDir, 'agents', 'gsd-test.agent.md'), 'test');
      
      const data = await generateManifestData(testDir, '2.0.0', 'claude', true);
      
      expect(data.files).toContain('skills/gsd-test/SKILL.md');
      expect(data.files).toContain('skills/gsd-test/version.json');
      expect(data.files).toContain('agents/gsd-test.agent.md');
      expect(data.files).toHaveLength(3);
    });
    
    test('returns sorted file list', async () => {
      await writeFile(join(testDir, 'z-file.txt'), 'z');
      await writeFile(join(testDir, 'a-file.txt'), 'a');
      await writeFile(join(testDir, 'm-file.txt'), 'm');
      
      const data = await generateManifestData(testDir, '2.0.0', 'claude', true);
      
      expect(data.files).toEqual(['a-file.txt', 'm-file.txt', 'z-file.txt']);
    });
    
    test('sets scope to local when isGlobal is false', async () => {
      const data = await generateManifestData(testDir, '2.0.0', 'copilot', false);
      expect(data.scope).toBe('local');
    });
    
    test('installed_at is valid ISO timestamp', async () => {
      const data = await generateManifestData(testDir, '2.0.0', 'codex', true);
      const timestamp = new Date(data.installed_at);
      expect(timestamp.toISOString()).toBe(data.installed_at);
    });
  });
  
  describe('writeManifest', () => {
    test('writes manifest to file', async () => {
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      const data = {
        gsd_version: '2.0.0',
        platform: 'claude',
        scope: 'global',
        installed_at: new Date().toISOString(),
        files: ['test.txt']
      };
      
      await writeManifest(manifestPath, data);
      
      const content = await readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);
      
      expect(manifest).toEqual(data);
    });
  });
  
  describe('Integration: generateManifestData + writeManifest', () => {
    test('full workflow includes manifest file itself', async () => {
      // Create test files
      await mkdir(join(testDir, 'skills'), { recursive: true });
      await writeFile(join(testDir, 'skills', 'test.md'), 'test');
      
      // Generate initial data (without manifest file)
      const initialData = await generateManifestData(testDir, '2.0.0', 'claude', true);
      
      // Write manifest
      const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
      await writeManifest(manifestPath, initialData);
      
      // Re-generate to include manifest file itself
      const finalData = await generateManifestData(testDir, '2.0.0', 'claude', true);
      await writeManifest(manifestPath, finalData);
      
      // Read and verify
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      expect(manifest.files).toContain('skills/test.md');
      expect(manifest.files).toContain('get-shit-done/.gsd-install-manifest.json');
    });
  });
});
