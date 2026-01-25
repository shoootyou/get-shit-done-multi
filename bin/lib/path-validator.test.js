/**
 * Tests for platform-specific path validation
 */

const fs = require('fs');
const { validatePath, getEffectivePlatform, isWSL } = require('./path-validator');

describe('validatePath', () => {
  let originalPlatform;

  beforeEach(() => {
    originalPlatform = process.platform;
  });

  afterEach(() => {
    // Restore original platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    });
    jest.restoreAllMocks();
  });

  describe('Windows validation', () => {
    beforeEach(() => {
      // Mock Windows platform
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
    });

    it('should detect invalid characters', () => {
      const result = validatePath('C:\\Users\\test<file>.txt');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('invalid Windows characters');
    });

    it('should detect multiple invalid characters', () => {
      const result = validatePath('C:\\test|file>name.txt');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('invalid Windows characters');
    });

    it('should detect reserved names', () => {
      const testCases = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM9', 'LPT1', 'LPT9'];
      
      for (const reserved of testCases) {
        const result = validatePath(`C:\\${reserved}\\test`);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('reserved Windows name'))).toBe(true);
      }
    });

    it('should detect reserved names case-insensitively', () => {
      const result1 = validatePath('C:\\con\\test');
      expect(result1.valid).toBe(false);
      
      const result2 = validatePath('C:\\CoN\\test');
      expect(result2.valid).toBe(false);
    });

    it('should detect reserved names with extensions', () => {
      const result = validatePath('C:\\temp\\CON.txt');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('reserved'))).toBe(true);
    });

    it('should reject paths exceeding 260 characters', () => {
      const longPath = 'C:\\' + 'a'.repeat(300);
      const result = validatePath(longPath);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('260 characters'))).toBe(true);
      expect(result.errors.some(e => e.includes('303'))).toBe(true);
    });

    it('should accept valid Windows paths', () => {
      const result = validatePath('C:\\Users\\test\\Documents\\file.txt');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept paths at exactly 260 characters', () => {
      const exactPath = 'C:\\' + 'a'.repeat(257);
      const result = validatePath(exactPath);
      expect(result.valid).toBe(true);
    });
  });

  describe('macOS validation', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      });
    });

    it('should reject paths exceeding 1024 characters', () => {
      const longPath = '/Users/' + 'a'.repeat(1100);
      const result = validatePath(longPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('macOS');
      expect(result.errors[0]).toContain('1024');
    });

    it('should accept valid Unix paths', () => {
      const result = validatePath('/Users/test/.claude/config');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept paths at exactly 1024 characters', () => {
      const exactPath = '/' + 'a'.repeat(1023);
      const result = validatePath(exactPath);
      expect(result.valid).toBe(true);
    });
  });

  describe('Linux validation', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      // Mock isWSL to return false
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Not found');
      });
      jest.spyOn(fs, 'statSync').mockImplementation(() => {
        throw new Error('Not found');
      });
    });

    it('should reject paths exceeding 4096 characters', () => {
      const longPath = '/home/' + 'a'.repeat(5000);
      const result = validatePath(longPath);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Linux');
      expect(result.errors[0]).toContain('4096');
    });

    it('should accept valid Unix paths', () => {
      const result = validatePath('/home/user/.claude/config');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept paths at exactly 4096 characters', () => {
      const exactPath = '/' + 'a'.repeat(4095);
      const result = validatePath(exactPath);
      expect(result.valid).toBe(true);
    });
  });

  describe('input validation', () => {
    it('should reject null path', () => {
      const result = validatePath(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-empty string');
    });

    it('should reject undefined path', () => {
      const result = validatePath(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-empty string');
    });

    it('should reject empty string', () => {
      const result = validatePath('');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-empty string');
    });

    it('should reject non-string input', () => {
      const result = validatePath(123);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-empty string');
    });
  });
});

describe('isWSL', () => {
  let originalPlatform;

  beforeEach(() => {
    originalPlatform = process.platform;
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    });
    jest.restoreAllMocks();
  });

  it('should return false on non-Linux platforms', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });
    expect(isWSL()).toBe(false);

    Object.defineProperty(process, 'platform', {
      value: 'darwin'
    });
    expect(isWSL()).toBe(false);
  });

  it('should detect WSL via /proc/version with "microsoft"', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockReturnValue('Linux version 4.4.0-19041-Microsoft');
    
    expect(isWSL()).toBe(true);
  });

  it('should detect WSL via /proc/version with "wsl"', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockReturnValue('Linux version 5.10.16.3-WSL2');
    
    expect(isWSL()).toBe(true);
  });

  it('should detect WSL via /mnt/c existence', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Not found');
    });
    jest.spyOn(fs, 'statSync').mockReturnValue({}); // /mnt/c exists
    
    expect(isWSL()).toBe(true);
  });

  it('should return false on regular Linux', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockReturnValue('Linux version 5.10.0-generic');
    jest.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('Not found');
    });
    
    expect(isWSL()).toBe(false);
  });

  it('should handle /proc/version read errors gracefully', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Permission denied');
    });
    jest.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('Not found');
    });
    
    expect(isWSL()).toBe(false);
  });
});

describe('getEffectivePlatform', () => {
  let originalPlatform;

  beforeEach(() => {
    originalPlatform = process.platform;
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    });
    jest.restoreAllMocks();
  });

  it('should return "linux" for WSL', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockReturnValue('Linux version 4.4.0-Microsoft');
    
    expect(getEffectivePlatform()).toBe('linux');
  });

  it('should return process.platform for non-WSL', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin'
    });
    
    expect(getEffectivePlatform()).toBe('darwin');
  });

  it('should return "win32" for Windows', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });
    
    expect(getEffectivePlatform()).toBe('win32');
  });

  it('should return "linux" for regular Linux', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('Not found');
    });
    jest.spyOn(fs, 'statSync').mockImplementation(() => {
      throw new Error('Not found');
    });
    
    expect(getEffectivePlatform()).toBe('linux');
  });
});
