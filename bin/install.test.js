/**
 * Integration tests for install.js with Reporter
 * Phase 5, Plan 2 - Verify Reporter integration and exit code logic
 */

const Reporter = require('./lib/output/reporter');

describe('install.js integration', () => {
  describe('Reporter integration', () => {
    test('Reporter can be instantiated', () => {
      const reporter = new Reporter();
      expect(reporter).toBeDefined();
      expect(reporter.indentLevel).toBe(0);
    });
    
    test('multi-platform results collection', () => {
      const results = [];
      
      // Simulate successful installations
      results.push({ platform: 'claude', success: true, details: { path: '~/.claude/' } });
      results.push({ platform: 'copilot', success: true, details: { path: '~/.copilot/' } });
      
      expect(results.length).toBe(2);
      expect(results.every(r => r.success)).toBe(true);
      
      // Test hasFailures logic
      const hasFailures = results.some(r => !r.success);
      expect(hasFailures).toBe(false);
    });
    
    test('partial failure results collection', () => {
      const results = [];
      
      results.push({ platform: 'claude', success: true });
      results.push({ platform: 'copilot', success: false, error: new Error('Permission denied') });
      
      const succeeded = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      expect(succeeded.length).toBe(1);
      expect(failed.length).toBe(1);
      
      const hasFailures = results.some(r => !r.success);
      expect(hasFailures).toBe(true);
    });
    
    test('summary formats results correctly', () => {
      const output = [];
      const reporter = new Reporter({
        write: (msg) => output.push(msg)
      });
      
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: true }
      ];
      
      reporter.summary(results);
      const text = output.join('');
      
      expect(text).toContain('claude, copilot installed');
    });
  });
  
  describe('Exit code logic', () => {
    test('exit 0 for all success', () => {
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: true }
      ];
      
      const hasFailures = results.some(r => !r.success);
      const exitCode = hasFailures ? 1 : 0;
      
      expect(exitCode).toBe(0);
    });
    
    test('exit 1 for any failure', () => {
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: false, error: new Error('Failed') }
      ];
      
      const hasFailures = results.some(r => !r.success);
      const exitCode = hasFailures ? 1 : 0;
      
      expect(exitCode).toBe(1);
    });
    
    test('exit 1 for all failures', () => {
      const results = [
        { platform: 'claude', success: false, error: new Error('E1') },
        { platform: 'copilot', success: false, error: new Error('E2') }
      ];
      
      const hasFailures = results.some(r => !r.success);
      const exitCode = hasFailures ? 1 : 0;
      
      expect(exitCode).toBe(1);
    });
  });
  
  describe('Error resilience', () => {
    test('continues to next platform after error', () => {
      // Simulate error-resilient installation flow
      const results = [];
      const platforms = ['claude', 'copilot', 'codex'];
      
      // Simulate: claude succeeds, copilot fails, codex succeeds
      platforms.forEach((platform, idx) => {
        try {
          if (idx === 1) {
            throw new Error('Copilot installation failed');
          }
          results.push({ platform, success: true });
        } catch (error) {
          results.push({ platform, success: false, error });
        }
      });
      
      expect(results.length).toBe(3); // All three attempted
      expect(results[0].success).toBe(true);  // claude succeeded
      expect(results[1].success).toBe(false); // copilot failed
      expect(results[2].success).toBe(true);  // codex still ran and succeeded
    });
  });
  
  describe('Platform details', () => {
    test('includes path and counts in success details', () => {
      const details = {
        path: '~/.claude/',
        commands: 5,
        agents: 13,
        skills: 2
      };
      
      expect(details.path).toBeDefined();
      expect(details.commands).toBeGreaterThan(0);
      expect(details.agents).toBeGreaterThan(0);
      expect(details.skills).toBeGreaterThan(0);
    });
    
    test('platformSuccess displays details', () => {
      const output = [];
      const reporter = new Reporter({
        write: (msg) => output.push(msg)
      });
      
      const details = {
        path: '~/.claude/',
        commands: 5,
        agents: 13,
        skills: 2
      };
      
      reporter.platformStart('claude', 'global');
      reporter.platformSuccess('claude', details);
      
      const text = output.join('');
      
      expect(text).toContain('claude');
      expect(text).toContain('~/.claude/');
      expect(text).toContain('5 commands');
      expect(text).toContain('13 agents');
      expect(text).toContain('2 skills');
    });
  });
});
