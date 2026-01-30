import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, mkdir, rm, chmod } from 'fs/promises';
import { join } from 'path';
import { mkdtemp } from 'fs/promises';
import { homedir } from 'os';
import { install } from '../../bin/lib/installer/orchestrator.js';
import { ClaudeAdapter } from '../../bin/lib/platforms/claude-adapter.js';

describe('Phase 5 Integration: Validation + Manifest', () => {
  let testDir;
  let templatesDir;
  let scriptDir;
  
  beforeEach(async () => {
    // Use home directory for tests to avoid system directory blocks
    const home = homedir();
    const baseDir = await mkdtemp(join(home, '.gsd-test-integration-'));
    
    testDir = join(baseDir, 'target');
    scriptDir = join(baseDir, 'bin'); // scriptDir points to bin/
    templatesDir = join(baseDir, 'templates'); // templates/ is sibling to bin/
    
    await mkdir(testDir, { recursive: true });
    await mkdir(scriptDir, { recursive: true });
    
    // Create minimal template structure
    await mkdir(join(templatesDir, 'skills', 'gsd-test'), { recursive: true });
    await writeFile(
      join(templatesDir, 'skills', 'gsd-test', 'SKILL.md'),
      '---\nname: test\n---\nTest skill',
      'utf8'
    );
    await writeFile(
      join(templatesDir, 'skills', 'gsd-test', 'version.json'),
      '{"skill_version": "1.0.0"}',
      'utf8'
    );
    await mkdir(join(templatesDir, 'agents'), { recursive: true });
    await mkdir(join(templatesDir, 'get-shit-done'), { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up base directory (contains target, bin, templates)
    const baseDir = join(scriptDir, '..');
    await rm(baseDir, { recursive: true, force: true });
  });
  
  test('successful installation generates manifest', async () => {
    const adapter = new ClaudeAdapter();
    
    const stats = await install('2.0.0', {
      platform: 'claude',
      adapter: adapter,
      isGlobal: false,
      isVerbose: false,
      scriptDir: scriptDir,
      targetDir: testDir
    });
    
    // Check manifest was created
    const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
    const content = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    expect(manifest.gsd_version).toBe('2.0.0');
    expect(manifest.platform).toBe('claude');
    expect(manifest.scope).toBe('local');
    expect(manifest.files).toBeInstanceOf(Array);
    expect(manifest.files.length).toBeGreaterThan(0);
  });
  
  test('validation fails on read-only directory', async () => {
    await chmod(testDir, 0o444); // Read-only
    
    const adapter = new ClaudeAdapter();
    
    await expect(
      install('2.0.0', {
        platform: 'claude',
        adapter: adapter,
        isGlobal: false,
        isVerbose: false,
        scriptDir: scriptDir,
        targetDir: testDir
      })
    ).rejects.toThrow(/Cannot write to directory|permission/i);
    
    await chmod(testDir, 0o755); // Restore for cleanup
    
    // Check no manifest was created (failed before installation)
    const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
    await expect(readFile(manifestPath)).rejects.toThrow();
  });
  
  test('validation detects existing installation', async () => {
    // Create existing installation manifest
    await mkdir(join(testDir, 'get-shit-done'), { recursive: true });
    const existingManifest = {
      gsd_version: '1.9.0',
      platform: 'claude',
      scope: 'local',
      installed_at: '2026-01-01T00:00:00.000Z',
      files: []
    };
    await writeFile(
      join(testDir, 'get-shit-done', '.gsd-install-manifest.json'),
      JSON.stringify(existingManifest),
      'utf8'
    );
    
    const adapter = new ClaudeAdapter();
    
    // Should succeed and overwrite
    const stats = await install('2.0.0', {
      platform: 'claude',
      adapter: adapter,
      isGlobal: false,
      isVerbose: false,
      scriptDir: scriptDir,
      targetDir: testDir
    });
    
    // Check manifest was updated
    const manifestPath = join(testDir, 'get-shit-done', '.gsd-install-manifest.json');
    const content = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    expect(manifest.gsd_version).toBe('2.0.0'); // Updated
  });
});
