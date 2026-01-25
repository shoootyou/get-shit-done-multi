// bin/lib/output/reporter.test.js
const Reporter = require('./reporter');

// Mock boxen to avoid ESM import issues in Jest
jest.mock('boxen', () => ({
  default: (text, options) => {
    // Simple box mock that returns text wrapped in box chars
    const lines = text.split('\n');
    const width = Math.max(...lines.map(l => l.length)) + 4;
    const top = '┌' + '─'.repeat(width - 2) + '┐';
    const bottom = '└' + '─'.repeat(width - 2) + '┘';
    const content = lines.map(l => `│ ${l.padEnd(width - 4)} │`).join('\n');
    return `${top}\n${content}\n${bottom}`;
  }
}));

describe('Reporter', () => {
  let output;
  let reporter;

  beforeEach(() => {
    output = [];
    reporter = new Reporter({
      write: (msg) => output.push(msg),
      silent: false
    });
  });

  describe('constructor', () => {
    test('creates reporter with default options', () => {
      const r = new Reporter();
      expect(r.indentLevel).toBe(0);
      expect(r.silent).toBe(false);
    });

    test('accepts custom write function', () => {
      const customOutput = [];
      const r = new Reporter({
        write: (msg) => customOutput.push(msg)
      });
      r.success('test');
      expect(customOutput.length).toBeGreaterThan(0);
    });

    test('respects silent mode', () => {
      const r = new Reporter({ silent: true, write: (msg) => output.push(msg) });
      r.success('test');
      expect(output.length).toBe(0);
    });
  });

  describe('platformStart', () => {
    test('outputs platform name and scope', () => {
      reporter.platformStart('claude', 'global');
      const text = output.join('');
      expect(text).toContain('Installing claude (global)');
    });

    test('increments indent level', () => {
      reporter.platformStart('claude', 'global');
      expect(reporter.indentLevel).toBe(1);
    });

    test('sets context', () => {
      reporter.platformStart('claude', 'global');
      expect(reporter.context.platform).toBe('claude');
      expect(reporter.context.scope).toBe('global');
    });
  });

  describe('platformSuccess', () => {
    test('outputs success with path', () => {
      reporter.platformStart('claude', 'global');
      reporter.platformSuccess('claude', { path: '~/.claude/' });
      const text = output.join('');
      expect(text).toContain('✓');
      expect(text).toContain('~/.claude/');
    });

    test('includes counts when provided', () => {
      reporter.platformStart('claude', 'global');
      reporter.platformSuccess('claude', {
        path: '~/.claude/',
        commands: 5,
        agents: 13,
        skills: 2
      });
      const text = output.join('');
      expect(text).toContain('5 commands');
      expect(text).toContain('13 agents');
      expect(text).toContain('2 skills');
    });

    test('decrements indent level', () => {
      reporter.platformStart('claude', 'global');
      reporter.platformSuccess('claude', { path: '~/.claude/' });
      expect(reporter.indentLevel).toBe(0);
    });

    test('indents output under platform', () => {
      reporter.platformStart('claude', 'global');
      output = []; // Clear start message
      reporter.platformSuccess('claude', { path: '~/.claude/' });
      const text = output.join('');
      expect(text).toMatch(/^  /); // Starts with 2 spaces
    });
  });

  describe('platformError', () => {
    test('outputs error message', () => {
      reporter.platformStart('claude', 'global');
      reporter.platformError('claude', new Error('Permission denied'));
      const text = output.join('');
      expect(text).toContain('✗');
      expect(text).toContain('Permission denied');
    });

    test('decrements indent level', () => {
      reporter.platformStart('claude', 'global');
      reporter.platformError('claude', new Error('test'));
      expect(reporter.indentLevel).toBe(0);
    });
  });

  describe('warning', () => {
    test('displays boxed warning', async () => {
      await reporter.warning('Test warning', { confirm: false });
      const text = output.join('');
      expect(text).toContain('WARNING');
      expect(text).toContain('Test warning');
      expect(text).toContain('─'); // Box border
    });

    test('returns true when no confirmation needed', async () => {
      const result = await reporter.warning('Test', { confirm: false });
      expect(result).toBe(true);
    });
  });

  describe('summary', () => {
    test('shows succeeded platforms', () => {
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: true }
      ];
      reporter.summary(results);
      const text = output.join('');
      expect(text).toContain('✓');
      expect(text).toContain('claude, copilot');
    });

    test('shows failed platforms with errors', () => {
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: false, error: new Error('Failed') }
      ];
      reporter.summary(results);
      const text = output.join('');
      expect(text).toContain('claude installed');
      expect(text).toContain('✗ Errors:');
      expect(text).toContain('copilot: Failed');
    });

    test('handles all successes', () => {
      const results = [
        { platform: 'claude', success: true },
        { platform: 'copilot', success: true },
        { platform: 'codex', success: true }
      ];
      reporter.summary(results);
      const text = output.join('');
      expect(text).toContain('claude, copilot, codex installed');
      expect(text).not.toContain('Errors');
    });

    test('handles all failures', () => {
      const results = [
        { platform: 'claude', success: false, error: new Error('E1') },
        { platform: 'copilot', success: false, error: new Error('E2') }
      ];
      reporter.summary(results);
      const text = output.join('');
      expect(text).not.toContain('installed');
      expect(text).toContain('Errors:');
      expect(text).toContain('claude: E1');
      expect(text).toContain('copilot: E2');
    });
  });

  describe('success', () => {
    test('outputs success message', () => {
      reporter.success('Operation complete');
      const text = output.join('');
      expect(text).toContain('✓');
      expect(text).toContain('Operation complete');
    });
  });

  describe('error', () => {
    test('outputs error message', () => {
      reporter.error('Something went wrong');
      const text = output.join('');
      expect(text).toContain('✗');
      expect(text).toContain('Something went wrong');
    });
  });

  describe('info', () => {
    test('outputs info message', () => {
      reporter.info('Additional context');
      const text = output.join('');
      expect(text).toContain('Additional context');
    });
  });
});
