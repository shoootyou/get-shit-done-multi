# Coding Conventions

**Analysis Date:** 2026-02-01

**Analysis Scope:**
- Files reviewed: 69 source files
- Test files: 25 files
- Total lines of code: ~5,547 lines (source) + ~4,597 lines (tests)

## Naming Patterns

**Files:**
- Module files: `kebab-case.js` (e.g., `file-scanner.js`, `path-validator.js`, `install-error.js`)
- Test files: `module-name.test.js` (e.g., `file-scanner.test.js`, `path-validator.test.js`)
- Platform-specific modules: `platform/feature.js` (e.g., `claude/adapter.js`, `copilot/serializer.js`)
- Shared/base modules: Prefix with `base-` (e.g., `base-adapter.js`, `base-validator.js`)

**Functions:**
- Exported functions: `camelCase` (e.g., `scanInstallationFiles()`, `validatePath()`, `serializeFrontmatter()`)
- Internal helpers: `camelCase` with descriptive names (e.g., `logWithIcon()`, `indentMultiline()`)
- Factory functions: Descriptive verb phrases (e.g., `invalidArgs()`, `createTestDir()`, `cleanupTestDir()`)

**Variables:**
- Local variables: `camelCase` (e.g., `testDir`, `files`, `basePath`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants (e.g., `EXIT_CODES`, `RED`, `GREEN`, `YELLOW`)
- Path constants: Use `__filename`, `__dirname` pattern for ESM compatibility

**Classes:**
- Class names: `PascalCase` (e.g., `ClaudeAdapter`, `InstallError`, `ValidationError`)
- Extends pattern: Descriptive suffix (e.g., `PlatformAdapter`, `BaseValidator`)

**Directories:**
- All lowercase, hyphenated if needed (e.g., `bin/lib/`, `file-scanner/`, `get-shit-done/`)
- Platform directories: Platform name (e.g., `claude/`, `copilot/`, `codex/`)
- Shared code: `_shared/` prefix to indicate internal/base implementations

## Code Style

**Formatting:**
- No explicit formatter config (no Prettier/EditorConfig found)
- Indentation: 2 spaces (observed consistently)
- Line length: No hard limit enforced, but generally kept reasonable (~80-120 characters)
- Semicolons: Used consistently
- Quotes: Single quotes for strings, backticks for template literals

**Linting:**
- Markdown: `markdownlint-cli2` with custom config (`.markdownlint-cli2.jsonc`)
- JavaScript: No ESLint config found - relies on code review and testing
- Markdown rules:
  - Line length: 120 characters (relaxed from default 80)
  - Allow HTML for badges and links
  - Allow duplicate headings at same level
  - Fenced code blocks required

**File headers:**
- Executable scripts: Shebang `#!/usr/bin/env node` or `#!/usr/bin/env bash`
- Module files: JSDoc comment block at top describing purpose
- Example pattern:
  ```javascript
  /**
   * Scan directory recursively and collect all file paths
   * Used for reconstructing file lists during manifest repair
   * 
   * @param {string} directory - Directory to scan
   * @param {string} excludePrefix - File prefix to exclude (default: '.gsd-')
   * @returns {Promise<string[]>} Array of relative file paths
   */
  ```

## Import Organization

**Order:**
1. Node.js built-in modules (e.g., `fs`, `path`, `os`)
2. Third-party packages (e.g., `chalk`, `gray-matter`, `commander`)
3. Internal modules - absolute paths from project root (e.g., `../../bin/lib/...`)

**Import style:**
- ES modules (ESM) only - `import`/`export` syntax
- Named imports preferred: `import { foo, bar } from 'module'`
- Default imports when appropriate: `import chalk from 'chalk'`
- Namespace imports rare: `import * as logger from './logger.js'`

**Path references:**
- Relative imports use explicit `.js` extension: `'./adapter.js'`, `'../platform-paths.js'`
- Test imports use relative paths from test to source: `'../../bin/lib/utils/file-scanner.js'`

**ESM compatibility patterns:**
- Use `fileURLToPath` and `dirname` for `__dirname` equivalent:
  ```javascript
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```

## Error Handling

**Patterns:**
- Custom error classes for domain errors:
  - `InstallError` (`bin/lib/errors/install-error.js`) for installation failures
  - `ValidationError` (`bin/lib/platforms/_shared/validation-error.js`) for validation failures
  - `DirectoryError` for directory-related issues
- Factory functions for common error types: `invalidArgs()`, `missingTemplates()`, `permissionDenied()`
- Exit codes defined as constants in `EXIT_CODES` object
- Error details passed as optional parameter: `new InstallError(message, code, details)`

**Throwing errors:**
- Use `throw new Error()` for programmer errors (e.g., missing implementations, invalid arguments)
- Use custom error classes for recoverable/user-facing errors
- Include context in error messages: `throw new Error(\`\${this.platformName}: getFileExtension() must be implemented\`)`

**Try-catch:**
- Used for I/O operations and external API calls
- Silent failures return default values (e.g., empty array, `false`) when appropriate
- Example pattern:
  ```javascript
  try {
    const entries = await fs.readdir(directory);
    // ... process
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty array
    return [];
  }
  ```

## Logging

**Framework:** Custom logger module (`bin/lib/cli/logger.js`)

**Functions:**
- `listItem(message, indent)` - Bullet point list items
- `info(message, indent, fullColor)` - Info messages with ℹ icon
- `success(message, indent, fullColor)` - Success messages with ✓ icon
- `warn(message, indent, fullColor)` - Warnings with ⚠ icon
- `error(message, indent, fullColor)` - Errors with ✖ icon
- `verbose(message, indent, isVerbose)` - Conditional logging based on verbose flag
- `blockTitle(title, opts)` - Section headers with borders
- `summary(stats, platform)` - Installation summary formatting

**Patterns:**
- Use chalk for colors: `chalk.red()`, `chalk.green()`, `chalk.yellow()`, `chalk.blue()`
- Icons used consistently: ℹ (info), ✓ (success), ⚠ (warn), ✖ (error), • (list)
- Multiline messages use vertical bar continuation: `'| '` prefix on continuation lines
- Indentation support via `indent` parameter (number of spaces)
- Color application: `fullColor` param applies color to entire line vs just icon

**Console usage:**
- Direct `console.log()` usage: ~100 instances across codebase
- Prefer logger functions for user-facing output
- Use `console.warn()` for cleanup warnings in tests
- Never use `console.error()` directly - use `logger.error()` instead

## Comments

**When to Comment:**
- JSDoc blocks for all exported functions
- Section headers for logical groupings within modules
- Inline comments for complex logic or non-obvious code
- TODO/FIXME comments rare - only 1 found (already completed item)

**JSDoc style:**
- Always include `@param` for parameters with type and description
- Always include `@returns` for return values
- Use descriptive parameter names that match function signature
- Example:
  ```javascript
  /**
   * Transform tools for Claude (keep capitalized)
   * @param {string} tools - Comma-separated tools from template
   * @returns {string} Unchanged for Claude
   */
  ```

**Section comments:**
- Use single-line comments with title case: `// Internal: Base function for logging`
- Double slashes with space: `// comment` not `//comment`

**Inline comments:**
- Explain "why" not "what"
- Example: `// Only include files, not directories`
- Example: `// For multiline messages, add vertical bar prefix to continuation lines`

## Function Design

**Size:**
- Most functions under 50 lines
- Largest functions ~150-370 lines (complex orchestration: `orchestrator.js`, `pre-flight-validator.js`)
- Extract complex logic into helper functions within same module

**Parameters:**
- Use destructuring for options objects: `{ platform, adapter, isGlobal, isVerbose }`
- Default values in parameter list: `async function scanInstallationFiles(directory, excludePrefix = '.gsd-')`
- Boolean flags use `is` or `has` prefix: `isGlobal`, `isVerbose`, `hasMultipleLines`
- Options objects for 4+ parameters

**Return Values:**
- Async functions return Promises (explicitly marked with `async`)
- Return early for validation/guard clauses
- Return specific types consistently:
  - Validation functions: throw or return normalized object
  - Query functions: return boolean or specific type
  - Scan functions: return array (empty array on error)

**Pure functions preferred:**
- Most utility functions are pure (no side effects)
- I/O operations isolated to specific modules: `file-operations.js`, `io/`
- Logging functions have side effects but don't mutate state

## Module Design

**Exports:**
- Named exports for all public functions: `export async function scanInstallationFiles(...)`
- Class exports: `export class ClaudeAdapter extends PlatformAdapter`
- Constants: `export const EXIT_CODES = { ... }`
- No default exports except for configuration files

**Module organization:**
- One primary concern per file
- Related functions grouped in same module
- Base/shared implementations in `_shared/` directory
- Platform-specific code in platform subdirectories

**Barrel files:**
- Not used - each module imported directly
- No `index.js` files for re-exporting

**Internal functions:**
- Non-exported functions for internal use only
- Placed above exported functions or at top of file
- Example: `function logWithIcon(...)` in `logger.js` is internal helper

## Async/Await Patterns

**Usage:**
- All I/O operations are async
- Use `async/await` consistently, avoid Promise chains
- Example:
  ```javascript
  export async function scanInstallationFiles(directory, excludePrefix = '.gsd-') {
    try {
      const entries = await fs.readdir(directory, { recursive: true });
      // ... process
    } catch (error) {
      return [];
    }
  }
  ```

**Error handling:**
- Try-catch blocks around await calls when handling errors
- Let errors bubble up when appropriate (don't catch if you can't handle)
- Silent failures return safe defaults for non-critical operations

**Parallel operations:**
- Not heavily used in codebase
- Sequential operations preferred for simplicity and reliability

## Class Patterns

**Inheritance:**
- Base classes define interface and shared behavior
- Platform-specific classes extend base classes
- Example:
  ```javascript
  export class ClaudeAdapter extends PlatformAdapter {
    constructor() {
      super('claude');
    }
    
    // Override abstract methods
    getFileExtension() {
      return '.md';
    }
  }
  ```

**Abstract methods:**
- Base class throws error if method not implemented
- Pattern: `throw new Error(\`\${this.platformName}: method() must be implemented\`)`

**Constructor patterns:**
- Call `super()` first in subclass constructors
- Validate required parameters in base constructor
- Pass platform name to base class

**Instance methods:**
- All public methods have JSDoc comments
- Methods return specific types (not `this` for chaining)
- No getters/setters - direct property access

## Platform Adapter Pattern

**Structure:**
Each platform (Claude, Copilot, Codex) implements:
- Adapter class: `{Platform}Adapter extends PlatformAdapter`
- Validator class: `{Platform}Validator extends BaseValidator`
- Serializer module: Platform-specific frontmatter formatting
- Cleaner module: Platform-specific content transformations

**Required methods:**
- `getFileExtension()` - Returns platform file extension
- `getTargetDir(isGlobal)` - Returns installation directory
- `getCommandPrefix()` - Returns command prefix (e.g., `/gsd-` or `$gsd-`)
- `transformTools(tools)` - Transforms tool list for platform
- `transformFrontmatter(content)` - Transforms YAML frontmatter
- `getPathReference()` - Returns path reference prefix
- `getInstructionsPath(isGlobal)` - Returns platform instruction file path

---

*Convention analysis: 2026-02-01*
