import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { readManifest } from '../../bin/lib/manifests/reader.js';
import { repairManifest } from '../../bin/lib/manifests/repair.js';

describe('manifest reader and repair', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `gsd-test-reader-${Date.now()}`);
    await fs.ensureDir(testDir);
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
  describe('readManifest', () => {
    it('should read valid manifest', async () => {
      const manifestPath = path.join(testDir, '.gsd-install-manifest.json');
      const manifest = {
        gsd_version: '2.0.0',
        platform: 'claude',
        scope: 'local',
        installed_at: new Date().toISOString(),
        files: []
      };
      await fs.writeJson(manifestPath, manifest);
      
      const result = await readManifest(manifestPath);
      expect(result.success).toBe(true);
      expect(result.manifest.gsd_version).toBe('2.0.0');
    });
    
    it('should return not_found for missing manifest', async () => {
      const manifestPath = path.join(testDir, 'nonexistent.json');
      
      const result = await readManifest(manifestPath);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('not_found');
    });
    
    it('should detect corrupt JSON without auto-repair', async () => {
      const manifestPath = path.join(testDir, '.gsd-install-manifest.json');
      await fs.writeFile(manifestPath, '{invalid json}');
      
      const result = await readManifest(manifestPath);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('corrupt');
    });
    
    it('should detect missing required fields', async () => {
      const manifestPath = path.join(testDir, '.gsd-install-manifest.json');
      await fs.writeJson(manifestPath, { incomplete: true });
      
      const result = await readManifest(manifestPath);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_schema');
    });
  });
  
  describe('repairManifest', () => {
    it('should repair manifest with missing fields', async () => {
      const installDir = path.join(testDir, '.claude', 'get-shit-done');
      await fs.ensureDir(installDir);
      
      const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
      await fs.writeJson(manifestPath, { incomplete: true });
      
      const result = await repairManifest(manifestPath);
      expect(result.success).toBe(true);
      expect(result.repaired).toBe(true);
      expect(result.manifest._repaired).toBe(true);
    });
    
    it('should mark repaired manifests with metadata', async () => {
      const installDir = path.join(testDir, '.claude', 'get-shit-done');
      await fs.ensureDir(installDir);
      
      // Create some files to scan
      await fs.writeFile(path.join(installDir, 'test.txt'), 'test');
      
      const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
      await fs.writeJson(manifestPath, { partial: true });
      
      const result = await repairManifest(manifestPath);
      expect(result.success).toBe(true);
      expect(result.manifest._repaired).toBe(true);
      expect(result.manifest._repair_date).toBeDefined();
      expect(result.manifest._repair_reason).toBe('corrupt_or_incomplete');
    });
    
    it('should use string array for files (not object array)', async () => {
      const installDir = path.join(testDir, '.codex', 'get-shit-done');
      await fs.ensureDir(installDir);
      await fs.writeFile(path.join(installDir, 'test.txt'), 'test');
      
      const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
      await fs.writeFile(manifestPath, '{invalid}');
      
      const result = await repairManifest(manifestPath);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.manifest.files)).toBe(true);
      // Should be string array, not object array
      if (result.manifest.files.length > 0) {
        expect(typeof result.manifest.files[0]).toBe('string');
      }
    });
  });
});
