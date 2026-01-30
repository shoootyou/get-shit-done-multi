# Technology Stack

**Analysis Date:** 2026-01-29

**Codebase Size:**
- Files analyzed: 81 files (source + test)
- Source files: 57 files (bin/lib implementation)
- Test files: 20 files
- Lines of code: 9,740 lines total (5,895 lines implementation)

## Languages

**Primary:**
- JavaScript ES Modules - 100% of codebase
- Node.js native modules (fs, path, os, child_process)

**Configuration:**
- JSON - Package manifests, template versioning, GSD manifests
- Markdown - Agent templates, skill definitions, documentation
- YAML - Frontmatter for agent metadata, dependabot config

## Runtime

**Environment:**
- Node.js 20+ (LTS until October 2026)
- ECMAScript Modules (ESM) - `"type": "module"` in package.json
- Shebang for CLI: `#!/usr/bin/env node`

**Package Manager:**
- npm (package-lock.json present)
- Lockfile version: npm v9+ format

## Frameworks

**Core:**
- None - Pure Node.js application
- Module system: Native ES Modules (import/export)

**Testing:**
- Vitest 4.0.18 - Test runner and framework
- @vitest/ui 4.0.18 - Browser-based test UI
- v8 coverage provider

**Build/Dev:**
- No build step - direct JavaScript execution
- No transpilation - native ES modules
- No bundling - distributed as source

## Key Dependencies

**Critical:**
- `gray-matter@4.0.3` - Parse/stringify YAML frontmatter in agent templates
- `fs-extra@11.3.3` - Enhanced filesystem operations (pathExists, ensureDir, copy, remove)
- `commander@14.0.2` - CLI argument parsing and command framework
- `@clack/prompts@0.11.0` - Beautiful interactive terminal prompts
- `chalk@5.6.2` - Terminal string styling and colors (ESM)

**Infrastructure:**
- `js-yaml@4.1.1` - YAML parsing for frontmatter serialization
- `sanitize-filename@1.6.3` - Safe filename generation
- `semver@7.7.3` - Version comparison for update detection
- `cli-progress@3.12.0` - Progress bars for installation

**Development:**
- `@babel/parser@7.28.6` - AST parsing for validation tests
- `@babel/traverse@7.28.6` - AST traversal for code analysis in tests
- `@inquirer/prompts@8.2.0` - Alternative prompts (not currently used)
- `open@11.0.0` - Open URLs/files from CLI (test utility)

## Configuration

**Environment:**
- No environment variables required for installer operation
- No .env files used
- Platform detection via `which`/`where` commands

**Build:**
- `vitest.config.js` - Test configuration with coverage thresholds
  - 70% statements, 50% branches, 70% functions, 70% lines
  - v8 coverage provider
  - Node environment with process isolation
  - 30s test timeout for integration tests

**Entry Point:**
- `bin/install.js` - Main CLI entry point
- Executable: `npx get-shit-done-multi`
- Binary name: `get-shit-done-multi`

**Package Distribution:**
- Files published: `bin/`, `templates/`
- Main entry: `index.js` (placeholder - bin is the actual entry)
- No build artifacts - source code distributed directly

## Platform Requirements

**Development:**
- Node.js 20.0.0 or higher (specified in engines)
- npm for dependency management
- Git for version detection and manifest management

**Production:**
- Deployment target: User's local machine via npx
- Installs to AI assistant config directories:
  - Claude Code: `~/.claude/agents/`, `~/.claude/skills/`, `.claude/` (local)
  - GitHub Copilot CLI: `~/.github/agents/`, `.github/` (local)
  - Codex CLI: `~/.codex/agents/`, `.codex/` (local)
- No server deployment - CLI tool only

**Platform Support:**
- Cross-platform: macOS, Linux, Windows
- Platform detection: `os.platform()` for Windows-specific behavior
- Path handling: Native Node.js `path` module (cross-platform)
- Binary detection: `which` (Unix) / `where` (Windows)

## Special Considerations

**ESM-Only:**
- All imports use `.js` extension explicitly
- `import.meta.url` for `__dirname` equivalent
- Top-level await supported
- No CommonJS interop required

**Filesystem Operations:**
- Heavy use of fs-extra for atomic operations
- Symlink resolution for custom paths
- Path validation and security checks
- Permission checking before writes

**Template System:**
- Markdown templates with YAML frontmatter
- Gray-matter for parsing/stringifying
- Platform-specific transformations (Claude/Copilot/Codex)
- Version tracking in `versions.json`

---

*Stack analysis: 2026-01-29*
