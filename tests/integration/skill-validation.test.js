import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ClaudeValidator } from '../../bin/lib/frontmatter/claude-validator.js';
import { CopilotValidator } from '../../bin/lib/frontmatter/copilot-validator.js';
import { CodexValidator } from '../../bin/lib/frontmatter/codex-validator.js';
import { ValidationError } from '../../bin/lib/frontmatter/validation-error.js';

describe('Skill Validation', () => {
  let tempDir;
  
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'skill-validation-test-'));
  });
  
  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });
  
  describe('Required Field Validation', () => {
    it('should reject skill with missing name', () => {
      const validator = new ClaudeValidator();
      const frontmatter = { description: 'Test description' };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).toThrow(ValidationError);
    });
    
    it('should reject skill with missing description', () => {
      const validator = new ClaudeValidator();
      const frontmatter = { name: 'test-skill' };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).toThrow(ValidationError);
    });
    
    it('should reject name with invalid characters', () => {
      const validator = new ClaudeValidator();
      const frontmatter = { name: 'invalid!name', description: 'Test' };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).toThrow(ValidationError);
    });
    
    it('should reject name over 64 characters', () => {
      const validator = new ClaudeValidator();
      const longName = 'a'.repeat(65);
      const frontmatter = { name: longName, description: 'Test' };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).toThrow(ValidationError);
    });
    
    it('should reject description over 1024 characters', () => {
      const validator = new ClaudeValidator();
      const longDesc = 'a'.repeat(1025);
      const frontmatter = { name: 'test-skill', description: longDesc };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).toThrow(ValidationError);
    });
  });
  
  describe('Valid Frontmatter', () => {
    it('should accept valid skill frontmatter', () => {
      const validator = new ClaudeValidator();
      const frontmatter = {
        name: 'gsd-test-skill',
        description: 'A valid test skill'
      };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).not.toThrow();
    });
    
    it('should accept valid optional fields', () => {
      const validator = new ClaudeValidator();
      const frontmatter = {
        name: 'gsd-test-skill',
        description: 'A valid test skill',
        'allowed-tools': 'Read, Write, Bash',
        'argument-hint': '[project-name]'
      };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).not.toThrow();
    });
  });
  
  describe('Platform Validators', () => {
    it('should validate with ClaudeValidator', () => {
      const validator = new ClaudeValidator();
      const frontmatter = {
        name: 'gsd-test-skill',
        description: 'Test skill for Claude'
      };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'claude' };
      
      expect(() => validator.validate(frontmatter, context)).not.toThrow();
    });
    
    it('should validate with CopilotValidator', () => {
      const validator = new CopilotValidator();
      const frontmatter = {
        name: 'gsd-test-skill',
        description: 'Test skill for Copilot'
      };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'copilot' };
      
      expect(() => validator.validate(frontmatter, context)).not.toThrow();
    });
    
    it('should validate with CodexValidator', () => {
      const validator = new CodexValidator();
      const frontmatter = {
        name: 'gsd-test-skill',
        description: 'Test skill for Codex'
      };
      const context = { templateName: 'test-skill', filePath: 'test.md', platform: 'codex' };
      
      expect(() => validator.validate(frontmatter, context)).not.toThrow();
    });
  });
  
  describe('ValidationError Formatting', () => {
    it('should format error with all context', () => {
      const error = new ValidationError('Test error message', {
        template: 'gsd-test-skill',
        platform: 'claude',
        field: 'name',
        value: 'bad!name',
        expected: 'Letters, numbers, and hyphens only',
        spec: 'https://agentskills.io/specification#name-field'
      });
      
      const output = error.toConsoleOutput();
      expect(output).toContain('❌ VALIDATION ERROR');
      expect(output).toContain('Template:  gsd-test-skill');
      expect(output).toContain('Platform:  claude');
      expect(output).toContain('Field:     name');
      expect(output).toContain('bad!name');
      expect(output).toContain('https://agentskills.io/specification');
      expect(output).toContain('github.com/shoootyou/get-shit-done-multi/issues');
    });
  });
});
