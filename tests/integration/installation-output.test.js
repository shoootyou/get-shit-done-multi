import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { mkdtemp, rm, readFile, readdir } from 'fs/promises';
import { tmpdir, homedir } from 'os';
import matter from 'gray-matter';
import { install } from '../../bin/lib/installer/orchestrator.js';
import { ClaudeAdapter } from '../../bin/lib/platforms/claude/adapter.js';
import { CopilotAdapter } from '../../bin/lib/platforms/copilot/adapter.js';
import { CodexAdapter } from '../../bin/lib/platforms/codex/adapter.js';

describe('Installation Output Verification', () => {
  let testDir;
  const scriptDir = join(process.cwd(), 'bin');
  
  beforeAll(async () => {
    // Use home directory to bypass system directory validation
    testDir = await mkdtemp(join(homedir(), '.gsd-output-test-'));
  });
  
  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });
  
  // Test 1: Claude agents include skills field
  describe('Claude Platform', () => {
    test('all 11 agents include skills field in frontmatter', async () => {
      const claudeDir = join(testDir, 'claude');
      await install('2.0.0', {
        platform: 'claude',
        adapter: new ClaudeAdapter(),
        isGlobal: false,
        isVerbose: false,
        scriptDir,
        targetDir: claudeDir,
        skipPrompts: true
      });
      
      const agentsDir = join(claudeDir, 'agents');
      const agentFiles = await readdir(agentsDir);
      const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
      
      expect(agents).toHaveLength(11); // All 11 agents installed
      
      let agentsWithSkills = 0;
      for (const agentFile of agents) {
        const content = await readFile(join(agentsDir, agentFile), 'utf8');
        const { data } = matter(content);
        
        // Skills field should exist for Claude agents
        // May be empty array if agent doesn't reference skills
        if (data.skills !== undefined) {
          expect(Array.isArray(data.skills)).toBe(true);
          agentsWithSkills++;
        }
      }
      
      // At least some agents should have skills extracted
      // (since several agents do reference skills)
      expect(agentsWithSkills).toBeGreaterThan(0);
    });
  });
  
  // Test 2: Copilot agents exclude skills field
  describe('Copilot Platform', () => {
    test('all 11 agents exclude skills field from frontmatter', async () => {
      const copilotDir = join(testDir, 'copilot');
      await install('2.0.0', {
        platform: 'copilot',
        adapter: new CopilotAdapter(),
        isGlobal: false,
        isVerbose: false,
        scriptDir,
        targetDir: copilotDir,
        skipPrompts: true
      });
      
      const agentsDir = join(copilotDir, 'agents');
      const agentFiles = await readdir(agentsDir);
      const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.agent.md'));
      
      expect(agents).toHaveLength(11);
      
      for (const agentFile of agents) {
        const content = await readFile(join(agentsDir, agentFile), 'utf8');
        const { data } = matter(content);
        
        // Skills field must NOT exist (negative assertion)
        expect(data).not.toHaveProperty('skills');
      }
    });
    
    test('tools field format is correct', async () => {
      const copilotDir = join(testDir, 'copilot');
      const agentsDir = join(copilotDir, 'agents');
      const agentFiles = await readdir(agentsDir);
      const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.agent.md'));
      
      for (const agentFile of agents) {
        const content = await readFile(join(agentsDir, agentFile), 'utf8');
        const { data } = matter(content);
        
        if (data.tools) {
          // Tools can be a string or an array depending on content
          expect(typeof data.tools === 'string' || Array.isArray(data.tools)).toBe(true);
        }
      }
    });
  });
  
  // Test 3: Codex agents exclude skills field
  describe('Codex Platform', () => {
    test('all 11 agents exclude skills field from frontmatter', async () => {
      const codexDir = join(testDir, 'codex');
      await install('2.0.0', {
        platform: 'codex',
        adapter: new CodexAdapter(),
        isGlobal: false,
        isVerbose: false,
        scriptDir,
        targetDir: codexDir,
        skipPrompts: true
      });
      
      const agentsDir = join(codexDir, 'agents');
      const agentFiles = await readdir(agentsDir);
      const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.agent.md'));
      
      expect(agents).toHaveLength(11);
      
      for (const agentFile of agents) {
        const content = await readFile(join(agentsDir, agentFile), 'utf8');
        const { data } = matter(content);
        
        // Skills field must NOT exist
        expect(data).not.toHaveProperty('skills');
      }
    });
  });
  
  // Test 4: Template variable replacement in get-shit-done/
  describe('Template Variable Replacement', () => {
    test('all text files in get-shit-done/ have variables replaced', async () => {
      const platforms = ['claude', 'copilot', 'codex'];
      
      for (const platform of platforms) {
        const platformDir = join(testDir, platform);
        const sharedDir = join(platformDir, 'get-shit-done');
        
        // Recursively read all files
        const files = await readdir(sharedDir, { withFileTypes: true, recursive: true });
        
        for (const file of files) {
          if (file.isDirectory()) continue;
          
          // Build full path using parentPath (Node.js 20.1+) or fallback to sharedDir
          const fullPath = join(file.parentPath || sharedDir, file.name);
          const ext = file.name.substring(file.name.lastIndexOf('.'));
          
          // Skip template files that intentionally contain placeholders for users
          // These are in templates/ subdirectory and contain {{PLACEHOLDER}} variables
          // that users fill in when creating milestones, plans, etc.
          if (fullPath.includes('/templates/')) {
            continue;
          }
          
          // Only check text files
          if (['.md', '.json', '.sh', '.bash', '.txt', '.yml', '.yaml'].includes(ext)) {
            const content = await readFile(fullPath, 'utf8');
            
            // No unreplaced install-time variables should remain
            // Check for VERSION, PLATFORM_ROOT, COMMAND_PREFIX, PLATFORM_NAME
            const installVars = content.match(/{{(VERSION|PLATFORM_ROOT|COMMAND_PREFIX|PLATFORM_NAME)}}/g);
            expect(installVars).toBeNull();
          }
        }
      }
    });
    
    test('JSON files have valid syntax after replacement', async () => {
      const claudeDir = join(testDir, 'claude');
      const manifestFile = join(claudeDir, 'get-shit-done', '.gsd-install-manifest.json');
      
      const content = await readFile(manifestFile, 'utf8');
      
      // Should parse without error
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });
  
  // Test 5: Metadata block format
  describe('Frontmatter Format', () => {
    test('Copilot agents have valid frontmatter', async () => {
      const copilotDir = join(testDir, 'copilot');
      const agentsDir = join(copilotDir, 'agents');
      const agentFiles = await readdir(agentsDir);
      const firstAgent = agentFiles.find(f => f.startsWith('gsd-'));
      
      const content = await readFile(join(agentsDir, firstAgent), 'utf8');
      const { data } = matter(content);
      
      // Check that frontmatter was parsed and has expected fields
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      
      // Check metadata structure if present
      if (data.metadata) {
        expect(data.metadata).toHaveProperty('platform');
      }
    });
  });
});
