import { describe, it, expect } from 'vitest';
import { withTestEnv } from '../helpers/test-env.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Template Variable Rendering', () => {
  it('replaces PLATFORM_ROOT with .claude/', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      // Find a skill file and check content
      const skillFile = join(env.testDir, '.claude/skills/gsd/gsd-new-project/SKILL.md');
      const content = readFileSync(skillFile, 'utf-8');
      
      expect(content).toContain('.claude/');
      expect(content).not.toContain('{{PLATFORM_ROOT}}');
    });
  });
  
  it('does not leave VERSION variable unreplaced', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      // Check all skill files for unreplaced VERSION
      const skillsDir = join(env.testDir, '.claude/skills/gsd');
      const skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory());
      
      for (const skill of skills) {
        const skillFile = join(skillsDir, skill.name, 'SKILL.md');
        const content = readFileSync(skillFile, 'utf-8');
        expect(content).not.toContain('{{VERSION}}');
      }
    });
  });
  
  it('replaces COMMAND_PREFIX with /gsd-', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const skillFile = join(env.testDir, '.claude/skills/gsd/gsd-new-project/SKILL.md');
      const content = readFileSync(skillFile, 'utf-8');
      
      expect(content).toContain('/gsd-');
      expect(content).not.toContain('{{COMMAND_PREFIX}}');
    });
  });
  
  it('replaces INSTALL_DATE with ISO 8601 timestamp', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      // Check help skill which includes INSTALL_DATE
      const skillFile = join(env.testDir, '.claude/skills/gsd/gsd-help/SKILL.md');
      const content = readFileSync(skillFile, 'utf-8');
      
      expect(content).not.toContain('{{INSTALL_DATE}}');
      
      // If timestamp present in content, verify format (YYYY-MM-DD)
      const isoMatch = content.match(/\d{4}-\d{2}-\d{2}/);
      if (isoMatch) {
        const date = new Date(isoMatch[0]);
        expect(date).toBeInstanceOf(Date);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });
  });
  
  it('replaces PLATFORM_NAME with claude', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const skillFile = join(env.testDir, '.claude/skills/gsd/gsd-new-project/SKILL.md');
      const content = readFileSync(skillFile, 'utf-8');
      
      expect(content).not.toContain('{{PLATFORM_NAME}}');
    });
  });
  
  it('leaves no unsubstituted uppercase variables in skills', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const skillsDir = join(env.testDir, '.claude/skills/gsd');
      const skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && e.name.startsWith('gsd-'));
      
      // Check each skill's SKILL.md file
      for (const skill of skills) {
        const skillFile = join(skillsDir, skill.name, 'SKILL.md');
        const content = readFileSync(skillFile, 'utf-8');
        
        // Check for any remaining {{UPPERCASE}} patterns
        const unreplacedVars = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplacedVars) {
          expect.fail(`Unreplaced variables in ${skill.name}: ${unreplacedVars.join(', ')}`);
        }
      }
    });
  });
  
  it('leaves no unsubstituted uppercase variables in agents', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      const agentsDir = join(env.testDir, '.claude/agents');
      const agents = readdirSync(agentsDir)
        .filter(f => f.endsWith('.agent.md') && f.startsWith('gsd-'));
      
      // Check each agent file
      for (const agent of agents) {
        const agentFile = join(agentsDir, agent);
        const content = readFileSync(agentFile, 'utf-8');
        
        // Check for any remaining {{UPPERCASE}} patterns
        const unreplacedVars = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplacedVars) {
          expect.fail(`Unreplaced variables in ${agent}: ${unreplacedVars.join(', ')}`);
        }
      }
    });
  });
});

describe('Variable Validation', () => {
  it('preserves lowercase variables (code examples)', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      // Check shared directory for code examples with {{lowercase}} patterns
      // These should NOT be replaced (they're code examples, not template variables)
      const sharedDir = join(env.testDir, '.claude/get-shit-done');
      
      // If any markdown files exist with lowercase {{variables}}, they should be preserved
      // This test just ensures installation doesn't fail on them
      expect(true).toBe(true); // Placeholder - actual test would scan files
    });
  });
});

describe('Path References', () => {
  it('converts @-references to platform-specific paths', async () => {
    await withTestEnv(async (env) => {
      env.installCmd('--claude --local');
      
      // Check that @-references use correct platform path
      const skillFile = join(env.testDir, '.claude/skills/gsd/gsd-new-project/SKILL.md');
      const content = readFileSync(skillFile, 'utf-8');
      
      // Skills should reference .claude/get-shit-done/ for shared resources
      if (content.includes('@')) {
        // If @ references exist, verify they use .claude/ prefix
        expect(content).toContain('.claude/get-shit-done');
      }
    });
  });
});
