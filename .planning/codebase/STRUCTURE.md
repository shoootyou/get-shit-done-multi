# Codebase Structure

**Analysis Date:** 2026-02-01

## Codebase Metrics

**Files Analyzed:**
- Total files: 137 files
- Source files: ~70 JavaScript modules
- Test files: 25 test files
- Template files: ~40 templates (agents, skills, shared)
- Config files: 5 files

**Lines of Code:**
- Total: ~7,500 lines
- Installer (bin/lib): ~5,500 lines
- Tests: ~2,000 lines
- Templates: Variable (template content)

**Excluded from analysis:**
- Infrastructure: node_modules, .git
- Build artifacts: None (no build step required)
- Generated files: None

## Directory Layout

```plaintext
get-shit-done-multi/
├── bin/                    # Installer executable and modules
│   ├── install.js          # Main entry point
│   └── lib/                # Installer library modules
│       ├── cli/            # CLI interface and interactive mode
│       ├── config/         # Configuration utilities
│       ├── errors/         # Custom error types
│       ├── installer/      # Installation orchestration
│       ├── io/             # File I/O operations
│       ├── manifests/      # Installation manifest management
│       ├── migration/      # Version migration logic
│       ├── paths/          # Path resolution and validation
│       ├── platforms/      # Platform adapters and validators
│       ├── preflight/      # Pre-installation validation
│       ├── templates/      # Template rendering
│       ├── updater/        # Update checking
│       ├── utils/          # Shared utilities
│       ├── validation/     # Runtime validation
│       └── version/        # Version detection and comparison
├── templates/              # Template files (agents, skills, shared)
│   ├── agents/             # Agent templates (.agent.md)
│   ├── skills/             # Skill templates (SKILL.md in subdirs)
│   └── get-shit-done/      # Shared GSD resources
│       ├── references/     # Reference documentation
│       ├── templates/      # Project templates
│       └── workflows/      # Workflow helpers
├── tests/                  # Test suite
│   ├── integration/        # Integration tests
│   ├── unit/               # Unit tests
│   ├── validation/         # Validation tests
│   ├── version/            # Version detection tests
│   └── helpers/            # Test helpers
├── docs/                   # Documentation
├── scripts/                # Build and publish scripts
└── .planning/              # Project planning artifacts (GSD)
    ├── codebase/           # Codebase documentation (this file)
    └── history/            # Planning history
```

## Directory Purposes

**bin/**
- Purpose: NPM executable and installer implementation
- Contains: Main entry point and modular library
- Key files:
  - `install.js` - CLI entry point (exported as `get-shit-done-multi` binary)
  - `lib/` - All installer modules

**bin/lib/cli/**
- Purpose: Command-line interface and user interaction
- Contains: Flag parsing, prompts, logging, progress display
- Key files:
  - `interactive.js` - Interactive mode with @clack/prompts
  - `installation-core.js` - Shared installation logic
  - `install-loop.js` - Multi-platform installation loop
  - `logger.js` - Structured logging with colors (303 lines)
  - `flag-parser.js` - CLI flag parsing
  - `progress.js` - Progress bars and completion display
  - `banner-manager.js` - Welcome banner display

**bin/lib/platforms/**
- Purpose: Platform abstraction layer
- Contains: Adapters, validators, serializers for each platform
- Subdirectories:
  - `_shared/` - Base classes and shared validators
  - `claude/` - Claude Code adapter and validator
  - `copilot/` - GitHub Copilot adapter and validator
  - `codex/` - Codex adapter and validator
- Key files:
  - `registry.js` - Singleton adapter registry
  - `detector.js` - Platform installation detector
  - `binary-detector.js` - CLI binary detector
  - `platform-paths.js` - Platform-specific path helpers
  - `platform-names.js` - Display name mappings

**bin/lib/installer/**
- Purpose: Installation orchestration and file operations
- Contains: Main orchestrator and component installers
- Key files:
  - `orchestrator.js` - Main installation flow (354 lines)
  - `install-skills.js` - Skill installation logic (152 lines)
  - `install-agents.js` - Agent installation logic
  - `install-shared.js` - Shared directory installation
  - `install-platform-instructions.js` - Platform instruction file installation

**bin/lib/validation/**
- Purpose: Runtime validation and error handling
- Contains: Path validators, permission checks, error logging
- Key files:
  - `path-validator.js` - 8-layer path security validation (192 lines)
  - `pre-install-checks.js` - Pre-installation validation (226 lines)
  - `error-logger.js` - Error logging to `.planning/errors/` (158 lines)
  - `cli-validator.js` - CLI argument validation

**bin/lib/preflight/**
- Purpose: Pre-flight validation orchestration
- Contains: Grouped validation checks before installation
- Key files:
  - `pre-flight-validator.js` - Main preflight orchestrator (369 lines)
  - `error-formatter.js` - User-friendly error formatting (149 lines)

**bin/lib/version/**
- Purpose: Version detection and comparison
- Contains: Version tracking, manifest reading, old version detection
- Key files:
  - `version-detector.js` - Current version detection (187 lines)
  - `old-version-detector.js` - v1.x detection (228 lines)
  - `version-checker.js` - Semantic version comparison
  - `installation-finder.js` - Find installations by scope

**bin/lib/migration/**
- Purpose: Version migration orchestration
- Contains: Backup creation, migration prompts, old version cleanup
- Key files:
  - `migration-manager.js` - Migration prompts and flow (145 lines)
  - `migration-orchestrator.js` - Multi-platform migration coordination
  - `backup-manager.js` - Backup creation and validation (213 lines)

**bin/lib/manifests/**
- Purpose: Installation manifest management
- Contains: Schema, reader, writer, repair logic
- Key files:
  - `schema.js` - Joi schema and validation (170 lines)
  - `reader.js` - Manifest reading with error handling
  - `writer.js` - Manifest generation and writing
  - `repair.js` - Corrupt manifest repair

**bin/lib/io/**
- Purpose: File system operations
- Contains: Wrappers for fs-extra with error handling
- Key files:
  - `file-operations.js` - File operations with security validation

**bin/lib/paths/**
- Purpose: Path resolution and symlink handling
- Contains: Path helpers and symlink detection
- Key files:
  - `path-resolver.js` - Path resolution utilities
  - `symlink-resolver.js` - Symlink detection and resolution

**bin/lib/templates/**
- Purpose: Template variable replacement
- Contains: Template rendering logic
- Key files:
  - `template-renderer.js` - Variable substitution (`{{VARIABLE}}`)

**bin/lib/updater/**
- Purpose: Update checking
- Contains: Version comparison with npm registry
- Key files:
  - `check-update.js` - Update checking orchestrator
  - `check-global.js` - Global installation check
  - `check-local.js` - Local installation check

**bin/lib/errors/**
- Purpose: Custom error types
- Contains: InstallError and DirectoryError classes
- Key files:
  - `install-error.js` - Main error class with exit codes
  - `directory-error.js` - Directory-specific errors

**templates/**
- Purpose: Source templates for installation
- Contains: Agent and skill templates with frontmatter
- Subdirectories:
  - `agents/` - 11 agent templates (.agent.md)
  - `skills/` - 29 skill directories with platform-specific variants
  - `get-shit-done/` - Shared resources (references, workflows, templates)

**templates/skills/[skill-name]/**
- Purpose: Individual skill definitions
- Contains: SKILL.md with frontmatter
- Examples:
  - `gsd-new-milestone/SKILL.md`
  - `gsd-execute-phase/SKILL.md`
  - `gsd-map-codebase/SKILL.md`

**templates/skills/get-shit-done/**
- Purpose: Main orchestrator skill (platform-specific)
- Contains: Platform-specific SKILL.md variants
- Subdirectories:
  - `claude/SKILL.md` - Claude Code version
  - `copilot/SKILL.md` - GitHub Copilot version
  - `codex/SKILL.md` - Codex version

**templates/get-shit-done/**
- Purpose: Shared GSD resources
- Contains: Reference docs, project templates, workflow helpers
- Subdirectories:
  - `references/` - Reference documentation
  - `templates/` - Project templates (codebase, research-project)
  - `workflows/` - Bash workflow helpers

**tests/**
- Purpose: Test suite
- Contains: Unit, integration, and validation tests
- Subdirectories:
  - `unit/` - Unit tests for individual modules
  - `integration/` - Integration tests for workflows
  - `validation/` - Validation tests
  - `version/` - Version detection tests
  - `helpers/` - Test utilities

**docs/**
- Purpose: User documentation
- Contains: How-to guides, architecture docs, platform specifics
- Key files:
  - `README.md` - Documentation index
  - `architecture.md` - System architecture overview
  - `how-to-install.md` - Installation guide
  - `platform-comparison.md` - Platform differences
  - `troubleshooting.md` - Common issues

**.planning/**
- Purpose: GSD project planning artifacts
- Contains: Codebase docs, planning history
- Subdirectories:
  - `codebase/` - This file and other codebase documentation
  - `history/` - Planning session history

## Key File Locations

**Entry Points:**
- `bin/install.js` - Main CLI entry point (executed as `npx get-shit-done-multi`)
- `bin/lib/cli/interactive.js` - Interactive mode entry
- `bin/lib/installer/orchestrator.js` - Installation orchestrator

**Configuration:**
- `package.json` - NPM package configuration, dependencies, scripts
- `vitest.config.js` - Test configuration
- `.markdownlint-cli2.jsonc` - Markdown linting config

**Core Logic:**
- `bin/lib/platforms/registry.js` - Platform adapter registry
- `bin/lib/installer/orchestrator.js` - Main installation flow
- `bin/lib/preflight/pre-flight-validator.js` - Pre-install validation
- `bin/lib/platforms/[platform]/adapter.js` - Platform-specific logic

**Testing:**
- `tests/integration/installer.test.js` - Full installation flow test
- `tests/integration/skill-validation.test.js` - Skill validation tests
- `tests/unit/platforms/[platform]/serializer.test.js` - Platform serializer tests

**Templates:**
- `templates/agents/gsd-executor.agent.md` - Executor agent template
- `templates/agents/gsd-planner.agent.md` - Planner agent template (largest, 41KB)
- `templates/skills/get-shit-done/claude/SKILL.md` - Main Claude skill

## Naming Conventions

**Files:**
- Modules: `kebab-case.js` (e.g., `install-skills.js`, `path-resolver.js`)
- Tests: `kebab-case.test.js` (e.g., `installer.test.js`)
- Templates: `UPPERCASE.md` or `.agent.md` (e.g., `SKILL.md`, `gsd-planner.agent.md`)
- Config: Standard names (`package.json`, `vitest.config.js`)

**Directories:**
- Modules: `kebab-case` (e.g., `bin/lib/cli/`, `platforms/`)
- Platform subdirs: `lowercase` (e.g., `claude/`, `copilot/`, `codex/`)
- Shared: `_shared/` (with underscore prefix)

**Functions:**
- Exported: `camelCase` (e.g., `installSkills`, `validatePath`)
- Classes: `PascalCase` (e.g., `PlatformAdapter`, `ClaudeAdapter`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `EXIT_CODES`, `PLATFORM_ROOT`)

**Variables:**
- Local: `camelCase` (e.g., `targetDir`, `isGlobal`)
- Module-level: `camelCase` or `SCREAMING_SNAKE_CASE` for constants

## Where to Add New Code

**New Platform:**
- Adapter: `bin/lib/platforms/[platform]/adapter.js`
- Validator: `bin/lib/platforms/[platform]/validator.js`
- Serializer: `bin/lib/platforms/[platform]/serializer.js`
- Cleaner: `bin/lib/platforms/[platform]/cleaner.js`
- Register: Add to `bin/lib/platforms/registry.js`
- Tests: `tests/unit/platforms/[platform]/`

**New Skill:**
- Template: `templates/skills/gsd-[skill-name]/SKILL.md`
- Platform variants (if needed): `templates/skills/gsd-[skill-name]/[platform]/SKILL.md`
- No code changes required (templates are auto-discovered)

**New Agent:**
- Template: `templates/agents/gsd-[agent-name].agent.md`
- No code changes required (templates are auto-discovered)

**New Validation Check:**
- Pre-flight: Add to `bin/lib/preflight/pre-flight-validator.js`
- Runtime: Add to `bin/lib/validation/pre-install-checks.js`
- Path security: Add to `bin/lib/validation/path-validator.js`

**New CLI Flag:**
- Parser: Add to `bin/lib/cli/flag-parser.js`
- Entry point: Add to `bin/install.js` (Commander definition)
- Validation: Add to `bin/lib/validation/cli-validator.js` if needed

**New Error Type:**
- Define: Add to `bin/lib/errors/install-error.js`
- Exit code: Add to `EXIT_CODES` constant
- Formatter: Add to `bin/lib/preflight/error-formatter.js` if user-facing

**Utilities:**
- Shared helpers: `bin/lib/utils/`
- File operations: `bin/lib/io/file-operations.js`
- Path helpers: `bin/lib/paths/path-resolver.js`

**Tests:**
- Unit tests: `tests/unit/[module-name].test.js`
- Integration tests: `tests/integration/[feature-name].test.js`
- Test helpers: `tests/helpers/`

## Special Directories

**bin/lib/platforms/_shared/**
- Purpose: Shared platform code (base classes, validators)
- Generated: No
- Committed: Yes
- Note: Underscore prefix indicates shared/base code

**templates/skills/get-shit-done/**
- Purpose: Main orchestrator skill (platform-specific variants)
- Generated: No
- Committed: Yes
- Note: Only skill with platform subdirectories (claude/, copilot/, codex/)

**.planning/**
- Purpose: GSD project artifacts (created during GSD usage)
- Generated: Yes (by GSD workflows)
- Committed: Yes (for this project's own development)
- Note: Typically .gitignored in user projects

**node_modules/**
- Purpose: NPM dependencies
- Generated: Yes (by npm install)
- Committed: No
- Note: Standard NPM practice

**.git/**
- Purpose: Git repository metadata
- Generated: Yes (by git)
- Committed: No (metadata directory)

## Installation Target Directories

**Global Installation:**
- Claude: `~/.claude/`
- Copilot: `~/.github/copilot/`
- Codex: `~/.codex/`

**Local Installation:**
- Claude: `./.claude/`
- Copilot: `./.github/copilot/`
- Codex: `./.codex/`

**Installed Structure:**
```plaintext
.[platform]/
├── agents/                 # Installed agents
│   ├── gsd-executor.md     # (or .agent.md for copilot/codex)
│   └── ...
├── skills/                 # Installed skills
│   ├── gsd-new-milestone/
│   │   └── SKILL.md
│   └── get-shit-done/
│       └── SKILL.md        # Platform-specific variant
└── get-shit-done/          # Shared resources
    ├── .gsd-install-manifest.json  # Installation metadata
    ├── references/
    ├── templates/
    └── workflows/
```

## Module Boundaries

**Clear Separation:**
- CLI layer never imports from installer layer directly (goes through installation-core)
- Platform adapters are isolated (no cross-platform dependencies)
- Validation layer is independent (no dependencies on installer)
- File I/O is centralized (all file ops go through `io/file-operations.js`)

**Shared Dependencies:**
- Error types used across all layers
- Logger used across all layers
- Path utilities used by installer, validation, and I/O layers

**Circular Dependency Prevention:**
- Base classes in `_shared/` never import from concrete implementations
- Registry initialized at module load (no lazy loading needed)
- Validators are stateless (no shared state between invocations)

---

*Structure analysis: 2026-02-01*
