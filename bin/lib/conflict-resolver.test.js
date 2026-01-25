/**
 * Tests for conflict-resolver.js
 * Comprehensive test coverage for conflict detection and resolution
 */

const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const {
  analyzeInstallationConflicts,
  cleanupGSDContent,
  detectOldClaudePath,
  isGSDContent,
  GSD_DIRECTORIES
} = require('./conflict-resolver');

describe('conflict-resolver', () => {
  describe('isGSDContent()', () => {
    const installRoot = '/test/install';

    test('returns true for files in commands/ directory', () => {
      const filePath = path.join(installRoot, 'commands', 'gsd-help.md');
      expect(isGSDContent(filePath, installRoot)).toBe(true);
    });

    test('returns true for files in agents/ directory', () => {
      const filePath = path.join(installRoot, 'agents', 'gsd-agent.md');
      expect(isGSDContent(filePath, installRoot)).toBe(true);
    });

    test('returns true for files in skills/ directory', () => {
      const filePath = path.join(installRoot, 'skills', 'SKILL.md');
      expect(isGSDContent(filePath, installRoot)).toBe(true);
    });

    test('returns true for files in get-shit-done/ directory', () => {
      const filePath = path.join(installRoot, 'get-shit-done', 'workflows', 'test.md');
      expect(isGSDContent(filePath, installRoot)).toBe(true);
    });

    test('returns false for files in other directories', () => {
      const filePath = path.join(installRoot, 'custom', 'user-file.txt');
      expect(isGSDContent(filePath, installRoot)).toBe(false);
    });

    test('returns false for files at root level', () => {
      const filePath = path.join(installRoot, 'user-config.json');
      expect(isGSDContent(filePath, installRoot)).toBe(false);
    });

    test('handles nested paths correctly', () => {
      const filePath = path.join(installRoot, 'commands', 'subdir', 'nested.md');
      expect(isGSDContent(filePath, installRoot)).toBe(true);
    });

    test('handles paths with similar names', () => {
      const filePath = path.join(installRoot, 'my-commands', 'file.txt');
      expect(isGSDContent(filePath, installRoot)).toBe(false);
    });
  });

  describe('analyzeInstallationConflicts()', () => {
    let testDir;

    beforeEach(async () => {
      testDir = path.join(os.tmpdir(), `gsd-test-${Date.now()}`);
      await fse.ensureDir(testDir);
    });

    afterEach(async () => {
      await fse.remove(testDir);
    });

    test('returns no conflicts when directory doesn\'t exist', async () => {
      const nonExistent = path.join(testDir, 'does-not-exist');
      const result = await analyzeInstallationConflicts(nonExistent);

      expect(result.hasConflicts).toBe(false);
      expect(result.gsdFiles).toEqual([]);
      expect(result.userFiles).toEqual([]);
      expect(result.canAutoClean).toBe(true);
    });

    test('detects GSD directories (commands)', async () => {
      await fse.ensureDir(path.join(testDir, 'commands'));
      await fse.writeFile(path.join(testDir, 'commands', 'gsd-help.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.userFiles).toEqual([]);
      expect(result.canAutoClean).toBe(true);
    });

    test('detects GSD directories (agents)', async () => {
      await fse.ensureDir(path.join(testDir, 'agents'));
      await fse.writeFile(path.join(testDir, 'agents', 'gsd-agent.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.canAutoClean).toBe(true);
    });

    test('detects GSD directories (skills)', async () => {
      await fse.ensureDir(path.join(testDir, 'skills'));
      await fse.writeFile(path.join(testDir, 'skills', 'SKILL.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.canAutoClean).toBe(true);
    });

    test('detects GSD directories (get-shit-done)', async () => {
      await fse.ensureDir(path.join(testDir, 'get-shit-done', 'workflows'));
      await fse.writeFile(path.join(testDir, 'get-shit-done', 'workflows', 'test.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.canAutoClean).toBe(true);
    });

    test('detects user files (non-GSD content)', async () => {
      await fse.writeFile(path.join(testDir, 'user-file.txt'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles).toEqual([]);
      expect(result.userFiles.length).toBe(1);
      expect(result.canAutoClean).toBe(false);
    });

    test('sets canAutoClean=true when only GSD files exist', async () => {
      await fse.ensureDir(path.join(testDir, 'commands'));
      await fse.ensureDir(path.join(testDir, 'agents'));
      await fse.writeFile(path.join(testDir, 'commands', 'test.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.userFiles).toEqual([]);
      expect(result.canAutoClean).toBe(true);
    });

    test('sets canAutoClean=false when user files exist', async () => {
      await fse.ensureDir(path.join(testDir, 'commands'));
      await fse.writeFile(path.join(testDir, 'user-file.txt'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.userFiles.length).toBe(1);
      expect(result.canAutoClean).toBe(false);
    });

    test('handles empty directories', async () => {
      // Create empty directory
      await fse.ensureDir(testDir);

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(false);
      expect(result.gsdFiles).toEqual([]);
      expect(result.userFiles).toEqual([]);
      expect(result.canAutoClean).toBe(true);
    });

    test('handles nested GSD content', async () => {
      await fse.ensureDir(path.join(testDir, 'commands', 'subdir'));
      await fse.writeFile(path.join(testDir, 'commands', 'subdir', 'nested.md'), 'test');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.canAutoClean).toBe(true);
    });

    test('handles mixed content (GSD + user files)', async () => {
      await fse.ensureDir(path.join(testDir, 'commands'));
      await fse.writeFile(path.join(testDir, 'commands', 'gsd.md'), 'test');
      await fse.writeFile(path.join(testDir, 'README.md'), 'user content');

      const result = await analyzeInstallationConflicts(testDir);

      expect(result.hasConflicts).toBe(true);
      expect(result.gsdFiles.length).toBeGreaterThan(0);
      expect(result.userFiles.length).toBeGreaterThan(0);
      expect(result.canAutoClean).toBe(false);
    });
  });

  describe('cleanupGSDContent()', () => {
    let testDir;

    beforeEach(async () => {
      testDir = path.join(os.tmpdir(), `gsd-cleanup-${Date.now()}`);
      await fse.ensureDir(testDir);
    });

    afterEach(async () => {
      await fse.remove(testDir);
    });

    test('removes GSD directories', async () => {
      const commandsDir = path.join(testDir, 'commands');
      const agentsDir = path.join(testDir, 'agents');
      
      await fse.ensureDir(commandsDir);
      await fse.ensureDir(agentsDir);
      await fse.writeFile(path.join(commandsDir, 'test.md'), 'test');
      await fse.writeFile(path.join(agentsDir, 'test.md'), 'test');

      const gsdFiles = [commandsDir, agentsDir];
      const result = await cleanupGSDContent(gsdFiles);

      expect(result.removed).toBeGreaterThan(0);
      expect(await fse.pathExists(commandsDir)).toBe(false);
      expect(await fse.pathExists(agentsDir)).toBe(false);
    });

    test('returns count of removed directories', async () => {
      const commandsDir = path.join(testDir, 'commands');
      const agentsDir = path.join(testDir, 'agents');
      const skillsDir = path.join(testDir, 'skills');
      
      await fse.ensureDir(commandsDir);
      await fse.ensureDir(agentsDir);
      await fse.ensureDir(skillsDir);

      const gsdFiles = [commandsDir, agentsDir, skillsDir];
      const result = await cleanupGSDContent(gsdFiles);

      expect(result.removed).toBe(3);
    });

    test('handles nested GSD content', async () => {
      const commandsDir = path.join(testDir, 'commands');
      const nestedFile = path.join(commandsDir, 'subdir', 'nested.md');
      
      await fse.ensureDir(path.dirname(nestedFile));
      await fse.writeFile(nestedFile, 'test');

      const gsdFiles = [commandsDir, nestedFile];
      const result = await cleanupGSDContent(gsdFiles);

      expect(result.removed).toBeGreaterThan(0);
      expect(await fse.pathExists(commandsDir)).toBe(false);
    });

    test('doesn\'t touch user files', async () => {
      const userFile = path.join(testDir, 'user-config.json');
      const commandsDir = path.join(testDir, 'commands');
      
      await fse.writeFile(userFile, '{}');
      await fse.ensureDir(commandsDir);
      await fse.writeFile(path.join(commandsDir, 'test.md'), 'test');

      const gsdFiles = [commandsDir];
      await cleanupGSDContent(gsdFiles);

      expect(await fse.pathExists(commandsDir)).toBe(false);
      expect(await fse.pathExists(userFile)).toBe(true);
    });

    test('handles empty gsdFiles array', async () => {
      const result = await cleanupGSDContent([]);
      expect(result.removed).toBe(0);
    });
  });

  describe('detectOldClaudePath()', () => {
    test('returns exists=false when old path doesn\'t exist', async () => {
      // Mock fs-extra.pathExists to return false
      jest.spyOn(fse, 'pathExists').mockResolvedValue(false);

      const result = await detectOldClaudePath();

      expect(result.exists).toBe(false);
      expect(result.path).toBeUndefined();
      expect(result.warning).toBeUndefined();

      fse.pathExists.mockRestore();
    });

    test('returns exists=true when old path exists', async () => {
      // Mock fs-extra.pathExists to return true
      jest.spyOn(fse, 'pathExists').mockResolvedValue(true);

      const result = await detectOldClaudePath();

      expect(result.exists).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.warning).toBeDefined();

      fse.pathExists.mockRestore();
    });

    test('warning message includes old and new paths', async () => {
      jest.spyOn(fse, 'pathExists').mockResolvedValue(true);

      const result = await detectOldClaudePath();

      expect(result.warning).toContain('Library/Application Support/Claude');
      expect(result.warning).toContain('~/.claude/');

      fse.pathExists.mockRestore();
    });

    test('only checks ~/Library/Application Support/Claude', async () => {
      const pathExistsSpy = jest.spyOn(fse, 'pathExists').mockResolvedValue(false);

      await detectOldClaudePath();

      const expectedPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude');
      expect(pathExistsSpy).toHaveBeenCalledWith(expectedPath);

      pathExistsSpy.mockRestore();
    });
  });

  describe('GSD_DIRECTORIES constant', () => {
    test('exports GSD_DIRECTORIES array', () => {
      expect(GSD_DIRECTORIES).toBeDefined();
      expect(Array.isArray(GSD_DIRECTORIES)).toBe(true);
    });

    test('includes expected directories', () => {
      expect(GSD_DIRECTORIES).toContain('commands');
      expect(GSD_DIRECTORIES).toContain('agents');
      expect(GSD_DIRECTORIES).toContain('skills');
      expect(GSD_DIRECTORIES).toContain('get-shit-done');
    });

    test('has exactly 4 directories', () => {
      expect(GSD_DIRECTORIES.length).toBe(4);
    });
  });
});
