/**
 * Tests for path resolution utilities
 */

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { getConfigPaths, expandTilde, ensureDirExists, ensureInstallDir } = require('./paths');

// Mock modules
jest.mock('fs-extra');

describe('getConfigPaths', () => {
  let homedirSpy;
  let cwdSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue('/home/testuser');
    cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue('/workspace/project');
  });

  afterEach(() => {
    homedirSpy.mockRestore();
    cwdSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('claude platform', () => {
    it('should return global path with new .claude directory', () => {
      const result = getConfigPaths('claude', 'global');
      expect(result).toBe('/home/testuser/.claude');
    });

    it('should return local path in current directory', () => {
      const result = getConfigPaths('claude', 'local');
      expect(result).toBe('/workspace/project/.claude');
    });

    it('should support custom config directory', () => {
      const result = getConfigPaths('claude', 'local', '/custom/config');
      expect(result).toBe('/custom/config/.claude');
    });
  });

  describe('copilot platform', () => {
    it('should return global .copilot path', () => {
      const result = getConfigPaths('copilot', 'global');
      expect(result).toBe('/home/testuser/.copilot');
    });

    it('should return local .github path', () => {
      const result = getConfigPaths('copilot', 'local');
      expect(result).toBe('/workspace/project/.github');
    });

    it('should support custom config directory', () => {
      const result = getConfigPaths('copilot', 'global', '/tmp/custom');
      expect(result).toBe('/tmp/custom/.github');
    });
  });

  describe('codex platform', () => {
    it('should return local .codex path', () => {
      const result = getConfigPaths('codex', 'local');
      expect(result).toBe('/workspace/project/.codex');
    });

    it('should throw error for global installation', () => {
      expect(() => getConfigPaths('codex', 'global')).toThrow('Global installation not supported for codex');
    });

    it('should support custom config directory', () => {
      const result = getConfigPaths('codex', 'local', '/tmp/custom');
      expect(result).toBe('/tmp/custom/.codex');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown platform', () => {
      expect(() => getConfigPaths('unknown', 'global')).toThrow('Unknown platform: unknown');
    });

    it('should throw error for invalid scope', () => {
      expect(() => getConfigPaths('claude', 'invalid')).toThrow('Invalid scope: invalid');
    });
  });

  describe('custom config directory', () => {
    it('should resolve relative paths', () => {
      const result = getConfigPaths('claude', 'local', './custom');
      expect(result).toContain('.claude');
      expect(path.isAbsolute(result)).toBe(true);
    });

    it('should handle absolute paths', () => {
      const result = getConfigPaths('claude', 'local', '/absolute/path');
      expect(result).toBe('/absolute/path/.claude');
    });
  });
});

describe('expandTilde', () => {
  let homedirSpy;

  beforeEach(() => {
    homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue('/home/testuser');
  });

  afterEach(() => {
    homedirSpy.mockRestore();
  });

  it('should expand ~/ to home directory', () => {
    const result = expandTilde('~/Documents/file.txt');
    expect(result).toBe('/home/testuser/Documents/file.txt');
  });

  it('should not modify paths without tilde', () => {
    const result = expandTilde('/absolute/path/file.txt');
    expect(result).toBe('/absolute/path/file.txt');
  });

  it('should handle null/undefined', () => {
    expect(expandTilde(null)).toBe(null);
    expect(expandTilde(undefined)).toBe(undefined);
  });

  it('should handle empty string', () => {
    expect(expandTilde('')).toBe('');
  });

  it('should not expand tilde in middle of path', () => {
    const result = expandTilde('/path/~/file.txt');
    expect(result).toBe('/path/~/file.txt');
  });
});

describe('ensureDirExists', () => {
  it('should return true when directory is created successfully', () => {
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    
    const result = ensureDirExists('/test/path');
    expect(result).toBe(true);
    expect(mkdirSyncSpy).toHaveBeenCalledWith('/test/path', { recursive: true });
    
    mkdirSyncSpy.mockRestore();
  });

  it('should return false and log error on failure', () => {
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      throw error;
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    const result = ensureDirExists('/test/path');
    expect(result).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create directory'),
      expect.any(String)
    );
    
    mkdirSyncSpy.mockRestore();
    consoleError.mockRestore();
  });
});

describe('ensureInstallDir', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success when directory is created', async () => {
    fs.ensureDir = jest.fn().mockResolvedValue();
    
    const result = await ensureInstallDir('/test/path', 'global');
    expect(result).toEqual({ success: true });
    expect(fs.ensureDir).toHaveBeenCalledWith('/test/path');
  });

  it('should handle EACCES permission error for global scope', async () => {
    const error = new Error('Permission denied');
    error.code = 'EACCES';
    fs.ensureDir = jest.fn().mockRejectedValue(error);
    
    const result = await ensureInstallDir('/test/path', 'global');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
    expect(result.suggestion).toContain('--local');
  });

  it('should handle EPERM permission error for global scope', async () => {
    const error = new Error('Operation not permitted');
    error.code = 'EPERM';
    fs.ensureDir = jest.fn().mockRejectedValue(error);
    
    const result = await ensureInstallDir('/test/path', 'global');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
    expect(result.suggestion).toContain('--local');
  });

  it('should handle permission error for local scope', async () => {
    const error = new Error('Permission denied');
    error.code = 'EACCES';
    fs.ensureDir = jest.fn().mockRejectedValue(error);
    
    const result = await ensureInstallDir('/test/path', 'local');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
    expect(result.suggestion).toContain('--config-dir');
  });

  it('should handle generic errors', async () => {
    const error = new Error('Disk full');
    fs.ensureDir = jest.fn().mockRejectedValue(error);
    
    const result = await ensureInstallDir('/test/path', 'local');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Disk full');
    expect(result.suggestion).toContain('Verify the path');
  });
});
