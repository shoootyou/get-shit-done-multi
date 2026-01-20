# Coding Conventions

**Analysis Date:** 2026-01-20

**Analysis Scope:**
- Files reviewed: 53 source files
- Test files: 2 files

## Naming Patterns

**Files:**
- kebab-case: `usage-tracker.js`, `session-manager.js`, `state-io.js`, `directory-lock.js`
- test files: `*.test.js` suffix (e.g., `result-validator.test.js`, `performance-tracker.test.js`)

**Functions:**
- camelCase: `detectCLI()`, `getConfigPaths()`, `atomicWriteJSON()`, `replaceClaudePaths()`
- async functions: `async function runTests()`, `async function atomicReadJSON()`

**Variables:**
- camelCase: `stateDir`, `usageFile`, `maxEvents`, `lockPath`, `baseDelay`
- SCREAMING_SNAKE_CASE for module-level constants: `CURRENT_STATE_VERSION`

**Classes:**
- PascalCase: `UsageTracker`, `SessionManager`, `StateManager`, `DirectoryLock`, `ResultValidator`, `PerformanceTracker`

**Types:**
- JSDoc annotations used extensively for type documentation
- No TypeScript - pure JavaScript with JSDoc comments

## Code Style

**Formatting:**
- Indentation: 2 spaces
- Semicolons: Used consistently
- Quotes: Single quotes preferred, backticks for template literals
- Line length: Generally under 100 characters, broken with logical continuation

**Linting:**
- No linter configuration detected (no .eslintrc or similar)
- Code follows consistent manual conventions

## Import Organization

**Order:**
1. Node.js built-ins first: `import { promises as fs } from 'fs'`, `import path from 'path'`
2. Local ES6 modules: `import { atomicWriteJSON } from './state-io.js'`
3. CommonJS requires (in older files): `const fs = require('fs')`, `const path = require('path')`
4. CommonJS with createRequire bridge: `const require = createRequire(import.meta.url)` then `const { detectCLI } = require('../bin/lib/detect.js')`

**Path Aliases:**
- Relative paths only: `'./state-io.js'`, `'../bin/lib/detect.js'`
- No path aliases configured

**Module System:**
- Mixed ES6 modules (`.js` with `import`/`export`) and CommonJS (`require`/`module.exports`)
- ES6 modules in: `lib-ghcc/` directory
- CommonJS in: `bin/` directory
- ES6 imports include `.js` extension explicitly: `import { StateManager } from './state-manager.js'`

## Error Handling

**Patterns:**
- Try-catch blocks: 118 instances across codebase
- Descriptive error messages: `throw new Error(\`Failed to read ${filePath} after ${maxRetries} attempts\`)`
- Error code checking: `if (err.code === 'ENOENT')` for file not found
- Cross-filesystem detection: `if (err.code === 'EXDEV')` with helpful guidance
- Error wrapping: Catch errors, add context, and rethrow with clearer message

**Example pattern from `lib-ghcc/state-io.js`:**
```javascript
try {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
} catch (err) {
  if (err.code === 'ENOENT') {
    if (hasDefault) return options.default;
    throw err;
  }
  if (err instanceof SyntaxError && attempt < maxRetries - 1) {
    await new Promise(resolve => setTimeout(resolve, 50));
    continue;
  }
  throw err;
}
```

## Logging

**Framework:** Native `console` methods

**Patterns:**
- `console.log()` for informational messages
- `console.warn()` for warnings: `console.warn(\`CLI ${cli} failed: ${error.message}. Trying next CLI...\`)`
- `console.error()` for errors: `console.error('[StateValidator] ERROR:', error)`
- Prefixed logging for context: `[SessionManager]`, `[StateValidator]` prefixes in messages
- Conditional logging with verbose flags in some modules

**Example from `lib-ghcc/session-manager.js`:**
```javascript
console.log(`[SessionManager] CLI switch: ${session.cli} → ${newCLI}`);
```

## Comments

**When to Comment:**
- File-level JSDoc blocks for all modules describing purpose and usage
- Class-level JSDoc with examples
- Method-level JSDoc documenting parameters, return types, and throws
- Inline comments for complex logic, algorithms, or non-obvious patterns
- Algorithm explanations: exponential backoff, atomic operations, concurrency safety

**JSDoc/TSDoc:**
- Comprehensive JSDoc usage throughout codebase
- `@param`, `@returns`, `@throws`, `@example` tags used extensively
- Type annotations in JSDoc: `@param {string} filePath`, `@returns {Promise<Object>}`

**Example from `lib-ghcc/usage-tracker.js`:**
```javascript
/**
 * UsageTracker - Cost tracking and monitoring for multi-CLI operations
 * 
 * Tracks command execution, duration, token usage, and estimated costs
 * across Claude Code, GitHub Copilot CLI, and Codex CLI for cost analysis
 * and optimization.
 * 
 * Features:
 * - Tracks commands, duration, tokens, and costs per CLI
 * - Maintains summary statistics for quick analysis
 * - Bounded event storage (last 1000) prevents disk exhaustion
 * 
 * @example
 * const tracker = new UsageTracker('.planning');
 * await tracker.trackUsage({
 *   cli: 'claude-code',
 *   command: 'gsd:execute-phase',
 *   duration: 5000,
 *   tokens: { input: 1000, output: 500 },
 *   cost: 0.02
 * });
 */
```

## Function Design

**Size:** 
- Functions generally 20-60 lines
- Complex functions (like `validateStructure()` in `result-validator.js`) can be 80-120 lines
- Helper functions kept small (5-20 lines)

**Parameters:**
- Parameter objects for optional configuration: `function atomicReadJSON(filePath, options = {})`
- Destructuring in parameter lists: Not commonly used; options objects preferred
- Default parameters: `constructor(stateDir = '.planning')`

**Return Values:**
- Consistent return shapes: `{ valid: boolean, errors: string[] }`
- Async functions return Promises explicitly documented in JSDoc
- null for "not found" scenarios: `getAverageTime()` returns `null` if agent not found

**Example from `lib-ghcc/state-io.js`:**
```javascript
/**
 * @param {string} filePath - Target file path
 * @param {Object} data - Data to write (will be JSON.stringify'd)
 * @returns {Promise<void>}
 * @throws {Error} On write/rename failure or EXDEV (cross-filesystem)
 */
export async function atomicWriteJSON(filePath, data) {
  // Implementation
}
```

## Module Design

**Exports:**
- ES6: Named exports for functions and classes: `export class UsageTracker`, `export async function atomicWriteJSON()`
- CommonJS: `module.exports = { runTests }` or `module.exports = { ResultValidator }`
- No default exports used

**Barrel Files:**
- Not used - direct imports from specific files

**Module Structure:**
- One primary class or set of related functions per file
- Example: `usage-tracker.js` exports only `UsageTracker` class
- Example: `state-io.js` exports only `atomicWriteJSON()` and `atomicReadJSON()` functions

## Project-Specific Patterns

**Zero npm Dependencies Goal:**
- Explicitly documented in tests: "Zero npm dependencies goal"
- Uses only Node.js built-ins: `fs`, `path`, `util.parseArgs()`, `child_process`
- Custom implementations for common patterns (locking, atomic writes, retry logic)

**Atomic Operations:**
- Write-then-rename pattern for file operations
- Directory-based locking using `fs.mkdir()` atomicity
- Unique temp filenames with PID + timestamp + random: `${process.pid}.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`

**Multi-CLI Support:**
- Path rewriting utilities for cross-CLI deployment
- CLI detection based on environment variables and filesystem
- Adapter pattern for CLI-specific implementations in `bin/lib/adapters/`

**File Organization:**
- `lib-ghcc/` - Core library code (ES6 modules)
- `bin/` - CLI tooling and orchestration (CommonJS)
- `agents/` - Agent markdown definitions
- `commands/gsd/` - Command markdown specifications
- `hooks/` - Git hooks and utilities

---

*Convention analysis: 2026-01-20*
