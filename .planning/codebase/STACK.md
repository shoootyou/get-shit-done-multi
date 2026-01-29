# Technology Stack

**Analysis Date:** 2026-01-29

**Codebase Size:**
- Files analyzed: 85 files
- Lines of code: 10,359 lines (excluding node_modules, build artifacts)
- Library modules: 57 JavaScript files in `bin/lib/`

## Languages

**Primary:**
- JavaScript (ES Modules) - 100% of codebase
- Node.js runtime environment
- Native ESM with `type: "module"` in package.json

**Secondary:**
- Markdown - Template and documentation files
- JSON - Configuration and version tracking
- YAML - Docker Compose and Dependabot config
- Bash - Git hooks and utility scripts

## Runtime

**Environment:**
- Node.js ≥16.7.0 (minimum for native ESM support)
- Currently running: v25.5.0

**Package Manager:**
- npm 11.8.0
- Lockfile: `package-lock.json` (present)
- Registry: npmjs.com

**Module System:**
- ES Modules (ESM) exclusively
- No CommonJS usage
- Import statements throughout

## Frameworks

**Core:**
- None (vanilla Node.js)
- Custom CLI architecture using Commander pattern

**Testing:**
- Vitest 4.0.18 - Test runner and framework
  - Config: `vitest.config.js`
  - Environment: node
  - Pool: forks (process isolation)
  - Test timeout: 30s for integration tests
  - Hook timeout: 10s

**Build/Dev:**
- None required (JavaScript runs directly via Node.js)
- `prepublishOnly` script for template processing
- No transpilation or bundling

**Dev Tools:**
- @vitest/ui 4.0.18 - Visual test interface
- Docker - Development environment isolation
- Make - Build automation via Makefile

## Key Dependencies

**Critical:**
- `fs-extra` 11.3.3 - Enhanced file operations with promises
- `gray-matter` 4.0.3 - Frontmatter parsing for templates
- `semver` 7.7.3 - Version comparison for update detection
- `js-yaml` 4.1.1 - YAML parsing for configuration

**CLI/UX:**
- `@clack/prompts` 0.11.0 - Interactive CLI prompts with spinners
- `chalk` 5.6.2 - Terminal colors and styling
- `cli-progress` 3.12.0 - Progress bars for operations
- `commander` 14.0.2 - Command-line argument parsing

**Utilities:**
- `sanitize-filename` 1.6.3 - Safe filename generation
- `@inquirer/prompts` 8.2.0 - Alternative prompt system (dev)

**Development:**
- `@babel/parser` 7.28.6 - JavaScript parsing (dev)
- `@babel/traverse` 7.28.6 - AST traversal (dev)
- `open` 11.0.0 - Open files/URLs (dev)

## Configuration

**Environment:**
- No environment variables required for core functionality
- No `.env` files in use
- Configuration via JSON files: `.planning/config.json`

**Build:**
- `vitest.config.js` - Test configuration with coverage thresholds
- `Makefile` - Docker environment management
- `Dockerfile` - Ubuntu-based dev environment with AI CLIs
- `docker-compose.yml` - Container orchestration

**Linting/Formatting:**
- Not detected (no ESLint or Prettier config)
- Code style enforced manually via `GSD-STYLE.md`

**Git Hooks:**
- `hooks/pre-commit-docs` - Documentation verification
- `hooks/gsd-check-update.js` - Update checking
- `hooks/statusline.js` - Status line display

## Platform Requirements

**Development:**
- Node.js ≥16.7.0
- npm (any recent version)
- Git (for version control)
- Docker (optional, for isolated development environment)
- Make (optional, for Docker commands)

**Production:**
- Deployed as npm package: `get-shit-done-multi`
- Distribution: npmjs.com registry
- Installation: `npx get-shit-done-multi`
- Platform support: macOS, Linux, Windows (Node.js cross-platform)

**Docker Environment:**
- Base: Ubuntu 24.04
- Includes: Node.js 20, GitHub CLI, Python 3
- Installed: Claude Code CLI, GitHub Copilot CLI, OpenAI Codex CLI
- Purpose: Testing installer across all AI platforms

## Test Infrastructure

**Framework:**
- Vitest 4.0.18 with v8 coverage provider
- Coverage reporters: text, json, html
- Coverage output: `coverage/` directory

**Coverage Thresholds:**
- Statements: 70%
- Branches: 50% (lowered temporarily for Phase 2)
- Functions: 70%
- Lines: 70%

**Test Organization:**
- Unit tests: `tests/unit/*.test.js` (9 files)
- Integration tests: `tests/integration/*.test.js` (1+ files)
- Test isolation: ALL tests run in `/tmp` (never in source)
- Target files: `bin/lib/**/*.js`

**Test Utilities:**
- Process isolation via forks
- 30-second timeout for integration tests
- Explicit imports (no globals)

## Version Management

**Project Version:**
- Current: v2.0.0
- Strategy: SemVer (semantic versioning)
- Version file: `package.json`

**Skill/Agent Versions:**
- Per-skill versioning: `templates/skills/*/version.json`
- Agent versioning: `templates/agents/versions.json`
- Installation tracking: `.gsd-install-manifest.json`

**Update Detection:**
- Built-in version comparison via `semver` package
- Update checker: `bin/lib/updater/check-update.js`
- Migration support: `bin/lib/migration/migration-orchestrator.js`

---

*Stack analysis: 2026-01-29*
