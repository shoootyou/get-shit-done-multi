// tests/integration/installer.test.js

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { install } from '../../bin/lib/installer/orchestrator.js';
import { ClaudeAdapter } from '../../bin/lib/platforms/claude/adapter.js';
import { createTestDir, cleanupTestDir, createMinimalTemplates } from '../helpers/test-utils.js';
import { pathExists, readFile, ensureDirectory } from '../../bin/lib/io/file-operations.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('installer integration', () => {
  let testDir;
  let templatesDir;
  
  beforeEach(async () => {
    testDir = await createTestDir();
    templatesDir = await createMinimalTemplates(testDir);
  });
  
  afterEach(async () => {
    await cleanupTestDir(testDir);
  });
  
  describe('install', () => {
    it('should install skills, agents, and shared directory', async () => {
      const targetDir = join(testDir, '.claude');
      
      // Create bin directory for proper structure
      // scriptDir will be testDir/bin, templates at testDir/templates
      const binDir = join(testDir, 'bin');
      await ensureDirectory(binDir);
      
      const adapter = new ClaudeAdapter();
      const options = {
        platform: 'claude',
        adapter,
        isGlobal: false,
        isVerbose: false,
        scriptDir: binDir, // templates/ is ../templates/ from bin/
        targetDir // Override for test isolation
      };
      
      const stats = await install('2.0.0', options);
      
      // Check stats
      expect(stats.skills).toBeGreaterThan(0);
      expect(stats.agents).toBeGreaterThan(0);
      expect(stats.shared).toBe(1);
      
      // Check structure exists
      expect(await pathExists(join(targetDir, 'skills'))).toBe(true);
      expect(await pathExists(join(targetDir, 'agents'))).toBe(true);
      expect(await pathExists(join(targetDir, 'get-shit-done'))).toBe(true);
    });
    
    it('should replace template variables', async () => {
      const targetDir = join(testDir, '.claude');
      const binDir = join(testDir, 'bin');
      await ensureDirectory(binDir);
      
      const adapter = new ClaudeAdapter();
      const options = {
        platform: 'claude',
        adapter,
        isGlobal: false,
        isVerbose: false,
        scriptDir: binDir,
        targetDir
      };
      
      await install('2.0.0', options);
      
      // Check skill file has variables replaced
      const skillFile = join(targetDir, 'skills', 'gsd-test-skill', 'SKILL.md');
      const content = await readFile(skillFile);
      
      expect(content).not.toContain('{{PLATFORM_ROOT}}');
      expect(content).toContain('.claude/skills/');
      expect(content).toContain('/gsd-test-skill');
    });
    
    it('should generate manifest file', async () => {
      const targetDir = join(testDir, '.claude');
      const binDir = join(testDir, 'bin');
      await ensureDirectory(binDir);
      
      const adapter = new ClaudeAdapter();
      const options = {
        platform: 'claude',
        adapter,
        isGlobal: false,
        isVerbose: false,
        scriptDir: binDir,
        targetDir
      };
      
      await install('2.0.0', options);
      
      const manifestFile = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
      expect(await pathExists(manifestFile)).toBe(true);
      
      const content = await readFile(manifestFile);
      const manifest = JSON.parse(content);
      
      expect(manifest).toMatchObject({
        gsd_version: '2.0.0',
        platform: 'claude',
        scope: 'local'
      });
      expect(manifest.installed_at).toBeDefined();
      expect(manifest.files).toBeDefined(); // Manifest should have files list
    });
    
    it('should handle global installation', async () => {
      const targetDir = join(testDir, '.claude-global');
      const binDir = join(testDir, 'bin');
      await ensureDirectory(binDir);
      
      const adapter = new ClaudeAdapter();
      const options = {
        platform: 'claude',
        adapter,
        isGlobal: true,
        isVerbose: false,
        scriptDir: binDir,
        targetDir
      };
      
      // Should not throw
      const stats = await install('2.0.0', options);
      expect(stats).toBeDefined();
    });
    
    it('should handle verbose mode', async () => {
      const targetDir = join(testDir, '.claude-verbose');
      const binDir = join(testDir, 'bin');
      await ensureDirectory(binDir);
      
      const adapter = new ClaudeAdapter();
      const options = {
        platform: 'claude',
        adapter,
        isGlobal: false,
        isVerbose: true,
        scriptDir: binDir,
        targetDir
      };
      
      // Should not throw, output will differ but result same
      const stats = await install('2.0.0', options);
      expect(stats).toBeDefined();
    });
  });
});
