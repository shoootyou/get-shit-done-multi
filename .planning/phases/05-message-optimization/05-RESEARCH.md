# Phase 5: Message Optimization - Research

**Researched:** 2026-01-25
**Domain:** Node.js CLI message management and terminal output
**Confidence:** HIGH

## Summary

Research focused on implementing clean, context-aware CLI output for multi-platform installations. Key findings establish that:

1. **boxen** is the standard library for terminal box drawing (8.0.1, 1M+ weekly downloads)
2. **prompts** (already a dependency) provides user confirmation with clean API
3. Centralized Reporter pattern is the established architecture for CLI message management
4. Exit code 2 for "partial success" conflicts with POSIX standards - should use exit 1 for any failure
5. Windows 10+ supports Unicode box-drawing characters natively; no fallback detection needed

**Primary recommendation:** Build a centralized Reporter module using boxen for warnings, prompts for confirmation, and follow npm/make conventions for exit codes (0=all success, 1=any failure).

## Standard Stack

The established libraries for Node.js CLI terminal output:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| boxen | 8.0.1 | Create boxes in terminal | Industry standard (by sindresorhus), 1M+ weekly downloads, handles all edge cases (dynamic width, multi-line, padding, borders) |
| prompts | 2.4.2 | User input prompts | Already a dependency, lightweight, async/await support, clean API for confirm prompts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cli-boxes | 2.2.1 | Box border characters | Used by boxen internally, provides all border styles (single, double, round, classic ASCII) |
| chalk | 4.1.2 | Terminal colors | Already a dependency, use for border colors in boxen |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| boxen | Hand-rolled box drawing | Custom gives full control but breaks on edge cases (multi-line, dynamic width, Windows compatibility) |
| prompts | inquirer | Inquirer is more full-featured but heavier (40+ dependencies vs prompts' minimal deps) |

**Installation:**
```bash
npm install boxen@^8.0.1
# prompts and chalk already installed
```

## Architecture Patterns

### Recommended Project Structure
```
bin/
└── lib/
    └── output/
        ├── reporter.js      # Centralized message manager (main class)
        ├── formatter.js     # Indentation, box wrapping utilities
        └── symbols.js       # Symbol constants (✓, ✗, ⚠️, ⠿)
```

### Pattern 1: Centralized Reporter Module (RECOMMENDED)
**What:** Single class/module handles all terminal output with methods per message type
**When to use:** Multi-platform installs with context-aware messaging
**Used by:** npm, yarn, pnpm, cargo

**Example:**
```javascript
// reporter.js
import boxen from 'boxen';
import prompts from 'prompts';

class Reporter {
  constructor(options = {}) {
    this.indentLevel = 0;
    this.write = options.write || ((msg) => process.stdout.write(msg));
    this.silent = options.silent || false;
  }

  platformStart(platform) {
    this._write(`Installing ${platform}...\n`);
    this.indentLevel++;
  }

  platformSuccess(platform, details) {
    const msg = `✓ Installed to ${details.path} ` +
                `(${details.commands} commands, ${details.agents} agents, ${details.skills} skills)`;
    this._writeIndented(msg + '\n');
    this.indentLevel--;
  }

  platformError(platform, error) {
    this._writeIndented(`✗ Error: ${error.message}\n`);
    this.indentLevel--;
  }

  async warning(message, options = {}) {
    const box = boxen(`⚠️  WARNING\n${message}`, {
      padding: 1,
      borderStyle: 'single',
      borderColor: 'yellow'
    });
    this._write('\n' + box + '\n');

    if (options.confirm) {
      const response = await prompts({
        type: 'confirm',
        name: 'continue',
        message: 'Continue?',
        initial: false
      }, {
        onCancel: () => {
          this._write('\nInstallation cancelled\n');
          process.exit(1);
        }
      });
      return response.continue;
    }
    return true;
  }

  summary(results) {
    const succeeded = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    this._write('\n');
    if (succeeded.length > 0) {
      const names = succeeded.map(r => r.platform).join(', ');
      this._write(`✓ ${names} installed\n`);
    }
    if (failed.length > 0) {
      const errors = failed.map(r => 
        `  ${r.platform}: ${r.error.message}`
      ).join('\n');
      this._write(`✗ Errors:\n${errors}\n`);
    }
  }

  _writeIndented(message) {
    const indent = '  '.repeat(this.indentLevel);
    this._write(indent + message);
  }

  _write(message) {
    if (!this.silent) {
      this.write(message);
    }
  }
}

export default Reporter;
```

**Usage:**
```javascript
import Reporter from './lib/output/reporter.js';

const reporter = new Reporter();
const results = [];

for (const platform of platforms) {
  reporter.platformStart(platform);
  
  // Check for warnings
  if (platform === 'codex' && scope === 'global') {
    const confirmed = await reporter.warning(
      'Global not supported for Codex\nInstalling locally instead',
      { confirm: true }
    );
    if (!confirmed) {
      results.push({ platform, skipped: true });
      continue;
    }
  }
  
  try {
    const details = await installPlatform(platform);
    reporter.platformSuccess(platform, details);
    results.push({ platform, success: true });
  } catch (error) {
    reporter.platformError(platform, error);
    results.push({ platform, success: false, error });
  }
}

reporter.summary(results);

// Exit codes
const allSuccess = results.every(r => r.success);
const allFailed = results.every(r => !r.success);
process.exit(allSuccess ? 0 : 1);
```

### Anti-Patterns to Avoid
- **console.log scattered everywhere:** Hard to test, inconsistent formatting, can't control verbosity
- **String concatenation for boxes:** Breaks on edge cases, doesn't handle multi-line, Windows incompatible
- **No summary after multi-operation:** User loses track of which platforms succeeded/failed

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Box-drawing in terminal | Manual string building with ┌─┐ characters | boxen library | Dynamic width, multi-line content, padding/margin math, border styles, ASCII fallback, handles all edge cases |
| User confirmation prompts | Custom readline logic | prompts library (confirm type) | Handles Ctrl+C, validation, async/await, consistent UX, keyboard navigation |
| Exit code logic | Custom codes (e.g., 2=partial) | POSIX conventions (0=success, 1=failure) | Shell scripts expect standard codes, automation tools break on custom codes |
| Multi-platform error tracking | Ad-hoc error display | Collect-then-display pattern | Users need overview, inline + summary provides both immediate feedback and final context |

**Key insight:** Box drawing is deceptively complex. Unicode characters, terminal width, multi-line wrapping, padding calculations, and Windows compatibility make custom solutions fragile. boxen handles all of this in 600 lines of well-tested code.

## Common Pitfalls

### Pitfall 1: Using Exit Code 2 for Partial Success
**What goes wrong:** Exit code 2 conflicts with POSIX convention for "misuse of shell command" (syntax error). Shell scripts checking `$? == 2` expect syntax errors, not partial success. Breaks automation tools.

**Why it happens:** Wanting to distinguish partial success from total failure seems useful.

**How to avoid:**
- Exit 0: All platforms succeeded
- Exit 1: Any platform failed (partial or total)
- Use summary message to show detail: `✓ Claude, Copilot | ✗ Codex failed`
- If distinguishing is critical, use exit 75 (EX_TEMPFAIL from sysexits.h) and document prominently

**Warning signs:**
- Custom exit codes in 1-10 range
- Exit codes without documentation
- Shell scripts behaving unexpectedly

**Reference:** POSIX IEEE Std 1003.1-2017, BSD sysexits.h

### Pitfall 2: Building Custom Box-Drawing Logic
**What goes wrong:** Manual concatenation of box characters breaks on variable-length text, multi-line content, and Windows terminals. Edge cases with padding/margins are numerous.

**Why it happens:** Looks simple: "just some characters around text"

**How to avoid:** Use boxen library which handles:
- Dynamic width calculation based on content
- Multi-line text with proper alignment
- Padding and margins
- Multiple border styles (single, double, classic ASCII)
- Terminal width overflow

**Warning signs:**
- String building with `+` operator and box characters
- Manual length calculation for borders
- Custom functions like `drawBox()` or `createBorder()`

### Pitfall 3: Console.log Scattered Throughout Code
**What goes wrong:** Output logic distributed across files makes testing require stdout mocking, creates inconsistent formatting, and prevents controlling verbosity.

**Why it happens:** Quick and easy during development.

**How to avoid:** Centralize all output through Reporter module with injected write function for testing.

**Warning signs:**
- `console.log` calls in business logic files
- Tests that mock console.log
- Inability to run operations silently

### Pitfall 4: No Summary After Multi-Platform Install
**What goes wrong:** User sees inline errors but loses track of overall results. Must scroll terminal history to see which platforms succeeded.

**Why it happens:** Inline error feels responsive; summary seems redundant.

**How to avoid:** 
- Collect results in array during execution
- Display summary at end
- Pattern: inline for immediate feedback + summary for overview

**Warning signs:**
- User asking "which ones worked?"
- No final status message
- Scrolling required to find results

### Pitfall 5: Not Handling Prompt Cancellation (Ctrl+C)
**What goes wrong:** User presses Ctrl+C during prompt, process shows stack trace or hangs instead of clean exit.

**Why it happens:** Default prompts behavior doesn't handle cancellation.

**How to avoid:**
```javascript
await prompts({...}, {
  onCancel: () => {
    console.log('\nOperation cancelled');
    process.exit(1);
  }
});
```

**Warning signs:**
- Ctrl+C shows error stack
- Process doesn't exit cleanly
- No cancellation message

### Pitfall 6: Prompt Mid-Operation Instead of Before
**What goes wrong:** Showing confirmation prompt during installation interrupts flow, can be missed in output buffer.

**Why it happens:** Wanting to warn at "critical moment"

**How to avoid:** Show warning and confirm BEFORE starting platform installation, not during.

**Warning signs:**
- Prompt appears after lots of output
- User misses prompt and installation hangs
- Need Ctrl+C to abort stuck operation

## Code Examples

Verified patterns from official sources and established libraries:

### Warning Box with Confirmation
```javascript
// Source: boxen v8.0.1 + prompts v2.4.2
import boxen from 'boxen';
import prompts from 'prompts';

async function showWarningAndConfirm(message) {
  // Display boxed warning
  const box = boxen(`⚠️  WARNING\n${message}`, {
    padding: 1,
    borderStyle: 'single',
    borderColor: 'yellow',
    title: '⚠️  WARNING',
    titleAlignment: 'center'
  });
  
  console.log('\n' + box);
  
  // Get confirmation
  const response = await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Continue?',
    initial: false  // Default to No (safer)
  }, {
    onCancel: () => {
      console.log('\nCancelled by user');
      process.exit(1);
    }
  });
  
  return response.continue;
}

// Usage
if (platform === 'codex' && scope === 'global') {
  const confirmed = await showWarningAndConfirm(
    'Global not supported for Codex\nInstalling locally instead'
  );
  if (!confirmed) {
    // Skip this platform
    continue;
  }
}
```

### Multi-Platform Result Collection
```javascript
// Source: Established pattern from npm, cargo, terraform
const results = [];

for (const platform of platforms) {
  reporter.platformStart(platform);
  
  try {
    const details = await installPlatform(platform);
    reporter.platformSuccess(platform, details);
    results.push({ platform, success: true, details });
  } catch (error) {
    reporter.platformError(platform, error);
    results.push({ platform, success: false, error });
    // Continue to next platform instead of exiting
  }
}

// Display summary
reporter.summary(results);

// Determine exit code
const hasFailures = results.some(r => !r.success);
process.exit(hasFailures ? 1 : 0);
```

### Indented Output for Grouping
```javascript
// Source: Common pattern in npm, yarn output
class Reporter {
  constructor() {
    this.indentLevel = 0;
  }
  
  indent() {
    this.indentLevel++;
  }
  
  outdent() {
    this.indentLevel = Math.max(0, this.indentLevel - 1);
  }
  
  write(message) {
    const indent = '  '.repeat(this.indentLevel);
    process.stdout.write(indent + message);
  }
}

// Usage
reporter.write('Installing Claude...\n');
reporter.indent();
reporter.write('✓ Installed to ~/.claude/ (23 files)\n');
reporter.outdent();

// Output:
// Installing Claude...
//   ✓ Installed to ~/.claude/ (23 files)
```

### ASCII Fallback for Legacy Terminals
```javascript
// Source: boxen borderStyle options
import boxen from 'boxen';

// Default: Unicode box-drawing
const box = boxen('Warning message', {
  borderStyle: 'single'  // ┌─┐│└┘
});

// Fallback: ASCII characters
const asciiBox = boxen('Warning message', {
  borderStyle: 'classic'  // +--+|
});

// Recommended: Use Unicode by default (Windows 10+ supports it)
// Only provide ASCII option if explicitly needed for ancient terminals
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom box drawing with string concatenation | boxen library | 2017+ | Eliminates edge cases, adds Windows support, handles dynamic content |
| Callback-based prompts (readline) | Async/await prompts | 2019+ (prompts 2.0) | Cleaner code, better error handling, easier integration |
| Colored output without terminal detection | chalk 4.x with automatic detection | 2020 (chalk 4.0) | Safer colors, auto-disables in CI, better Windows support |
| Exit code creativity (2=partial, 3=warning, etc.) | POSIX standard (0/1) + detailed messages | Always standard | Automation compatibility, predictable behavior |

**Deprecated/outdated:**
- **inquirer 8.x full package:** Replaced by modular @inquirer/prompts packages (lighter weight)
- **Custom box-drawing functions:** Replaced by boxen standard library
- **Commander.js for prompts:** Use dedicated prompting libraries (prompts or inquirer)
- **Exit code 2 for partial success:** Conflicts with POSIX (syntax error)

## Open Questions

Things that couldn't be fully resolved:

1. **Box width strategy**
   - What we know: boxen can auto-size or use fixed width
   - What's unclear: Should warning boxes be fixed width for consistency or auto-size for content?
   - Recommendation: Use auto-sizing (default) for flexibility; user terminals vary widely

2. **Multi-warning display**
   - What we know: Can combine multiple warnings in one box
   - What's unclear: Show warnings sequentially or batch them?
   - Recommendation: Sequential (pause before each platform) - matches user decision in CONTEXT.md

3. **Error message detail level**
   - What we know: CONTEXT.md specifies "minimal errors (just the problem)"
   - What's unclear: Include error code? Stack trace in verbose mode?
   - Recommendation: Just error message (no code, no stack) - matches minimal principle

## Sources

### Primary (HIGH confidence)
- **boxen v8.0.1** - npm package, README, tested locally
- **prompts v2.4.2** - npm package, README, tested locally
- **cli-boxes** - npm package used by boxen
- **POSIX IEEE Std 1003.1-2017** - exit code standards
- **BSD sysexits.h** - extended exit codes (FreeBSD man pages)

### Secondary (MEDIUM confidence)
- **npm CLI patterns** - observed behavior of npm 10.x multi-package installs
- **Node.js Windows UTF-8 support** - Node.js >= 16 documentation
- **Windows 10 terminal Unicode** - Windows Terminal documentation

### Verified behavior (HIGH confidence)
- Tested boxen box-drawing characters in Node.js 20
- Tested prompts confirm type with cancellation handling
- Verified exit codes: npm, make, git, rsync behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - boxen and prompts are established, widely-used libraries
- Architecture: HIGH - Reporter pattern is industry standard (npm, yarn, cargo)
- Pitfalls: HIGH - Exit code conflicts verified via POSIX standards and real CLI testing
- Windows Unicode: HIGH - Windows 10+ UTF-8 support documented, boxen handles fallback

**Research date:** 2026-01-25
**Valid until:** ~60 days (stable ecosystem, boxen/prompts mature libraries)

**Key assumption:** Target environment is Node.js >= 16.7.0 (from package.json) which aligns with Windows 10+ baseline for Unicode support.

**Critical finding:** Exit code 2 for partial success conflicts with POSIX standard. Must use exit 1 for any failure, rely on summary message to distinguish partial from total.
