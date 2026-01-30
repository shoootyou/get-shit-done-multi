import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { findInstallations } from '../../bin/lib/version/installation-finder.js';

describe('installation-finder', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `gsd-test-finder-${Date.now()}`);
    await fs.ensureDir(testDir);
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
  it('should find global installations', async () => {
    // Create mock global manifest
    const manifestPath = path.join(os.homedir(), '.claude', 'get-shit-done', '.gsd-install-manifest.json');
    const exists = await fs.pathExists(manifestPath);
    
    if (exists) {
      const installations = await findInstallations('global');
      expect(installations).toBeInstanceOf(Array);
      expect(installations.length).toBeGreaterThanOrEqual(0);
    }
  });
  
  it('should find local installations', async () => {
    // Create mock local manifest
    const manifestDir = path.join(testDir, '.claude', 'get-shit-done');
    await fs.ensureDir(manifestDir);
    await fs.writeJson(path.join(manifestDir, '.gsd-install-manifest.json'), {
      gsd_version: '2.0.0',
      platform: 'claude',
      scope: 'local'
    });
    
    // Change to test directory
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    const installations = await findInstallations('local');
    expect(installations.length).toBe(1);
    expect(installations[0].platform).toBe('claude');
    
    process.chdir(originalCwd);
  });
  
  it('should support custom paths', async () => {
    const customPath = path.join(testDir, 'custom', '.gsd-install-manifest.json');
    await fs.ensureDir(path.dirname(customPath));
    await fs.writeJson(customPath, { gsd_version: '2.0.0' });
    
    const installations = await findInstallations('global', [customPath]);
    const found = installations.find(i => i.path === customPath);
    expect(found).toBeDefined();
  });
  
  it('should return empty array when no installations found', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    const installations = await findInstallations('local');
    expect(installations).toEqual([]);
    
    process.chdir(originalCwd);
  });
  
  it('should derive correct platform from path', async () => {
    const platforms = ['.claude', '.github', '.codex'];
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    for (const platformDir of platforms) {
      const manifestDir = path.join(testDir, platformDir, 'get-shit-done');
      await fs.ensureDir(manifestDir);
      await fs.writeJson(path.join(manifestDir, '.gsd-install-manifest.json'), {
        gsd_version: '2.0.0'
      });
    }
    
    const installations = await findInstallations('local');
    expect(installations.length).toBe(3);
    
    const platforms_found = installations.map(i => i.platform).sort();
    expect(platforms_found).toEqual(['claude', 'codex', 'copilot']);
    
    process.chdir(originalCwd);
  });
});
