// tests/unit/old-version-detector.test.js

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectOldVersion, readOldVersion, getOldInstallationPaths, detectAllOldVersions } from '../../bin/lib/version/old-version-detector.js';
import { createTestDir, cleanupTestDir } from '../helpers/test-utils.js';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

describe('old-version-detector', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = await createTestDir();
  });
  
  afterEach(async () => {
    await cleanupTestDir(testDir);
  });
  
  describe('detectOldVersion() - Claude', () => {
    it('should detect v1.x with VERSION file + commands/gsd directory', async () => {
      // Create old Claude structure
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.isOld).toBe(true);
      expect(result.version).toBe('1.8.0');
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths).toContain('.claude/commands/gsd');
    });
    
    it('should detect v1.x with VERSION file + hooks/gsd-check-update.js', async () => {
      // Create old Claude structure with hooks
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/hooks'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.7.5');
      await writeFile(join(testDir, '.claude/hooks/gsd-check-update.js'), '// hook');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.isOld).toBe(true);
      expect(result.version).toBe('1.7.5');
      expect(result.paths).toContain('.claude/hooks/gsd-check-update.js');
    });
    
    it('should return false when VERSION missing', async () => {
      // Create structure without VERSION file
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.isOld).toBe(false);
      expect(result.version).toBeNull();
      expect(result.paths).toEqual([]);
    });
    
    it('should return false when both commands and hooks missing', async () => {
      // Create only VERSION file
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.isOld).toBe(false);
      expect(result.version).toBeNull();
    });
    
    it('should read version correctly', async () => {
      // Create with version containing whitespace
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '  1.8.0\n');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.version).toBe('1.8.0'); // Should be trimmed
    });
    
    it('should return all installation paths including agents', async () => {
      // Create full old structure
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      await mkdir(join(testDir, '.claude/agents'), { recursive: true });
      await mkdir(join(testDir, '.claude/hooks'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
      await writeFile(join(testDir, '.claude/agents/gsd-planner.md'), '# Agent');
      await writeFile(join(testDir, '.claude/agents/gsd-executor.md'), '# Executor');
      await writeFile(join(testDir, '.claude/hooks/statusline.js'), '// hook');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.paths).toContain('.claude/commands/gsd');
      expect(result.paths).toContain('.claude/get-shit-done');
      expect(result.paths).toContain('.claude/agents/gsd-planner.md');
      expect(result.paths).toContain('.claude/agents/gsd-executor.md');
      expect(result.paths).toContain('.claude/hooks/statusline.js');
    });
    
    it('should exclude .agent.md files from Claude agents', async () => {
      // Create structure with both old (.md) and new (.agent.md) agent files
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      await mkdir(join(testDir, '.claude/agents'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
      await writeFile(join(testDir, '.claude/agents/gsd-planner.md'), '# Old agent');
      await writeFile(join(testDir, '.claude/agents/gsd-new.agent.md'), '# New agent');
      
      const result = await detectOldVersion('claude', testDir);
      
      expect(result.paths).toContain('.claude/agents/gsd-planner.md');
      expect(result.paths).not.toContain('.claude/agents/gsd-new.agent.md');
    });
  });
  
  describe('detectOldVersion() - Copilot', () => {
    it('should detect v1.x with SKILL.md + VERSION file', async () => {
      // Create old Copilot structure
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.8.0');
      
      const result = await detectOldVersion('copilot', testDir);
      
      expect(result.isOld).toBe(true);
      expect(result.version).toBe('1.8.0');
      expect(result.paths).toContain('.github/skills/get-shit-done');
    });
    
    it('should return false when SKILL.md missing', async () => {
      // Create only VERSION
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.8.0');
      
      const result = await detectOldVersion('copilot', testDir);
      
      expect(result.isOld).toBe(false);
    });
    
    it('should return false when VERSION missing', async () => {
      // Create only SKILL.md
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
      
      const result = await detectOldVersion('copilot', testDir);
      
      expect(result.isOld).toBe(false);
    });
    
    it('should return correct paths including agents and issue templates', async () => {
      // Create full old structure
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.github/agents'), { recursive: true });
      await mkdir(join(testDir, '.github/ISSUE_TEMPLATE'), { recursive: true });
      await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.8.0');
      await writeFile(join(testDir, '.github/agents/gsd-planner.agent.md'), '# Agent');
      await writeFile(join(testDir, '.github/ISSUE_TEMPLATE/gsd-bug.yml'), 'template');
      await writeFile(join(testDir, '.github/copilot-instructions.md'), 'instructions');
      
      const result = await detectOldVersion('copilot', testDir);
      
      expect(result.paths).toContain('.github/skills/get-shit-done');
      expect(result.paths).toContain('.github/agents/gsd-planner.agent.md');
      expect(result.paths).toContain('.github/ISSUE_TEMPLATE/gsd-bug.yml');
      expect(result.paths).toContain('.github/copilot-instructions.md');
    });
  });
  
  describe('detectOldVersion() - Codex', () => {
    it('should detect v1.x with SKILL.md + VERSION file', async () => {
      // Create old Codex structure
      await mkdir(join(testDir, '.codex/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.codex/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.codex/skills/get-shit-done/VERSION'), '1.8.0');
      
      const result = await detectOldVersion('codex', testDir);
      
      expect(result.isOld).toBe(true);
      expect(result.version).toBe('1.8.0');
      expect(result.paths).toContain('.codex/skills/get-shit-done');
    });
    
    it('should return false when markers missing', async () => {
      // Create empty directory
      await mkdir(join(testDir, '.codex'), { recursive: true });
      
      const result = await detectOldVersion('codex', testDir);
      
      expect(result.isOld).toBe(false);
      expect(result.version).toBeNull();
    });
    
    it('should return correct paths including agents', async () => {
      // Create full old structure
      await mkdir(join(testDir, '.codex/skills/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.codex/agents'), { recursive: true });
      await writeFile(join(testDir, '.codex/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.codex/skills/get-shit-done/VERSION'), '1.8.0');
      await writeFile(join(testDir, '.codex/agents/gsd-planner.agent.md'), '# Agent');
      
      const result = await detectOldVersion('codex', testDir);
      
      expect(result.paths).toContain('.codex/skills/get-shit-done');
      expect(result.paths).toContain('.codex/agents/gsd-planner.agent.md');
    });
  });
  
  describe('getOldInstallationPaths()', () => {
    it('should return only existing paths', async () => {
      // Create partial structure
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      // Don't create hooks or settings.json
      
      const paths = await getOldInstallationPaths('claude', testDir);
      
      expect(paths).toContain('.claude/commands/gsd');
      expect(paths).toContain('.claude/get-shit-done');
      expect(paths).not.toContain('.claude/hooks/gsd-check-update.js');
      expect(paths).not.toContain('.claude/settings.json');
    });
    
    it('should handle glob patterns for agents correctly', async () => {
      // Create multiple agent files
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.github/agents'), { recursive: true });
      await writeFile(join(testDir, '.github/agents/gsd-planner.agent.md'), '# Planner');
      await writeFile(join(testDir, '.github/agents/gsd-executor.agent.md'), '# Executor');
      await writeFile(join(testDir, '.github/agents/other-agent.agent.md'), '# Other');
      
      const paths = await getOldInstallationPaths('copilot', testDir);
      
      expect(paths).toContain('.github/agents/gsd-planner.agent.md');
      expect(paths).toContain('.github/agents/gsd-executor.agent.md');
      expect(paths).not.toContain('.github/agents/other-agent.agent.md');
    });
    
    it('should return empty array when no old files found', async () => {
      const paths = await getOldInstallationPaths('claude', testDir);
      
      expect(paths).toEqual([]);
    });
    
    it('should return empty array on errors', async () => {
      // Pass non-existent directory
      const paths = await getOldInstallationPaths('claude', '/nonexistent/path');
      
      expect(paths).toEqual([]);
    });
  });
  
  describe('detectAllOldVersions()', () => {
    it('should detect multiple platforms in same directory', async () => {
      // Create old installations for multiple platforms
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
      
      await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.7.0');
      
      const results = await detectAllOldVersions(testDir);
      
      expect(results.length).toBe(2);
      
      const claudeResult = results.find(r => r.platform === 'claude');
      expect(claudeResult).toBeDefined();
      expect(claudeResult.version).toBe('1.8.0');
      expect(claudeResult.scope).toBe('local');
      
      const copilotResult = results.find(r => r.platform === 'copilot');
      expect(copilotResult).toBeDefined();
      expect(copilotResult.version).toBe('1.7.0');
      expect(copilotResult.scope).toBe('local');
    });
    
    it('should return array with platform, scope, version, paths', async () => {
      // Create single old installation
      await mkdir(join(testDir, '.codex/skills/get-shit-done'), { recursive: true });
      await writeFile(join(testDir, '.codex/skills/get-shit-done/SKILL.md'), '# Skill');
      await writeFile(join(testDir, '.codex/skills/get-shit-done/VERSION'), '1.8.0');
      
      const results = await detectAllOldVersions(testDir);
      
      expect(results.length).toBe(1);
      expect(results[0]).toHaveProperty('platform', 'codex');
      expect(results[0]).toHaveProperty('scope', 'local');
      expect(results[0]).toHaveProperty('version', '1.8.0');
      expect(results[0]).toHaveProperty('paths');
      expect(Array.isArray(results[0].paths)).toBe(true);
    });
    
    it('should return empty array when no old versions', async () => {
      const results = await detectAllOldVersions(testDir);
      
      expect(results).toEqual([]);
    });
  });
  
  describe('Error handling', () => {
    it('should return { isOld: false } on file read errors', async () => {
      // Create structure but make VERSION unreadable (simulate permission issue)
      await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
      await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
      // Don't create VERSION file
      
      const result = await detectOldVersion('claude', testDir);
      
      // Should not throw, just return false
      expect(result.isOld).toBe(false);
      expect(result.version).toBeNull();
    });
    
    it('should not throw on invalid platform', async () => {
      const result = await detectOldVersion('invalid-platform', testDir);
      
      expect(result.isOld).toBe(false);
      expect(result.version).toBeNull();
      expect(result.paths).toEqual([]);
    });
  });
});
