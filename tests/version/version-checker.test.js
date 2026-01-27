import { describe, it, expect } from 'vitest';
import { compareVersions, formatPlatformOption } from '../../bin/lib/version/version-checker.js';

describe('version-checker', () => {
  describe('compareVersions', () => {
    it('should detect update available', () => {
      const result = compareVersions('2.0.0', '2.1.0');
      expect(result.status).toBe('update_available');
      expect(result.updateType).toBe('minor');
    });
    
    it('should detect patch update', () => {
      const result = compareVersions('2.0.0', '2.0.1');
      expect(result.status).toBe('update_available');
      expect(result.updateType).toBe('patch');
    });
    
    it('should detect up to date', () => {
      const result = compareVersions('2.0.0', '2.0.0');
      expect(result.status).toBe('up_to_date');
    });
    
    it('should detect downgrade attempt', () => {
      const result = compareVersions('2.0.0', '1.9.0');
      expect(result.status).toBe('downgrade');
      expect(result.blocking).toBe(true);
    });
    
    it('should detect major version jump', () => {
      const result = compareVersions('2.5.0', '3.0.0');
      expect(result.status).toBe('major_update');
      expect(result.majorJump).toBe('2.x → 3.x');
    });
    
    it('should handle version with v prefix', () => {
      const result = compareVersions('v2.0.0', 'v2.1.0');
      expect(result.status).toBe('update_available');
    });
    
    it('should handle invalid versions', () => {
      const result = compareVersions('invalid', '2.0.0');
      expect(result.status).toBe('unknown');
      expect(result.reason).toBe('invalid_version');
    });
    
    it('should correctly compare 1.10.0 > 1.9.0', () => {
      const result = compareVersions('1.9.0', '1.10.0');
      expect(result.status).toBe('update_available');
    });
  });
  
  describe('formatPlatformOption', () => {
    it('should format platform without status', () => {
      const formatted = formatPlatformOption('claude', null);
      expect(formatted).toBe('Claude Code');
    });
    
    it('should format up to date status', () => {
      const status = { status: 'up_to_date', installed: '2.0.0', current: '2.0.0' };
      const formatted = formatPlatformOption('claude', status);
      expect(formatted).toBe('Claude Code (v2.0.0)');
    });
    
    it('should format update available', () => {
      const status = { status: 'update_available', installed: '2.0.0', current: '2.1.0' };
      const formatted = formatPlatformOption('copilot', status);
      expect(formatted).toBe('GitHub Copilot (v2.0.0 → v2.1.0)');
    });
    
    it('should format major update', () => {
      const status = { status: 'major_update', installed: '2.0.0', current: '3.0.0' };
      const formatted = formatPlatformOption('codex', status);
      expect(formatted).toBe('Codex (v2.0.0 → v3.0.0 ⚠️  major)');
    });
  });
});
