# Technology Stack

**Analysis Date:** 2026-01-20

**Codebase Size:**
- Files analyzed: 55 files
- Lines of code: 9,610 lines (excluding node_modules, build artifacts)

## Languages

**Primary:**
- JavaScript (ES Modules) 100% - All source code

**Secondary:**
- Markdown - Documentation, agent definitions, command specifications, workflow templates

## Runtime

**Environment:**
- Node.js >=16.7.0 (specified in package.json engines)

**Package Manager:**
- npm (package manager)
- Lockfile: present (`package-lock.json` v3)

## Frameworks

**Core:**
- None - Pure Node.js with ES Modules
- Built-in Node.js modules used extensively (fs, path, child_process, util)

**Testing:**
- Custom test runners - `bin/test-command-system.js`, `bin/test-cross-cli-state.js`, `bin/test-state-management.js`
- No external test framework (uses native Node.js assertions)

**Build/Dev:**
- None - No build step required (pure JavaScript)
- npm scripts for documentation generation and validation

## Key Dependencies

**Critical:**
- `simple-git` ^3.30.0 - Git operations for state management and version control
- `ignore` ^7.0.5 - .gitignore-style pattern matching for file exclusion

**Infrastructure:**
- No additional runtime dependencies
- Zero external framework dependencies for core functionality
- Minimal dependency footprint (2 production dependencies)

## Configuration

**Environment:**
- Environment variables used for CLI detection:
  - `CLAUDE_CODE` / `CLAUDE_CLI` - Detect Claude Code environment
  - `GITHUB_COPILOT_CLI` / `COPILOT_CLI` - Detect GitHub Copilot CLI environment
  - `CODEX_CLI` - Detect Codex CLI environment
  - `CLAUDE_CONFIG_DIR` - Override default Claude config directory
  - `DEBUG` - Enable debug logging
- File-based configuration:
  - `.planning/config.json` - GSD runtime configuration
  - `.planning/.meta.json` - State version tracking
  - `.planning/usage.json` - Usage tracking and cost monitoring
  - `.planning/.session.json` - Session management

**Build:**
- No build configuration files (no TypeScript, Babel, webpack, etc.)
- Package scripts for documentation automation:
  - `docs:generate` - Generate comparison and matrix docs
  - `docs:validate` - Validate documentation consistency
  - `docs:stamp` - Add version stamps to docs
  - `install-hooks` - Install git hooks

## Platform Requirements

**Development:**
- Node.js >=16.7.0
- Git (for version control features)
- One of: Claude Code, GitHub Copilot CLI, or Codex CLI
- Operating System: Mac, Windows, or Linux (cross-platform)

**Production:**
- NPM registry for distribution (published as `get-shit-done-cc`)
- Installed via `npx get-shit-done-cc`
- Deploys files to CLI-specific config directories:
  - Claude: `~/Library/Application Support/Claude/.agent/get-shit-done` (macOS)
  - Copilot: `~/.copilot/skills/get-shit-done`
  - Codex: `~/.codex/skills/get-shit-done`
  - Local: `.claude`, `.github/skills/get-shit-done`, `.codex/skills`

---

*Stack analysis: 2026-01-20*
