# Coding Conventions

**Analysis Date:** 2026-01-29

**Analysis Scope:**
- Files reviewed: 85 source files
- Test files: 21 files
- Language: JavaScript (ES6+ modules)

## Naming Patterns

**Files:**
- kebab-case for all source files: `frontmatter-serializer.js`, `path-validator.js`, `install-loop.js`
- Test files: `{module-name}.test.js` pattern (e.g., `frontmatter-serializer.test.js`)
- Entry point: `bin/install.js` (executable with shebang)

**Functions:**
- camelCase for functions: `serializeFrontmatter()`, `validatePath()`, `handleCheckUpdates()`
- Async functions clearly marked: `async function install()`, `export async function copyDirectory()`
- Descriptive action verbs: `create`, `validate`, `transform`, `handle`, `resolve`

**Variables:**
- camelCase for local variables: `testDir`, `templatesDir`, `scriptDir`
- ALL_CAPS for constants: `SHARED_DIR`, `MANIFEST_FILE`, `ALLOWED_DIRS`, `WINDOWS_RESERVED`
- Descriptive names avoiding abbreviations: `targetDirOverride` not `tgtDirOvr`

**Classes:**
- PascalCase for class names: `PlatformAdapter`, `ClaudeAdapter`, `CopilotAdapter`, `AdapterRegistry`
- Class files match class name: `base-adapter.js` exports `PlatformAdapter`

**Constants and Exports:**
- Export objects use camelCase: `export const platformNames = {...}`
- Export arrays use ALL_CAPS: `export const ALLOWED_DIRS = [...]`

## Code Style

**Formatting:**
- No formatter configured (no .prettierrc or .eslintrc found)
- Indentation: 2 spaces (consistent across all files)
- Line length: No hard limit, but typically < 120 characters
- Semicolons: Used consistently at statement ends
- String quotes: Single quotes for strings, backticks for template literals
- Trailing commas: Used in multi-line arrays and objects

**Module System:**
- ES6 modules (`import`/`export`)
- `"type": "module"` in package.json
- Named exports preferred over default exports
- File extensions required in imports: `from './path-validator.js'` not `from './path-validator'`

**Line Breaks:**
- Blank line between function definitions
- Blank line after imports
- No blank lines at start/end of files

## Import Organization

**Order:**
1. External dependencies (Node.js built-ins, npm packages)
2. Internal modules (relative imports)

**Example from `bin/lib/platforms/claude-adapter.js`:**
```javascript
import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { getPlatformDir, getPathReference } from './platform-paths.js';
import { serializeFrontmatter } from '../rendering/frontmatter-serializer.js';
```

**Path Aliases:**
- None configured
- All imports use relative paths: `'../../bin/lib/io/file-operations.js'`

**Node.js Built-ins:**
- Imported without `node:` prefix: `import { join } from 'path'`

## Error Handling

**Patterns:**
- Async/await with try-catch blocks
- Custom error classes: `InstallError` with `EXIT_CODES`
- Validation throws descriptive errors: `throw new Error('Path traversal detected')`
- File operations handle missing files gracefully
- Test cleanup errors logged but not thrown: `console.warn('Cleanup warning: ${error.message}')`

**Validation Strategy:**
- Validate early, fail fast
- Collect all validation errors before throwing: `validateAllPaths()` returns array of errors
- Pre-flight checks before destructive operations
- Security validation separate from business logic

## Logging

**Framework:** Custom logger in `bin/lib/cli/logger.js`

**Functions:**
- `info(message, indent, fullColor)` — General information
- `listItem(message, indent)` — Bulleted list items
- Color helpers via chalk library

**Patterns:**
- Verbose mode controlled by `isVerbose` flag
- No logging in library functions (return values instead)
- Progress indicators via `cli-progress` library
- Spinners via `@clack/prompts` for interactive mode

## Comments

**When to Comment:**
- File-level JSDoc explaining module purpose
- Complex algorithms or non-obvious logic
- Platform-specific quirks or workarounds
- Security-related decisions
- Test descriptions in describe/test blocks

**JSDoc:**
- Used extensively for public functions
- Includes `@param`, `@returns`, `@throws` tags
- Module-level docblocks explain purpose and rationale
- Private functions marked with `@private` tag

**Example from `bin/lib/rendering/frontmatter-serializer.js`:**
```javascript
/**
 * Custom YAML frontmatter serializer with platform-specific formatting
 * 
 * Why custom: js-yaml's flowLevel option is all-or-nothing. We need:
 * - Root-level objects in block style
 * - Arrays in flow style (Copilot/Codex) or block style (Claude)
 * - Nested objects in block style
 * - Omit empty arrays
 * - Special character handling in tool names
 * 
 * @module frontmatter-serializer
 */

/**
 * Serialize frontmatter data to YAML string with platform-specific formatting
 * 
 * @param {Object} data - Frontmatter data object
 * @param {string} platform - Platform name ('copilot', 'codex', 'claude')
 * @returns {string} YAML string (without --- delimiters)
 * 
 * @example
 * // Copilot/Codex (single-line arrays)
 * serializeFrontmatter({tools: ['read', 'write']}, 'copilot')
 * // => "tools: ['read', 'write']"
 */
export function serializeFrontmatter(data, platform) {
  // ...
}
```

**Inline Comments:**
- Explain "why" not "what"
- Mark tech debt: `// TODO: Read version from manifest (Phase 6 - VERSION-02)`
- Clarify non-obvious code paths
- Document test expectations: `// Verify single-line format with single quotes`

## Function Design

**Size:**
- Small, focused functions (typically 10-30 lines)
- Large functions split into private helpers
- Example: `serializeFrontmatter()` delegates to `formatArray()`, `formatObject()`, `formatScalar()`

**Parameters:**
- Options object for 3+ parameters: `install(appVersion, options)`
- Destructuring in function signature: `const { platform, adapter, isGlobal } = options`
- Optional parameters have defaults: `options = {}`
- Boolean flags prefixed with `is` or `should`: `isGlobal`, `isVerbose`, `skipPrompts`

**Return Values:**
- Explicit returns (no implicit undefined)
- Async functions always return Promises
- Stats objects for operations: `{ skills: N, agents: N, shared: N }`
- Validation returns normalized data: `{ normalized, resolved }`

**Async/Await:**
- Prefer async/await over Promises
- Mark functions explicitly: `async function install()`
- All file operations are async
- No mixing of callbacks and Promises

## Module Design

**Exports:**
- Named exports for functions and constants
- Class exports: `export class PlatformAdapter`
- Multiple exports per file common: `bin/lib/platforms/platform-paths.js` exports 8+ functions

**File Organization:**
- One class per file for adapters
- Related functions grouped in single file: `bin/lib/io/file-operations.js`
- Utilities separated by concern: `bin/lib/cli/`, `bin/lib/platforms/`, `bin/lib/validation/`

**Dependencies:**
- Minimal external dependencies
- Core: fs-extra, chalk, @clack/prompts, commander, js-yaml
- Dev: vitest, @vitest/ui, gray-matter

**Barrel Files:**
- Not used — explicit imports from specific modules

## Platform Patterns

**Adapter Pattern:**
- Base class: `PlatformAdapter` in `bin/lib/platforms/base-adapter.js`
- Platform-specific: `ClaudeAdapter`, `CopilotAdapter`, `CodexAdapter`
- Registry: `adapterRegistry` in `bin/lib/platforms/registry.js`
- Each adapter implements: `getFileExtension()`, `getTargetDir()`, `transformTools()`, `transformFrontmatter()`

**Template Variables:**
- Defined in templates with double curly braces: `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, `{{VERSION}}`
- Replaced during installation via adapter methods
- Platform-specific transformations

## Test Patterns (Preview)

**Organization:**
- `tests/unit/` for isolated unit tests
- `tests/integration/` for multi-component tests
- `tests/validation/` for validation flows
- `tests/version/` for version detection
- `tests/helpers/` for test utilities

**Isolation:**
- All tests use `/tmp` or home directory (never project root)
- Test utilities in `tests/helpers/test-utils.js`
- `createTestDir()` → `/tmp/gsd-test-*` prefix
- `cleanupTestDir()` removes test directories

**Vitest Configuration:**
- Explicit imports (no globals)
- Node environment
- Process isolation via `pool: 'forks'`
- 30s timeout for integration tests
- Coverage: statements 70%, branches 50%, functions 70%, lines 70%

## Security Conventions

**Path Validation:**
- All paths validated before use
- Allowlist: `.claude/`, `.github/`, `.codex/`, `get-shit-done/`
- Reject path traversal: `../`, URL-encoded variants
- Reject null bytes: `\x00`
- Reject Windows reserved names: `CON`, `PRN`, `AUX`, etc.
- Max path length: 4096 characters
- Max component length: 255 characters

**File Operations:**
- Validate before read/write
- Use `fs-extra` promise-based API
- Check file existence before operations
- Handle symlinks explicitly

## Project-Specific Conventions

**Source Protection:**
- `.claude/`, `.github/`, `.codex/` are READ-ONLY reference directories
- Never modify source directories
- Templates live in `templates/` directory
- Tests use `targetDirOverride` parameter to avoid writing to source

**Version Management:**
- version.json per skill: `templates/skills/gsd-*/version.json`
- versions.json for all agents: `templates/agents/versions.json`
- SemVer for project version: `2.0.0`

**Frontmatter Handling:**
- Custom serializer for platform-specific formatting
- Claude: Multi-line arrays with dash prefix
- Copilot/Codex: Single-line arrays with single quotes
- Empty arrays omitted from output
- Field ordering: name, description, tools, skills, metadata

**Tool Names:**
- Official Claude names: Read, Write, Edit, Bash, Grep, Glob, Task
- Comma-separated string format (not array)
- Platform adapters handle transformations

---

*Convention analysis: 2026-01-29*
