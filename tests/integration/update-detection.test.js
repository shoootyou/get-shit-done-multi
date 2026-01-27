import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { findInstallations } from '../../bin/lib/version/installation-finder.js';
import { readManifest } from '../../bin/lib/manifests/reader.js';
import { repairManifest } from '../../bin/lib/manifests/repair.js';
import { compareVersions, formatPlatformOption } from '../../bin/lib/version/version-checker.js';

describe('update-detection integration', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `gsd-test-update-${Date.now()}`);
    await fs.ensureDir(testDir);
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
  it('should detect outdated local installation', async () => {
    // Setup: Create local installation with old version
    const installDir = path.join(testDir, '.claude', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    const manifest = {
      gsd_version: '1.9.5',
      platform: 'claude',
      scope: 'local',
      installed_at: new Date().toISOString(),
      files: []
    };
    
    const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
    await fs.writeJson(manifestPath, manifest);
    
    // Change to test directory
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      
      // Act: Find and check version
      const found = await findInstallations('local');
      expect(found.length).toBe(1);
      
      const manifestResult = await readManifest(found[0].path);
      expect(manifestResult.success).toBe(true);
      
      const versionStatus = compareVersions(manifestResult.manifest.gsd_version, '1.9.9');
      
      // Assert: Minor/patch update available
      expect(versionStatus.status).toBe('update_available');
      expect(versionStatus.installed).toBe('1.9.5');
      expect(versionStatus.current).toBe('1.9.9');
      
      // Assert: Format displays correctly
      const formatted = formatPlatformOption('claude', versionStatus);
      expect(formatted).toContain('v1.9.5 → v1.9.9');
    } finally {
      process.chdir(originalCwd);
    }
  });
  
  it('should detect major version jump', async () => {
    const installDir = path.join(testDir, '.codex', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    const manifest = {
      gsd_version: '2.5.0',
      platform: 'codex',
      scope: 'local',
      installed_at: new Date().toISOString(),
      files: []
    };
    
    await fs.writeJson(path.join(installDir, '.gsd-install-manifest.json'), manifest);
    
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      
      const found = await findInstallations('local');
      const manifestResult = await readManifest(found[0].path);
      const versionStatus = compareVersions(manifestResult.manifest.gsd_version, '3.0.0');
      
      expect(versionStatus.status).toBe('major_update');
      expect(versionStatus.majorJump).toBe('2.x → 3.x');
      
      const formatted = formatPlatformOption('codex', versionStatus);
      expect(formatted).toContain('⚠️  major');
    } finally {
      process.chdir(originalCwd);
    }
  });
  
  it('should handle up-to-date installation', async () => {
    const installDir = path.join(testDir, '.github', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    const manifest = {
      gsd_version: '2.0.0',
      platform: 'copilot',
      scope: 'local',
      installed_at: new Date().toISOString(),
      files: []
    };
    
    await fs.writeJson(path.join(installDir, '.gsd-install-manifest.json'), manifest);
    
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      
      const found = await findInstallations('local');
      const manifestResult = await readManifest(found[0].path);
      const versionStatus = compareVersions(manifestResult.manifest.gsd_version, '2.0.0');
      
      expect(versionStatus.status).toBe('up_to_date');
      
      const formatted = formatPlatformOption('copilot', versionStatus);
      expect(formatted).toBe('GitHub Copilot (v2.0.0)');
    } finally {
      process.chdir(originalCwd);
    }
  });
  
  it('should handle multiple platforms', async () => {
    // Create installations for all three platforms
    const platforms = [
      { dir: '.claude', platform: 'claude', version: '1.8.0' },
      { dir: '.github', platform: 'copilot', version: '2.0.0' },
      { dir: '.codex', platform: 'codex', version: '2.1.0' }
    ];
    
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      
      for (const p of platforms) {
        const installDir = path.join(testDir, p.dir, 'get-shit-done');
        await fs.ensureDir(installDir);
        
        const manifest = {
          gsd_version: p.version,
          platform: p.platform,
          scope: 'local',
          installed_at: new Date().toISOString(),
          files: []
        };
        
        await fs.writeJson(path.join(installDir, '.gsd-install-manifest.json'), manifest);
      }
      
      const found = await findInstallations('local');
      expect(found.length).toBe(3);
      
      // Check version statuses
      const statuses = await Promise.all(
        found.map(async (install) => {
          const manifestResult = await readManifest(install.path);
          return {
            platform: install.platform,
            status: compareVersions(manifestResult.manifest.gsd_version, '2.0.0')
          };
        })
      );
      
      const claudeStatus = statuses.find(s => s.platform === 'claude');
      expect(claudeStatus.status.status).toBe('major_update'); // 1.8.0 → 2.0.0 is major
      
      const copilotStatus = statuses.find(s => s.platform === 'copilot');
      expect(copilotStatus.status.status).toBe('up_to_date');
      
      const codexStatus = statuses.find(s => s.platform === 'codex');
      expect(codexStatus.status.status).toBe('downgrade'); // 2.1.0 > 2.0.0
    } finally {
      process.chdir(originalCwd);
    }
  });
  
  it('should repair corrupted manifest and detect version', async () => {
    const installDir = path.join(testDir, '.claude', 'get-shit-done');
    await fs.ensureDir(installDir);
    
    // Create some files
    await fs.writeFile(path.join(installDir, 'test.txt'), 'test content');
    
    // Write corrupted manifest
    const manifestPath = path.join(installDir, '.gsd-install-manifest.json');
    await fs.writeJson(manifestPath, { partial: true });
    
    const originalCwd = process.cwd();
    try {
      process.chdir(testDir);
      
      const found = await findInstallations('local');
      let manifestResult = await readManifest(found[0].path);
      
      // Should detect as corrupt
      expect(manifestResult.success).toBe(false);
      expect(manifestResult.reason).toBe('invalid_schema');
      
      // Explicitly repair
      manifestResult = await repairManifest(found[0].path);
      
      // Should succeed after repair
      expect(manifestResult.success).toBe(true);
      expect(manifestResult.repaired).toBe(true);
      expect(manifestResult.manifest._repaired).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
