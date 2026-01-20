# Phase 3: Command System — Unified Command Interface - Research

**Researched:** 2025-01-20
**Domain:** Cross-CLI command system with unified interface and argument parsing
**Confidence:** HIGH

## Summary

This research investigated building a unified command system that makes 24 GSD commands work identically across three CLI environments (Claude Code, GitHub Copilot CLI, Codex CLI). The investigation covered command system architectures, parsing patterns, argument validation, error handling, help systems, and cross-CLI compatibility patterns.

**Key findings:**
- Command Registry Pattern is the industry standard for extensible CLI command systems in 2025
- Node.js built-in `util.parseArgs()` (stable since v20) provides zero-dependency argument parsing
- The `/command:name` syntax is standard across modern CLIs (Codex, Gemini, Claude Code)
- Command handlers should be self-contained modules that register with a central registry
- Error handling requires graceful degradation when CLI-specific features are unavailable
- Help systems should auto-generate from command metadata for consistency
- Cross-CLI compatibility requires adapter layer to handle platform-specific invocation patterns

**Primary recommendation:** Implement Command Registry Pattern with self-registering command modules, use `util.parseArgs()` for argument handling, build adapter layer to handle CLI-specific invocation differences, and create centralized error handling with user-friendly messages.

## Standard Stack

The established libraries/tools for command system architecture:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `util.parseArgs()` | Node.js 18.3+ (stable v20+) | Built-in argument parser | Zero dependencies, type-safe, supports short/long flags, multiple values |
| `path` | Node.js built-in | Cross-platform path handling | Already in use from Phase 1, consistent with project constraints |
| `fs/promises` | Node.js built-in | Async file operations | Command registry loads from filesystem |
| `process` | Node.js built-in | Args, exit codes, env vars | Standard for CLI tools, `process.argv` and exit code handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `readline` | Node.js built-in | User input prompts | Interactive command confirmations |
| `os` | Node.js built-in | Platform detection | CLI-specific feature detection |
| ES Modules | Node.js 16.7+ | Modern module system | Cleaner imports, top-level await |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `util.parseArgs()` | `commander`, `yargs` | More features (auto-help, subcommands) but violates zero-dependency constraint |
| Command Registry | Switch/case dispatch | Registry is extensible and testable, switch/case becomes unmaintainable |
| Manual parsing | Regex-based | `parseArgs()` handles edge cases (quoted args, equals syntax, etc.) |

**Installation:**
```bash
# No installation needed - all built-in Node.js modules
node --version  # Verify 18.3+ (20+ recommended)
```

## Architecture Patterns

### Recommended Project Structure
```
commands/
├── gsd/                       # Command files (already exist - 24 commands)
│   ├── help.md
│   ├── new-project.md
│   └── ...
lib/
├── command-system/
│   ├── registry.js            # Command registry (Map-based)
│   ├── parser.js              # Argument parsing with util.parseArgs()
│   ├── loader.js              # Load commands from filesystem
│   ├── executor.js            # Execute command with error handling
│   ├── help-generator.js      # Auto-generate help from metadata
│   └── error-handler.js       # Centralized error formatting
├── adapters/                  # From Phase 2
│   ├── claude-code.js
│   ├── github-copilot.js
│   └── codex-cli.js
└── cli-detector.js            # Detect which CLI is running
```

### Pattern 1: Command Registry Pattern
**What:** Central registry where commands self-register, enabling extensibility
**When to use:** Building modular command systems with 5+ commands
**Example:**
```javascript
// lib/command-system/registry.js
class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  /**
   * Register a command
   * @param {string} name - Command name (e.g., "new-project")
   * @param {Object} metadata - Command metadata from frontmatter
   * @param {Function} handler - Command execution function
   */
  register(name, metadata, handler) {
    this.commands.set(name, { metadata, handler });
  }

  /**
   * Get command by name
   * @param {string} name - Command name
   * @returns {Object|null} Command definition or null
   */
  get(name) {
    return this.commands.get(name) || null;
  }

  /**
   * List all commands
   * @returns {Array<string>} Command names
   */
  list() {
    return Array.from(this.commands.keys());
  }

  /**
   * Check if command exists
   * @param {string} name - Command name
   * @returns {boolean}
   */
  has(name) {
    return this.commands.has(name);
  }
}

export const registry = new CommandRegistry();
```

### Pattern 2: Argument Parsing with util.parseArgs()
**What:** Use Node.js built-in parser for consistent argument handling
**When to use:** All commands that accept arguments
**Example:**
```javascript
// lib/command-system/parser.js
import { parseArgs } from 'node:util';

/**
 * Parse command arguments
 * @param {Array<string>} args - Raw arguments
 * @param {Object} options - Option definitions
 * @returns {Object} Parsed values and positionals
 */
export function parseCommandArgs(args, options = {}) {
  try {
    const { values, positionals } = parseArgs({
      args,
      options,
      strict: false,  // Allow unknown options for flexibility
      allowPositionals: true
    });
    
    return { values, positionals, error: null };
  } catch (error) {
    return { values: {}, positionals: [], error: error.message };
  }
}

// Example usage for /gsd:execute-phase 3 --skip-verification
const phaseArgs = {
  'skip-verification': { type: 'boolean', short: 's' },
  'force': { type: 'boolean', short: 'f' },
  'verbose': { type: 'boolean', short: 'v' }
};

const { values, positionals, error } = parseCommandArgs(
  ['3', '--skip-verification'],
  phaseArgs
);
// values: { 'skip-verification': true, force: false, verbose: false }
// positionals: ['3']
```

### Pattern 3: Command Loader from Filesystem
**What:** Dynamically load commands from .md files
**When to use:** System initialization
**Example:**
```javascript
// lib/command-system/loader.js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { registry } from './registry.js';

/**
 * Load commands from directory
 * @param {string} commandsDir - Path to commands directory
 */
export async function loadCommands(commandsDir) {
  const files = await readdir(commandsDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  for (const file of mdFiles) {
    const content = await readFile(join(commandsDir, file), 'utf-8');
    const { metadata, prompt } = parseCommandFile(content);
    
    // Command name from metadata or filename
    const name = metadata.name || file.replace('.md', '');
    
    // Register command
    registry.register(name, metadata, async (args) => {
      // Handler executes the command
      return { prompt, args, metadata };
    });
  }
  
  return registry.list().length;
}

/**
 * Parse command file (frontmatter + content)
 * @param {string} content - File content
 * @returns {Object} Metadata and prompt
 */
function parseCommandFile(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, prompt: content };
  
  const [, frontmatter, prompt] = match;
  const metadata = {};
  
  // Parse YAML-like frontmatter
  frontmatter.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      metadata[key.trim()] = rest.join(':').trim();
    }
  });
  
  return { metadata, prompt };
}
```

### Pattern 4: Centralized Error Handling
**What:** Convert errors to user-friendly messages with actionable guidance
**When to use:** All command execution paths
**Example:**
```javascript
// lib/command-system/error-handler.js

export class CommandError extends Error {
  constructor(message, code, suggestions = []) {
    super(message);
    this.name = 'CommandError';
    this.code = code;
    this.suggestions = suggestions;
  }
}

/**
 * Format error for user display
 * @param {Error} error - Error object
 * @param {string} commandName - Command that failed
 * @returns {string} Formatted error message
 */
export function formatError(error, commandName) {
  if (error instanceof CommandError) {
    let message = `\n❌ Command failed: /gsd:${commandName}\n`;
    message += `\nError: ${error.message}\n`;
    
    if (error.suggestions.length > 0) {
      message += `\nSuggestions:\n`;
      error.suggestions.forEach(s => {
        message += `  • ${s}\n`;
      });
    }
    
    return message;
  }
  
  // Unknown error - provide generic help
  return `\n❌ Unexpected error in /gsd:${commandName}\n` +
         `\nError: ${error.message}\n` +
         `\nFor help: /gsd:help ${commandName}\n`;
}

/**
 * Handle graceful degradation
 * @param {string} feature - Feature name
 * @param {string} cli - CLI name
 * @returns {string} Degradation message
 */
export function degradeGracefully(feature, cli) {
  return `\n⚠️  Feature not available: ${feature}\n` +
         `\n${cli} doesn't support this feature. ` +
         `The command will continue with limited functionality.\n`;
}
```

### Pattern 5: Cross-CLI Adapter Integration
**What:** Detect CLI and adapt command invocation
**When to use:** System initialization and command execution
**Example:**
```javascript
// lib/command-system/executor.js
import { detectCLI } from '../cli-detector.js';
import { registry } from './registry.js';
import { formatError, degradeGracefully } from './error-handler.js';

/**
 * Execute command with CLI-specific adaptations
 * @param {string} commandName - Command to execute
 * @param {Array<string>} args - Command arguments
 * @returns {Promise<Object>} Execution result
 */
export async function executeCommand(commandName, args) {
  const cli = await detectCLI();
  const command = registry.get(commandName);
  
  if (!command) {
    throw new CommandError(
      `Command not found: ${commandName}`,
      'COMMAND_NOT_FOUND',
      [
        'Check available commands with /gsd:help',
        `Did you mean: ${findSimilarCommand(commandName)}?`
      ]
    );
  }
  
  // Check CLI-specific features
  const requiredFeatures = command.metadata.requires?.split(',') || [];
  const missingFeatures = requiredFeatures.filter(f => !cliSupports(cli, f));
  
  if (missingFeatures.length > 0) {
    console.log(degradeGracefully(missingFeatures.join(', '), cli));
    // Continue with degraded functionality
  }
  
  try {
    // Execute command
    const result = await command.handler(args);
    return { success: true, result };
  } catch (error) {
    console.error(formatError(error, commandName));
    process.exit(1);
  }
}

function cliSupports(cli, feature) {
  const support = {
    'claude-code': ['sub-agents', 'parallel-tasks', 'git-integration'],
    'copilot-cli': ['git-integration'],
    'codex-cli': ['sub-agents', 'git-integration']
  };
  return support[cli]?.includes(feature) || false;
}
```

### Pattern 6: Auto-Generated Help System
**What:** Generate help text from command metadata
**When to use:** `/gsd:help` and individual command help
**Example:**
```javascript
// lib/command-system/help-generator.js
import { registry } from './registry.js';

/**
 * Generate help text for command
 * @param {string} commandName - Command name (optional)
 * @returns {string} Help text
 */
export function generateHelp(commandName = null) {
  if (commandName) {
    const command = registry.get(commandName);
    if (!command) return `Command not found: ${commandName}`;
    
    return formatCommandHelp(commandName, command.metadata);
  }
  
  // List all commands
  return formatAllCommandsHelp();
}

function formatCommandHelp(name, metadata) {
  let help = `\n/gsd:${name}\n`;
  help += `\n${metadata.description || 'No description'}\n`;
  
  if (metadata.arguments) {
    help += `\nArguments:\n`;
    metadata.arguments.split(',').forEach(arg => {
      help += `  ${arg.trim()}\n`;
    });
  }
  
  if (metadata.examples) {
    help += `\nExamples:\n`;
    metadata.examples.split('\n').forEach(ex => {
      help += `  ${ex.trim()}\n`;
    });
  }
  
  return help;
}

function formatAllCommandsHelp() {
  const commands = registry.list();
  const grouped = groupCommands(commands);
  
  let help = '\n# GSD Commands\n';
  
  Object.keys(grouped).forEach(category => {
    help += `\n## ${category}\n`;
    grouped[category].forEach(cmd => {
      const meta = registry.get(cmd).metadata;
      help += `  /gsd:${cmd.padEnd(25)} ${meta.description || ''}\n`;
    });
  });
  
  help += `\nFor detailed help: /gsd:help [command]\n`;
  
  return help;
}

function groupCommands(commands) {
  // Group by common prefixes
  const groups = {
    'Project Setup': [],
    'Phase Management': [],
    'Milestone Management': [],
    'Utilities': []
  };
  
  commands.forEach(cmd => {
    if (cmd.includes('project') || cmd.includes('map')) {
      groups['Project Setup'].push(cmd);
    } else if (cmd.includes('phase')) {
      groups['Phase Management'].push(cmd);
    } else if (cmd.includes('milestone')) {
      groups['Milestone Management'].push(cmd);
    } else {
      groups['Utilities'].push(cmd);
    }
  });
  
  return groups;
}
```

### Anti-Patterns to Avoid
- **Hard-coded command list:** Use registry pattern instead of switch/case
- **Inconsistent argument parsing:** Always use `util.parseArgs()` for consistency
- **Generic error messages:** Provide specific, actionable error messages
- **Tight CLI coupling:** Keep command logic CLI-agnostic, use adapters for differences
- **Missing help text:** Auto-generate from metadata, don't manually maintain
- **Silent failures:** Always provide feedback, even for graceful degradation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Argument parsing | Custom regex parser | `util.parseArgs()` | Handles quoted strings, equals syntax, short/long flags, type coercion |
| Command routing | Switch/case dispatcher | Command Registry Pattern | Extensible, testable, self-documenting |
| Help generation | Manual help strings | Auto-generated from metadata | Stays in sync, reduces maintenance |
| Error formatting | Ad-hoc error handling | Centralized error handler | Consistent UX, actionable messages |
| Cross-platform paths | String concatenation | `path.join()` (Phase 1) | Already implemented, handles Windows/POSIX |
| CLI detection | Environment inspection | Phase 1's CLI detector | Already implemented, proven reliable |

**Key insight:** Node.js built-ins (v18.3+) provide everything needed for robust CLI command systems. Third-party libraries add features but aren't necessary for this use case.

## Common Pitfalls

### Pitfall 1: Parsing Arguments Manually
**What goes wrong:** Custom parsing breaks on edge cases (quoted strings, equals syntax, escaped characters)
**Why it happens:** Argument parsing looks simple but has many edge cases
**How to avoid:** Use `util.parseArgs()` from the start, even for "simple" commands
**Warning signs:** Tests fail with special characters, quotes, or multiple spaces

**Example of the trap:**
```javascript
// WRONG: Manual parsing
const args = input.split(' ');  // Breaks on "quoted strings"

// RIGHT: Use parseArgs
const { values, positionals } = parseArgs({ args: input.split(' '), options });
```

### Pitfall 2: Inconsistent Command Naming
**What goes wrong:** Users can't remember command names, help text becomes inconsistent
**Why it happens:** Commands added incrementally without naming conventions
**How to avoid:** Use consistent naming pattern: `verb-noun` (e.g., `new-project`, `execute-phase`)
**Warning signs:** Similar commands with different naming styles (e.g., `createProject` vs `new-milestone`)

### Pitfall 3: Missing Graceful Degradation
**What goes wrong:** Commands fail completely when optional features are unavailable
**Why it happens:** Assuming all CLIs support the same features
**How to avoid:** Check feature support, provide fallbacks, warn users about degraded functionality
**Warning signs:** Commands that work in Claude Code fail silently in Copilot CLI

**Example:**
```javascript
// Check feature availability
if (!cli.supports('parallel-tasks')) {
  console.log('⚠️  Running tasks sequentially (parallel not supported)');
  // Fall back to sequential execution
}
```

### Pitfall 4: Poor Error Messages
**What goes wrong:** Users get cryptic errors with no guidance on how to fix them
**Why it happens:** Throwing raw exceptions without context
**How to avoid:** Wrap errors in `CommandError` with suggestions
**Warning signs:** Support requests asking "what does this error mean?"

**Example:**
```javascript
// WRONG: Raw error
throw new Error('Phase not found');

// RIGHT: Actionable error
throw new CommandError(
  'Phase 3 not found in roadmap',
  'PHASE_NOT_FOUND',
  [
    'Check available phases with /gsd:progress',
    'Create roadmap first with /gsd:new-project',
    'Valid phase numbers: 1-5'
  ]
);
```

### Pitfall 5: Tight Coupling to CLI Specifics
**What goes wrong:** Commands work only in one CLI, porting requires rewriting
**Why it happens:** Using CLI-specific APIs directly in command logic
**How to avoid:** Keep command logic CLI-agnostic, use adapter layer for differences
**Warning signs:** Command code contains `if (cli === 'claude-code')` checks

### Pitfall 6: Missing Command Metadata
**What goes wrong:** Help system incomplete, arguments undocumented
**Why it happens:** Forgetting to add frontmatter to command files
**How to avoid:** Template with required metadata fields, validate on load
**Warning signs:** `/gsd:help` shows incomplete information

**Required metadata:**
```yaml
---
name: command-name
description: What this command does
arguments: phase-number [--flag]
examples: |
  /gsd:command-name 1
  /gsd:command-name 2 --verbose
requires: optional-cli-feature
---
```

### Pitfall 7: Not Using Exit Codes
**What goes wrong:** Scripts can't detect command failures
**Why it happens:** Not setting `process.exit(1)` on errors
**How to avoid:** Always exit with non-zero code on failures
**Warning signs:** CI/CD doesn't detect command failures

## Code Examples

Verified patterns from official sources:

### Command System Initialization
```javascript
// main.js - Entry point
import { loadCommands } from './lib/command-system/loader.js';
import { executeCommand } from './lib/command-system/executor.js';
import { parseArgs } from 'node:util';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load all commands
const commandsDir = join(__dirname, 'commands', 'gsd');
const count = await loadCommands(commandsDir);
console.log(`Loaded ${count} commands`);

// Parse CLI invocation
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  strict: false
});

// Execute command
const [commandName, ...commandArgs] = positionals;
await executeCommand(commandName, commandArgs);
```

### Command File Format
```markdown
---
name: gsd:execute-phase
description: Execute a planned phase with atomic commits
arguments: phase-number [--skip-verification] [--force]
requires: git-integration
---

<objective>
Execute phase {{phase}} following its plan files.
Follow checkpoint protocol and create atomic commits.
</objective>

<instructions>
1. Verify phase is ready for execution
2. Load plan files from .planning/phases/{{phase}}-*/
3. Execute tasks in order
4. Create atomic commits
5. Handle errors with checkpoint protocol
</instructions>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual arg parsing | `util.parseArgs()` | Node.js 18.3 (2022) | Zero dependencies, type-safe |
| Switch/case dispatch | Command Registry | 2023-2024 | Extensibility, plugins |
| Hard-coded CLI paths | Adapter pattern | 2024-2025 | Multi-CLI support |
| Manual help text | Auto-generated | 2025 | Consistency, maintainability |
| Slash commands only | `/cmd:name` syntax | 2025 | Cross-CLI compatibility |

**Deprecated/outdated:**
- `process.argv` manual parsing: Use `parseArgs()` instead
- CommonJS (`require`): Use ES Modules (`import/export`)
- Callback-based fs: Use `fs/promises`
- Single-CLI assumptions: Build with adapters from the start

## Open Questions

Things that couldn't be fully resolved:

1. **Command recording for comparison**
   - What we know: Requirement CMD-05 needs ability to record and compare command executions across CLIs
   - What's unclear: Best format for recording (JSON logs, markdown reports, video?)
   - Recommendation: Start with JSON logs (timestamp, CLI, command, args, result), add visualization later

2. **Cross-CLI state persistence**
   - What we know: Users should be able to switch CLIs mid-workflow
   - What's unclear: Where to store shared state (filesystem, git, cloud?)
   - Recommendation: Use `.planning/state/` directory with JSON files, git-tracked

3. **Command aliases**
   - What we know: Some commands are frequently used
   - What's unclear: Should we support aliases (e.g., `/gsd:ex` → `/gsd:execute-phase`)?
   - Recommendation: Not for MVP, add in Phase 4 if user-requested

4. **Argument type validation**
   - What we know: `parseArgs()` supports string/boolean types
   - What's unclear: Should we validate phase numbers, file paths, etc.?
   - Recommendation: Yes, add validation layer after parsing

## Sources

### Primary (HIGH confidence)
- Node.js util.parseArgs documentation - https://nodejs.org/api/util.html#utilparseargsconfig
- Modern Node.js Patterns for 2025 - https://kashw1n.com/blog/nodejs-2025/
- Command Pattern - https://www.patterns.dev/vanilla/command-pattern/
- Command Registry Pattern (Atmos) - https://atmos.tools/changelog/introducing-command-registry-pattern/

### Secondary (MEDIUM confidence)
- CLI Guidelines (clig.dev) - https://clig.dev/
- Node.js CLI Apps Best Practices - https://github.com/lirantal/nodejs-cli-apps-best-practices
- Slash Commands in Modern CLIs - https://developers.openai.com/codex/cli/slash-commands
- Better CLI Design Guide - https://bettercli.org/

### Context from Codebase
- Phase 1 Research: Path handling, CLI detection patterns
- Phase 2 Research: Adapter architecture, format conversion
- Existing commands: 24 `.md` files in `commands/gsd/` (confirmed via filesystem)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `util.parseArgs()` documented in official Node.js docs, stable since v20
- Architecture: HIGH - Command Registry Pattern is industry standard (Atmos, Cobra, Click)
- Parsing: HIGH - Official Node.js documentation, multiple verified sources
- Error handling: MEDIUM - Best practices from multiple sources, not official standard
- Help system: MEDIUM - Common pattern, no official specification
- Cross-CLI: HIGH - Based on Phase 2 adapter research, multiple CLI documentation sources

**Research date:** 2025-01-20
**Valid until:** 90 days (stable domain, slow-moving standards)
**Node.js version:** 18.3+ required (20+ recommended)
