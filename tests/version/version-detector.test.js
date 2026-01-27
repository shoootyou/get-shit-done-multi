import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { detectVersionFromDirectory, getVersionFromFile } from '../../bin/lib/version/version-detector.js';

describe('version-detector', () => {
  let testDir;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `.gsd-test-version-detector-${Math.random().toString(36).slice(2)}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(testDir);
  });

  describe('detectVersionFromDirectory', () => {
    it('should detect version from meta-skill (highest priority)', async () => {
      // Setup meta-skill version
      const metaSkillPath = path.join(testDir, 'skills', 'get-shit-done', 'claude');
      await fs.ensureDir(metaSkillPath);
      await fs.writeJson(path.join(metaSkillPath, 'version.json'), {
        version: '2.0.0',
        platform: 'claude',
        type: 'meta-skill'
      });

      // Also add agent version (lower priority)
      const agentsPath = path.join(testDir, 'agents');
      await fs.ensureDir(agentsPath);
      await fs.writeJson(path.join(agentsPath, 'versions.json'), {
        'gsd-executor': {
          metadata: {
            projectVersion: '1.5.0'
          }
        }
      });

      const result = await detectVersionFromDirectory(testDir, 'claude');
      
      expect(result.version).toBe('2.0.0');
      expect(result.source).toContain('skills/get-shit-done');
    });

    it('should fallback to agents version when meta-skill not found', async () => {
      const agentsPath = path.join(testDir, 'agents');
      await fs.ensureDir(agentsPath);
      await fs.writeJson(path.join(agentsPath, 'versions.json'), {
        'gsd-planner': {
          metadata: {
            projectVersion: '1.8.0'
          }
        }
      });

      const result = await detectVersionFromDirectory(testDir);
      
      expect(result.version).toBe('1.8.0');
      expect(result.source).toContain('agents/versions.json');
    });

    it('should fallback to individual skill version as last resort', async () => {
      const skillPath = path.join(testDir, 'skills', 'gsd-help');
      await fs.ensureDir(skillPath);
      await fs.writeJson(path.join(skillPath, 'version.json'), {
        skill_version: '1.9.1',
        metadata: {
          projectVersion: '1.9.0'
        }
      });

      const result = await detectVersionFromDirectory(testDir);
      
      // Should prefer projectVersion over skill_version
      expect(result.version).toBe('1.9.0');
      expect(result.source).toContain('skills/gsd-help');
    });

    it('should return unknown when no version files exist', async () => {
      const result = await detectVersionFromDirectory(testDir);
      
      expect(result.version).toBe('unknown');
      expect(result.source).toBe('none');
    });

    it('should handle corrupted JSON gracefully', async () => {
      const metaSkillPath = path.join(testDir, 'skills', 'get-shit-done');
      await fs.ensureDir(metaSkillPath);
      await fs.writeFile(path.join(metaSkillPath, 'version.json'), 'invalid json{{{');

      const result = await detectVersionFromDirectory(testDir);
      
      expect(result.version).toBe('unknown');
    });

    it('should scan multiple individual skills and use first found', async () => {
      // Create multiple skill version files
      const skill1Path = path.join(testDir, 'skills', 'gsd-help');
      const skill2Path = path.join(testDir, 'skills', 'gsd-progress');
      
      await fs.ensureDir(skill1Path);
      await fs.ensureDir(skill2Path);
      
      await fs.writeJson(path.join(skill1Path, 'version.json'), {
        metadata: { projectVersion: '1.7.0' }
      });
      
      await fs.writeJson(path.join(skill2Path, 'version.json'), {
        metadata: { projectVersion: '1.8.0' }
      });

      const result = await detectVersionFromDirectory(testDir);
      
      // Should find at least one of them
      expect(result.version).toMatch(/1\.[78]\.0/);
      expect(result.source).toMatch(/skills\/gsd-(help|progress)/);
    });
  });

  describe('getVersionFromFile', () => {
    it('should read version from file with version field', async () => {
      const versionFile = path.join(testDir, 'version.json');
      await fs.writeJson(versionFile, {
        version: '1.9.5',
        platform: 'copilot'
      });

      const version = await getVersionFromFile(versionFile);
      
      expect(version).toBe('1.9.5');
    });

    it('should read version from metadata.projectVersion', async () => {
      const versionFile = path.join(testDir, 'version.json');
      await fs.writeJson(versionFile, {
        metadata: {
          projectVersion: '2.1.0',
          platform: 'claude'
        }
      });

      const version = await getVersionFromFile(versionFile);
      
      expect(version).toBe('2.1.0');
    });

    it('should return null for non-existent file', async () => {
      const version = await getVersionFromFile(path.join(testDir, 'nonexistent.json'));
      
      expect(version).toBeNull();
    });

    it('should return null for corrupted JSON', async () => {
      const versionFile = path.join(testDir, 'version.json');
      await fs.writeFile(versionFile, 'not valid json');

      const version = await getVersionFromFile(versionFile);
      
      expect(version).toBeNull();
    });
  });
});
