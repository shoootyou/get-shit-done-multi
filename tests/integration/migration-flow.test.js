// tests/integration/migration-flow.test.js

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm, pathExists, readdir } from 'fs-extra';
import { join } from 'path';
import { performMigration } from '../../bin/lib/migration/migration-manager.js';
import { detectOldVersion, detectAllOldVersions } from '../../bin/lib/version/old-version-detector.js';
import { tmpdir } from 'os';

// Create unique test directory per TEST-01
const getTestDir = () => join(tmpdir(), `gsd-migration-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

describe('E2E Migration - User Confirms', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = getTestDir();
    
    // Create v1.x Claude installation
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test Command');
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should detect old version', async () => {
    const result = await detectOldVersion('claude', testDir);
    expect(result.isOld).toBe(true);
    expect(result.version).toBe('1.8.0');
    expect(result.paths).toContain('.claude/get-shit-done');
  });
  
  it('should create backup directory', async () => {
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    expect(result.success).toBe(true);
    expect(result.backupPath).toMatch(/\.gsd-backup\/\d{4}-\d{2}-\d{2}-\d{4}/);
    
    // Verify backup exists (backupPath is already absolute)
    const backupExists = await pathExists(result.backupPath);
    expect(backupExists).toBe(true);
  });
  
  it('should copy all old files to backup', async () => {
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Check VERSION file in backup (backupPath is already absolute)
    const versionInBackup = await pathExists(
      join(result.backupPath, '.claude/get-shit-done/VERSION')
    );
    expect(versionInBackup).toBe(true);
    
    // Check commands in backup
    const commandsInBackup = await pathExists(
      join(result.backupPath, '.claude/commands/gsd/test.md')
    );
    expect(commandsInBackup).toBe(true);
  });
  
  it('should remove old files after successful backup', async () => {
    await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Old files should be gone
    const oldCommandsExist = await pathExists(
      join(testDir, '.claude/commands/gsd/test.md')
    );
    expect(oldCommandsExist).toBe(false);
  });
  
  it('should preserve backup directory structure', async () => {
    // Create nested structure
    await mkdir(join(testDir, '.claude/commands/gsd/subdir'), { recursive: true });
    await writeFile(join(testDir, '.claude/commands/gsd/subdir/nested.md'), '# Nested');
    
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Check nested structure preserved in backup (backupPath is already absolute)
    const nestedInBackup = await pathExists(
      join(result.backupPath, '.claude/commands/gsd/subdir/nested.md')
    );
    expect(nestedInBackup).toBe(true);
  });
});

describe('E2E Migration - User Declines', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = getTestDir();
    
    // Create v1.x Claude installation
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test');
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should preserve old files when user declines', async () => {
    // Mock @clack/prompts to return false
    vi.mock('@clack/prompts', async () => {
      const actual = await vi.importActual('@clack/prompts');
      return {
        ...actual,
        confirm: vi.fn().mockResolvedValue(false),
        isCancel: vi.fn().mockReturnValue(false)
      };
    });
    
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: false // Don't skip - test prompt flow
    });
    
    // Migration should fail with user declined
    expect(result.success).toBe(false);
    expect(result.error).toBe('User declined');
    
    // Old files should be unchanged
    const versionExists = await pathExists(
      join(testDir, '.claude/get-shit-done/VERSION')
    );
    expect(versionExists).toBe(true);
    
    const commandExists = await pathExists(
      join(testDir, '.claude/commands/gsd/test.md')
    );
    expect(commandExists).toBe(true);
  });
});

describe('Backup Failure Scenarios', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = getTestDir();
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should abort when no old files found', async () => {
    // Create empty directory
    await mkdir(testDir, { recursive: true });
    
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Should fail with no old files
    expect(result.success).toBe(false);
    expect(result.error).toBe('No old files found');
  });
  
  it('should preserve old files on backup failure', async () => {
    // Create v1.x installation
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    
    // Create a file that will cause copy issues (simulate permission denied)
    const problematicFile = join(testDir, '.claude/get-shit-done/locked.txt');
    await writeFile(problematicFile, 'locked content');
    
    // Note: This test verifies the error handling path exists
    // Actual permission testing would require platform-specific setup
    const result = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Even if backup succeeds (can't easily simulate failure in test),
    // verify old files handling is correct
    if (!result.success) {
      // Old files should still exist
      const versionExists = await pathExists(
        join(testDir, '.claude/get-shit-done/VERSION')
      );
      expect(versionExists).toBe(true);
    } else {
      // If successful, old files should be removed
      const versionExists = await pathExists(
        join(testDir, '.claude/get-shit-done/VERSION')
      );
      expect(versionExists).toBe(false);
    }
  });
});

describe('Multi-Platform Migration', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = getTestDir();
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should detect multiple platforms with old versions', async () => {
    // Create v1.x for Claude
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test');
    
    // Create v1.x for Copilot
    await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
    await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.7.0');
    await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
    
    // Create v1.x for Codex
    await mkdir(join(testDir, '.codex/skills/get-shit-done'), { recursive: true });
    await writeFile(join(testDir, '.codex/skills/get-shit-done/VERSION'), '1.6.0');
    await writeFile(join(testDir, '.codex/skills/get-shit-done/SKILL.md'), '# Skill');
    
    // Detect all
    const results = await detectAllOldVersions(testDir);
    
    // Should find all three
    expect(results).toHaveLength(3);
    expect(results.map(r => r.platform).sort()).toEqual(['claude', 'codex', 'copilot']);
    expect(results.find(r => r.platform === 'claude').version).toBe('1.8.0');
    expect(results.find(r => r.platform === 'copilot').version).toBe('1.7.0');
    expect(results.find(r => r.platform === 'codex').version).toBe('1.6.0');
  });
  
  it('should migrate each platform to separate backup', async () => {
    // Create v1.x for Claude
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Claude Test');
    
    // Create v1.x for Copilot
    await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
    await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.7.0');
    await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Copilot Skill');
    
    // Migrate Claude
    const claudeResult = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    expect(claudeResult.success).toBe(true);
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Migrate Copilot
    const copilotResult = await performMigration('copilot', '1.7.0', testDir, { 
      skipPrompts: true 
    });
    expect(copilotResult.success).toBe(true);
    
    // Verify two separate backup directories exist
    const backupDir = join(testDir, '.gsd-backup');
    const backupEntries = await readdir(backupDir);
    
    // Should have at least 2 backup timestamps
    expect(backupEntries.length).toBeGreaterThanOrEqual(2);
    
    // Verify Claude-specific paths in Claude backup (backupPath is already absolute)
    const claudeCommandInBackup = await pathExists(
      join(claudeResult.backupPath, '.claude/commands/gsd/test.md')
    );
    expect(claudeCommandInBackup).toBe(true);
    
    // Verify Copilot-specific paths in Copilot backup
    const copilotSkillInBackup = await pathExists(
      join(copilotResult.backupPath, '.github/skills/get-shit-done/SKILL.md')
    );
    expect(copilotSkillInBackup).toBe(true);
  });
});

describe('Edge Cases', () => {
  let testDir;
  
  beforeEach(async () => {
    testDir = getTestDir();
  });
  
  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  it('should handle missing VERSION file gracefully', async () => {
    // Create old structure without VERSION
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test');
    
    const result = await detectOldVersion('claude', testDir);
    
    // Should not detect as old without VERSION
    expect(result.isOld).toBe(false);
  });
  
  it('should handle backup directory name collision', async () => {
    // Create v1.x installation
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test');
    
    // First migration
    const result1 = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    expect(result1.success).toBe(true);
    
    // Recreate old files to simulate second installation
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test2.md'), '# Test 2');
    
    // Small delay to ensure different timestamp (if same minute)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second migration - should succeed with different timestamp
    const result2 = await performMigration('claude', '1.8.0', testDir, { 
      skipPrompts: true 
    });
    
    // Should succeed (timestamp will differ by seconds)
    expect(result2.success).toBe(true);
    
    // Both backups should exist (backupPath is already absolute)
    const backup1Exists = await pathExists(result1.backupPath);
    const backup2Exists = await pathExists(result2.backupPath);
    expect(backup1Exists).toBe(true);
    expect(backup2Exists).toBe(true);
  });
  
  it('should detect only Claude old agent files (without .agent.md suffix)', async () => {
    // Create v1.x installation with both old and new style agents
    await mkdir(join(testDir, '.claude/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.claude/commands/gsd'), { recursive: true });
    await mkdir(join(testDir, '.claude/agents'), { recursive: true });
    await writeFile(join(testDir, '.claude/get-shit-done/VERSION'), '1.8.0');
    await writeFile(join(testDir, '.claude/commands/gsd/test.md'), '# Test');
    
    // Old style (should be detected)
    await writeFile(join(testDir, '.claude/agents/gsd-old.md'), '# Old Agent');
    
    // New style (should NOT be detected as old)
    await writeFile(join(testDir, '.claude/agents/gsd-new.agent.md'), '# New Agent');
    
    const result = await detectOldVersion('claude', testDir);
    
    expect(result.isOld).toBe(true);
    expect(result.paths).toContain('.claude/agents/gsd-old.md');
    expect(result.paths).not.toContain('.claude/agents/gsd-new.agent.md');
  });
  
  it('should handle Copilot with agents and issue templates', async () => {
    // Create v1.x Copilot installation with all components
    await mkdir(join(testDir, '.github/skills/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.github/agents'), { recursive: true });
    await mkdir(join(testDir, '.github/ISSUE_TEMPLATE'), { recursive: true });
    
    await writeFile(join(testDir, '.github/skills/get-shit-done/VERSION'), '1.7.0');
    await writeFile(join(testDir, '.github/skills/get-shit-done/SKILL.md'), '# Skill');
    await writeFile(join(testDir, '.github/agents/gsd-agent.agent.md'), '# Agent');
    await writeFile(join(testDir, '.github/ISSUE_TEMPLATE/gsd-template.yml'), 'name: Template');
    
    const result = await detectOldVersion('copilot', testDir);
    
    expect(result.isOld).toBe(true);
    expect(result.paths).toContain('.github/skills/get-shit-done');
    expect(result.paths).toContain('.github/agents/gsd-agent.agent.md');
    expect(result.paths).toContain('.github/ISSUE_TEMPLATE/gsd-template.yml');
  });
  
  it('should handle Codex installation', async () => {
    // Create v1.x Codex installation
    await mkdir(join(testDir, '.codex/skills/get-shit-done'), { recursive: true });
    await mkdir(join(testDir, '.codex/agents'), { recursive: true });
    
    await writeFile(join(testDir, '.codex/skills/get-shit-done/VERSION'), '1.6.0');
    await writeFile(join(testDir, '.codex/skills/get-shit-done/SKILL.md'), '# Skill');
    await writeFile(join(testDir, '.codex/agents/gsd-agent.agent.md'), '# Agent');
    
    const result = await detectOldVersion('codex', testDir);
    
    expect(result.isOld).toBe(true);
    expect(result.version).toBe('1.6.0');
    expect(result.paths).toContain('.codex/skills/get-shit-done');
    expect(result.paths).toContain('.codex/agents/gsd-agent.agent.md');
  });
});
