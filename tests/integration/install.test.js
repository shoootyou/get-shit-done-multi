import { describe, it, expect } from 'vitest';
import { withTestEnv } from '../helpers/test-env.js';
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('Installation Flow', () => {
  it('installs to local directory with --local flag', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local');
      
      // Verify success message
      expect(output).toContain('Installation complete');
      
      // Verify directories created
      expect(existsSync(join(env.testDir, '.claude/skills/gsd'))).toBe(true);
      expect(existsSync(join(env.testDir, '.claude/agents'))).toBe(true);
      expect(existsSync(join(env.testDir, '.claude/get-shit-done'))).toBe(true);
    });
  });
  
  it('installs all 28 skills', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const skillsDir = join(env.testDir, '.claude/skills/gsd');
      const skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && e.name.startsWith('gsd-'));
      
      expect(skills.length).toBe(28);
      
      // Verify each skill has SKILL.md
      skills.forEach(skill => {
        const skillFile = join(skillsDir, skill.name, 'SKILL.md');
        expect(existsSync(skillFile)).toBe(true);
      });
    });
  });
  
  it('installs all 13 agents', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const agentsDir = join(env.testDir, '.claude/agents');
      const agents = readdirSync(agentsDir)
        .filter(f => f.endsWith('.agent.md') && f.startsWith('gsd-'));
      
      expect(agents.length).toBe(13);
    });
  });
  
  it('installs shared directory with references and workflows', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const sharedDir = join(env.testDir, '.claude/get-shit-done');
      
      // Verify key subdirectories exist
      expect(existsSync(join(sharedDir, 'references'))).toBe(true);
      expect(existsSync(join(sharedDir, 'workflows'))).toBe(true);
      expect(existsSync(join(sharedDir, 'templates'))).toBe(true);
    });
  });
});

describe('CLI Flags', () => {
  it('shows help with --help', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--help');
      expect(output).toContain('Install to Claude Code');
      expect(output).toContain('Examples:');
    });
  });
  
  it('shows version with --version', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--version');
      expect(output).toContain('get-shit-done-multi');
      expect(output).toMatch(/\d+\.\d+\.\d+/); // Version format
    });
  });
  
  it('requires --claude flag', async () => {
    await withTestEnv(async (env) => {
      try {
        env.installCmd(''); // No flags
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('--claude');
      }
    });
  });
  
  it('disables colors with --no-color', async () => {
    await withTestEnv(async (env) => {
      const output = env.installCmd('--claude --local --no-color');
      
      // Check that ANSI color codes are NOT present
      // Note: test-env.js already disables colors via FORCE_COLOR=0
      expect(output).toContain('Installation complete');
    });
  });
});

describe('Overwrite Behavior', () => {
  it('overwrites existing installation silently', async () => {
    await withTestEnv(async (env) => {
      // First installation
      env.installCmd('--claude --local');
      
      // Modify installed file
      const testFile = join(env.testDir, '.claude/skills/gsd/gsd-new-project/SKILL.md');
      const original = readFileSync(testFile, 'utf-8');
      const modified = original + '\n<!-- MODIFIED -->';
      writeFileSync(testFile, modified);
      
      // Second installation (overwrite)
      const output = env.installCmd('--claude --local');
      
      expect(output).toContain('Existing installation found');
      expect(output).toContain('overwritten');
      
      // Verify file was overwritten (no MODIFIED marker)
      const afterOverwrite = readFileSync(testFile, 'utf-8');
      expect(afterOverwrite).not.toContain('MODIFIED');
    });
  });
});

describe('Next Steps and Progress', () => {
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
});
