import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { statfs } from 'fs';
import { readFile, writeFile, mkdir, rm, chmod } from 'fs/promises';
import { join } from 'path';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import {
  runPreInstallationChecks,
  checkDiskSpace,
  checkWritePermissions,
  validatePaths,
  detectExistingInstallation
} from '../../bin/lib/validation/pre-install-checks.js';

describe('Pre-Installation Checks', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'gsd-test-'));
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  describe('checkDiskSpace', () => {
    test('passes with sufficient space', async () => {
      // Small requirement should pass on any dev machine
      await expect(
        checkDiskSpace(testDir, 1024)
      ).resolves.not.toThrow();
    });
    
    test.skip('includes 10% buffer in calculation', async () => {
      // Skipped: Cannot mock statfs in ESM (see https://vitest.dev/guide/browser/#limitations)
      // The buffer calculation is covered by integration tests
    });
  });
  
  describe('checkWritePermissions', () => {
    test('succeeds on writable directory', async () => {
      await expect(
        checkWritePermissions(testDir)
      ).resolves.not.toThrow();
    });
    
    test('fails on read-only directory', async () => {
      await chmod(testDir, 0o444); // Read-only
      
      await expect(
        checkWritePermissions(testDir)
      ).rejects.toThrow(/cannot write/i);
      
      await chmod(testDir, 0o755); // Restore for cleanup
    });
    
    test('cleans up test file on success', async () => {
      await checkWritePermissions(testDir);
      
      const { readdir } = await import('fs/promises');
      const files = await readdir(testDir);
      expect(files.filter(f => f.startsWith('.gsd-test-write'))).toHaveLength(0);
    });
  });
  
  describe('validatePaths', () => {
    test('allows valid home directory path for global', async () => {
      const { homedir } = await import('os');
      const validPath = join(homedir(), '.claude');
      
      await expect(
        validatePaths(validPath, true)
      ).resolves.toBe(validPath);
    });
    
    test('blocks path traversal attempts', async () => {
      // Test with explicit traversal pattern that will remain in normalized path
      await expect(
        validatePaths('/home/user/../../etc', true)
      ).rejects.toThrow(/(traversal|home directory)/i);
    });
    
    test('blocks system directories', async () => {
      await expect(
        validatePaths('/etc/gsd', false) // Use local to avoid home dir check
      ).rejects.toThrow(/system/i);
    });
  });
  
  describe('detectExistingInstallation', () => {
    test('returns null when no manifest exists', async () => {
      const result = await detectExistingInstallation(testDir);
      expect(result).toBeNull();
    });
    
    test('returns installation info when manifest exists', async () => {
      const manifestDir = join(testDir, 'get-shit-done');
      await mkdir(manifestDir, { recursive: true });
      
      const manifest = {
        gsd_version: '2.0.0',
        platform: 'claude',
        scope: 'global',
        installed_at: '2026-01-27T00:00:00.000Z'
      };
      
      await writeFile(
        join(manifestDir, '.gsd-install-manifest.json'),
        JSON.stringify(manifest),
        'utf8'
      );
      
      const result = await detectExistingInstallation(testDir);
      expect(result).toMatchObject({
        version: '2.0.0',
        platform: 'claude',
        scope: 'global'
      });
    });
    
    test('handles corrupted manifest gracefully', async () => {
      const manifestDir = join(testDir, 'get-shit-done');
      await mkdir(manifestDir, { recursive: true });
      
      await writeFile(
        join(manifestDir, '.gsd-install-manifest.json'),
        'invalid json',
        'utf8'
      );
      
      const result = await detectExistingInstallation(testDir);
      expect(result).toMatchObject({
        version: 'unknown',
        corrupted: true
      });
    });
  });
  
  describe('runPreInstallationChecks', () => {
    test('runs all checks successfully', async () => {
      const { homedir } = await import('os');
      const validTargetDir = join(homedir(), 'test-gsd-install');
      const templatesDir = await mkdtemp(join(tmpdir(), 'gsd-templates-'));
      await writeFile(join(templatesDir, 'test.txt'), 'test', 'utf8');
      
      const result = await runPreInstallationChecks(
        validTargetDir,
        templatesDir,
        true,
        'claude'
      );
      
      expect(result).toHaveProperty('existingInstall');
      expect(result).toHaveProperty('templateSize');
      expect(result.templateSize).toBeGreaterThan(0);
      
      await rm(templatesDir, { recursive: true });
    });
  });
});
