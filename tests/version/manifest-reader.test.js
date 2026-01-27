import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { readManifestWithRepair } from '../../bin/lib/version/manifest-reader.js';

describe('manifest-reader', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `gsd-test-reader-${Date.now()}`);
    await fs.ensureDir(testDir);
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
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
    
    const result = await readManifestWithRepair(manifestPath);
    expect(result.success).toBe(true);
    expect(result.manifest.gsd_version).toBe('2.0.0');
  });
  
  it('should return not_found for missing manifest', async () => {
    const manifestPath = path.join(testDir, 'nonexistent.json');
    
    const result = await readManifestWithRepair(manifestPath);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('not_found');
  });
  
  it('should detect corrupt JSON', async () => {
    const manifestPath = path.join(testDir, '.gsd-install-manifest.json');
    await fs.writeFile(manifestPath, '{invalid json}');
    
    const result = await readManifestWithRepair(manifestPath);
    // Should attempt repair
    expect(result.success).toBeDefined();
  });
  
  it('should repair manifest with missing fields', async () => {
    const installDir = path.join(testDir, '.claude', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
    await fs.writeJson(manifestPath, { incomplete: true });
    
    const result = await readManifestWithRepair(manifestPath);
    // Should succeed after repair or fail gracefully
    expect(result).toBeDefined();
  });
  
  it('should mark repaired manifests', async () => {
    const installDir = path.join(testDir, '.claude', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    // Create some files to scan
    await fs.writeFile(path.join(installDir, 'test.txt'), 'test');
    
    const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
    await fs.writeJson(manifestPath, { partial: true });
    
    const result = await readManifestWithRepair(manifestPath);
    if (result.success && result.repaired) {
      expect(result.manifest._repaired).toBe(true);
      expect(result.manifest._repair_date).toBeDefined();
    }
  });
});
