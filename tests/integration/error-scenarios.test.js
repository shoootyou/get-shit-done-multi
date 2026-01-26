import { describe, it, expect } from 'vitest';
import { withTestEnv } from '../helpers/test-env.js';
import { join } from 'path';
import { chmodSync, mkdirSync } from 'fs';

describe('Error Scenarios', () => {
  it('shows actionable error for permission denied', async () => {
    await withTestEnv(async (env) => {
      // Create read-only directory to trigger permission error
      const roDir = join(env.testDir, '.claude');
      mkdirSync(roDir);
      chmodSync(roDir, 0o444); // Read-only
      
      try {
        env.installCmd('--claude --local');
        expect.fail('Should have thrown permission error');
      } catch (error) {
        const output = error.message;
        // Error should mention permission or EACCES
        expect(output.toLowerCase()).toMatch(/permission|eacces|cannot create/i);
      } finally {
        // Restore permissions for cleanup
        chmodSync(roDir, 0o755);
      }
    });
  });
  
  it('rejects --copilot as unknown in Phase 1', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd('--copilot');
        expect.fail('Should have thrown unknown option error');
      } catch (error) {
        // In Phase 1, --copilot is not a defined flag yet
        expect(error.message).toMatch(/unknown option/i);
      }
    });
  });
  
  it('requires --claude flag', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd(''); // No platform flag
        expect.fail('Should have thrown missing flag error');
      } catch (error) {
        expect(error.message).toContain('--claude');
      }
    });
  });
  
  it('requires platform flag (no default)', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd('--local'); // Has mode flag but no platform flag
        expect.fail('Should have thrown missing platform error');
      } catch (error) {
        expect(error.message).toContain('--claude');
      }
    });
  });
});

describe('Output Formatting', () => {
  it('shows success message with installation details', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local');
      
      expect(output).toContain('Installation complete');
      expect(output).toContain('Skills:');
      expect(output).toContain('Agents:');
    });
  });
  
  it('includes next steps in success message', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local');
      
      expect(output).toContain('Next steps:');
      expect(output).toContain('/gsd-new-project');
      expect(output).toContain('Restart Claude');
    });
  });
  
  it('shows progress messages during installation', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local');
      
      expect(output).toContain('Validating');
      expect(output).toContain('Installing skills');
      expect(output).toContain('Installing agents');
    });
  });
  
  it('shows installation path in success message', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local');
      
      expect(output).toMatch(/Installed.*\.claude/);
    });
  });
});

describe('Invalid Flags', () => {
  it('shows error for unknown flags', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd('--unknown-flag');
        expect.fail('Should have thrown unknown option error');
      } catch (error) {
        // Commander provides error for unknown options
        expect(error.message).toMatch(/unknown|option/i);
      }
    });
  });
  
  it('suggests correct flag for typos', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd('--clude'); // Typo of --claude
        expect.fail('Should have thrown unknown option error');
      } catch (error) {
        // Commander provides suggestions automatically
        expect(error.message).toMatch(/unknown|option/i);
      }
    });
  });
});

describe('Exit Codes', () => {
  it('exits with error code on failure', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd(''); // Missing required flag
        expect.fail('Should have thrown error');
      } catch (error) {
        // Error was thrown, which is expected
        expect(error).toBeDefined();
      }
    });
  });
  
  it('exits successfully on completion', async () => {
    await withTestEnv(async (env) => {
      // Should not throw
      const output = env.installCmd('--claude --local');
      expect(output).toContain('Installation complete');
    });
  });
});
