// tests/integration/platform-instructions.test.js

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installPlatformInstructions } from '../../bin/lib/installer/install-platform-instructions.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';

describe('platform-instructions integration', () => {
  let testDir;
  let templatesDir;
  let targetDir;
  
  beforeEach(async () => {
    // Create unique test directory
    testDir = mkdtempSync(join(tmpdir(), 'gsd-test-instructions-'));
    templatesDir = join(testDir, 'templates');
    targetDir = join(testDir, 'target');
    
    await mkdir(templatesDir, { recursive: true });
    await mkdir(targetDir, { recursive: true });
    
    // Create template file
    const templateContent = `# Instructions for GSD

- Use the get-shit-done skill when the user asks for GSD or uses a \`{{COMMAND_PREFIX}}...\` or \`gsd-...\` command.
- Treat \`{{COMMAND_PREFIX}}...\` or \`gsd-...\` as command invocations and load the matching file from \`{{PLATFORM_ROOT}}/get-shit-done/commands/gsd/\`.
- When a command says to spawn a subagent, prefer a matching custom agent from \`{{PLATFORM_ROOT}}/agents\`.
- Do not apply GSD workflows unless the user explicitly asks for them.`;
    
    await writeFile(join(templatesDir, 'AGENTS.md'), templateContent, 'utf8');
  });
  
  afterEach(() => {
    // Cleanup test directory
    rmSync(testDir, { recursive: true, force: true });
  });
  
  // Helper: Create mock adapter
  function createMockAdapter(platform, instructionsPath) {
    return {
      platform,
      platformName: platform.charAt(0).toUpperCase() + platform.slice(1),
      getInstructionsPath: () => instructionsPath
    };
  }
  
  describe('scenario: create new file', () => {
    it('should create file when destination does not exist', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      const count = await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      expect(count).toBe(1);
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('# Instructions for GSD');
      expect(content).toContain('.claude/get-shit-done/commands/gsd/');
      expect(content).toContain('/gsd-');
      expect(content).not.toContain('{{PLATFORM_ROOT}}');
      expect(content).not.toContain('{{COMMAND_PREFIX}}');
    });
  });
  
  describe('scenario: append to existing', () => {
    it('should append when no start marker found', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      // Pre-create file with user content
      const existingContent = `# My Custom Instructions

These are my custom instructions.`;
      await writeFile(destPath, existingContent, 'utf8');
      
      const count = await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      expect(count).toBe(1);
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('# My Custom Instructions');
      expect(content).toContain('# Instructions for GSD');
      
      // Check blank line separator
      const lines = content.split('\n');
      const gsdIndex = lines.findIndex(l => l === '# Instructions for GSD');
      expect(lines[gsdIndex - 1]).toBe(''); // Blank line before GSD block
    });
  });
  
  describe('scenario: replace existing block', () => {
    it('should skip when content matches exactly', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      // Install once
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const contentAfterFirst = await readFile(destPath, 'utf8');
      
      // Install again (should skip)
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const contentAfterSecond = await readFile(destPath, 'utf8');
      
      // Content should be identical (no duplication)
      expect(contentAfterFirst).toBe(contentAfterSecond);
    });
    
    it('should replace when content differs', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      // Pre-create file with outdated GSD block
      const existingContent = `# Instructions for GSD

- Old instruction 1
- Old instruction 2
- Do not apply GSD workflows unless the user explicitly asks for them.`;
      await writeFile(destPath, existingContent, 'utf8');
      
      const count = await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      expect(count).toBe(1);
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('Use the get-shit-done skill');
      expect(content).not.toContain('Old instruction 1');
      
      // Should only have one occurrence of start marker
      const occurrences = (content.match(/# Instructions for GSD/g) || []).length;
      expect(occurrences).toBe(1);
    });
  });
  
  describe('scenario: interruption handling', () => {
    it('should insert before markdown title when block is interrupted', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      // Pre-create file with user section interrupting expected block
      const existingContent = `# Instructions for GSD

- Old instruction

## My Custom Section

My custom content here.`;
      await writeFile(destPath, existingContent, 'utf8');
      
      const count = await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      expect(count).toBe(1);
      
      const content = await readFile(destPath, 'utf8');
      
      // GSD block should be complete
      expect(content).toContain('Use the get-shit-done skill');
      expect(content).toContain('Do not apply GSD workflows');
      
      // User section should be preserved
      expect(content).toContain('## My Custom Section');
      expect(content).toContain('My custom content here.');
      
      // User section should come after GSD block
      const gsdEnd = content.indexOf('Do not apply GSD workflows');
      const userSection = content.indexOf('## My Custom Section');
      expect(userSection).toBeGreaterThan(gsdEnd);
    });
  });
  
  describe('edge case: line endings', () => {
    it('should handle CRLF line endings correctly', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      // Install with LF (normal)
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const contentLF = await readFile(destPath, 'utf8');
      
      // Convert to CRLF
      const contentCRLF = contentLF.replace(/\n/g, '\r\n');
      await writeFile(destPath, contentCRLF, 'utf8');
      
      // Install again (should recognize as identical despite CRLF)
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const contentAfter = await readFile(destPath, 'utf8');
      
      // Should only have one occurrence (no duplication)
      const occurrences = (contentAfter.match(/# Instructions for GSD/g) || []).length;
      expect(occurrences).toBe(1);
    });
  });
  
  describe('platform-specific paths', () => {
    it('should use correct path for Claude local', async () => {
      const destPath = join(targetDir, 'CLAUDE.md'); // Root
      const adapter = createMockAdapter('claude', destPath);
      const variables = { 
        PLATFORM_ROOT: '.claude', 
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('.claude/');
    });
    
    it('should use correct path for Copilot local', async () => {
      const githubDir = join(targetDir, '.github');
      await mkdir(githubDir, { recursive: true });
      const destPath = join(githubDir, 'copilot-instructions.md'); // .github/
      const adapter = createMockAdapter('copilot', destPath);
      const variables = { 
        PLATFORM_ROOT: '.github', 
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('.github/');
    });
    
    it('should use correct path for Codex local', async () => {
      const destPath = join(targetDir, 'AGENTS.md'); // Root
      const adapter = createMockAdapter('codex', destPath);
      const variables = { 
        PLATFORM_ROOT: '.codex', 
        COMMAND_PREFIX: '$gsd-',
        isGlobal: false
      };
      
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('.codex/');
      expect(content).toContain('$gsd-'); // Codex uses $ prefix
    });
  });
  
  describe('variable replacement', () => {
    it('should replace PLATFORM_ROOT variable', async () => {
      const destPath = join(targetDir, 'CLAUDE.md');
      const adapter = createMockAdapter('claude', destPath);
      const variables = {
        PLATFORM_ROOT: '.claude',
        COMMAND_PREFIX: '/gsd-',
        isGlobal: false
      };
      
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('.claude/get-shit-done/commands/gsd/');
      expect(content).toContain('.claude/agents');
      expect(content).not.toContain('{{PLATFORM_ROOT}}');
    });
    
    it('should replace COMMAND_PREFIX variable', async () => {
      const destPath = join(targetDir, 'AGENTS.md');
      const adapter = createMockAdapter('codex', destPath);
      const variables = {
        PLATFORM_ROOT: '.codex',
        COMMAND_PREFIX: '$gsd-',
        isGlobal: false
      };
      
      await installPlatformInstructions(
        templatesDir,
        targetDir,
        variables,
        null,
        false,
        adapter
      );
      
      const content = await readFile(destPath, 'utf8');
      expect(content).toContain('$gsd-');
      expect(content).not.toContain('{{COMMAND_PREFIX}}');
    });
  });
});
