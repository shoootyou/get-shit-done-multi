# Codebase Structure

**Analysis Date:** 2026-01-29

## Codebase Metrics

**Files Analyzed:**
- Total files: 85 files
- Source files: 64 files (JavaScript)
- Test files: 21 files
- Config files: 3 files (package.json, vitest.config.js, Dockerfile)

**Lines of Code:**
- Total: 10,494 lines
- Source: ~8,500 lines (excluding tests)
- Tests: ~2,000 lines

**Excluded from analysis:**
- Infrastructure: .claude, .github, .codex, node_modules, .git
- Build artifacts: dist, build, out, target, coverage

## Directory Layout

```
get-shit-done-multi/
├── .planning/                          # Planning and documentation (NOT in package)
│   ├── codebase/                       # Codebase analysis documents
│   ├── debug/                          # Debug logs
│   ├── phases/                         # Phase plans and summaries
│   ├── research/                       # Research documents
│   ├── todos/                          # TODO tracking
│   ├── ARCHITECTURE-DECISION.md        # ADRs
│   ├── PROJECT.md                      # Project definition
│   ├── ROADMAP.md                      # Roadmap
│   ├── STATE.md                        # Current state
│   ├── REQUIREMENTS.md                 # Requirements
│   └── *.md                            # Other planning docs
├── bin/                                # Executable and library code
│   ├── install.js                      # Main entry point (#!/usr/bin/env node)
│   └── lib/                            # Library modules (layered architecture)
│       ├── cli/                        # CLI layer (prompts, logger, progress)
│       ├── platforms/                  # Platform layer (adapters, detection)
│       ├── installer/                  # Installer layer (orchestration)
│       ├── rendering/                  # Rendering layer (templates, frontmatter)
│       ├── validation/                 # Validation layer (path, CLI validators)
│       ├── preflight/                  # Pre-flight checks
│       ├── migration/                  # Migration layer (v1.x → v2.0.0)
│       ├── version/                    # Version layer (detection, comparison)
│       ├── updater/                    # Updater layer (check updates)
│       ├── manifests/                  # Manifest layer (read/write/validate)
│       ├── io/                         # IO layer (file operations)
│       ├── paths/                      # Path utilities (resolver, symlink)
│       ├── utils/                      # Utilities (file scanner)
│       ├── config/                     # Configuration (path allowlists)
│       └── errors/                     # Error types and exit codes
├── templates/                          # Universal templates (SOURCE OF TRUTH)
│   ├── agents/                         # Agent templates (.agent.md files)
│   │   ├── gsd-*.agent.md              # 13 agent templates
│   │   └── versions.json               # Consolidated agent versions
│   ├── skills/                         # Skill templates
│   │   ├── gsd-*/                      # 28 regular skills
│   │   │   ├── SKILL.md                # Skill file with template vars
│   │   │   └── version.json            # Per-skill version
│   │   └── get-shit-done/              # Platform-specific skill
│   │       ├── claude/                 # Claude-specific
│   │       ├── copilot/                # Copilot-specific
│   │       └── codex/                  # Codex-specific
│   └── get-shit-done/                  # Shared template
│       └── .gsd-install-manifest.json  # Manifest template
├── tests/                              # Test suite (Vitest)
│   ├── unit/                           # Unit tests
│   ├── integration/                    # Integration tests
│   ├── version/                        # Version-specific tests
│   └── helpers/                        # Test utilities
├── hooks/                              # Hooks for IDE integration
│   ├── gsd-check-update.js             # Update checker hook
│   └── statusline.js                   # Statusline hook
├── scripts/                            # Build and utility scripts
│   └── audit-functions.js              # Function auditor
├── get-shit-done/                      # GSD workflow templates (source)
│   ├── references/                     # Reference documents
│   ├── templates/                      # Project templates
│   └── workflows/                      # Workflow definitions
├── .gsd-backup/                        # Migration backups (generated)
├── assets/                             # Assets (logo, etc.)
├── github/                             # GitHub issue templates
├── package.json                        # NPM package definition
├── vitest.config.js                    # Vitest configuration
├── README.md                           # User-facing README
├── GSD-STYLE.md                        # GSD style guide
├── CHANGELOG.md                        # Version changelog
├── LICENSE                             # MIT license
├── Makefile                            # Build commands
└── Dockerfile                          # Docker support
```

## Directory Purposes

**`.planning/`:**
- Purpose: Project planning, documentation, and state tracking
- Contains: Phase plans, research, ADRs, roadmap, requirements, TODOs
- Key files: `PROJECT.md`, `ROADMAP.md`, `STATE.md`, `ARCHITECTURE-DECISION.md`, `REQUIREMENTS.md`
- Not included in npm package (`.npmignore`)

**`bin/`:**
- Purpose: Executable entry point and core library
- Contains: `install.js` (main), `lib/` (layered modules)
- Key files: `install.js` (entry point)

**`bin/lib/cli/`:**
- Purpose: CLI layer - user interaction, progress, logging
- Contains: Interactive prompts, banner, logger, flag parser, progress bars
- Key files: `interactive.js`, `logger.js`, `banner-manager.js`, `install-loop.js`, `flag-parser.js`

**`bin/lib/platforms/`:**
- Purpose: Platform-specific transformations and detection
- Contains: Platform adapters (Claude, Copilot, Codex), registry, detectors
- Key files: `base-adapter.js`, `claude-adapter.js`, `copilot-adapter.js`, `codex-adapter.js`, `registry.js`, `platform-paths.js`

**`bin/lib/installer/`:**
- Purpose: Installation orchestration and file operations
- Contains: Orchestrator, skills installer, agents installer, shared installer
- Key files: `orchestrator.js`, `install-skills.js`, `install-agents.js`, `install-shared.js`

**`bin/lib/rendering/`:**
- Purpose: Template processing and frontmatter transformation
- Contains: Template renderer, frontmatter serializer, frontmatter cleaner
- Key files: `template-renderer.js`, `frontmatter-serializer.js`, `frontmatter-cleaner.js`

**`bin/lib/validation/` and `bin/lib/preflight/`:**
- Purpose: Pre-flight checks and validation
- Contains: Path validators, CLI validators, pre-install checks, pre-flight validator
- Key files: `path-validator.js`, `cli-validator.js`, `pre-install-checks.js`, `pre-flight-validator.js`

**`bin/lib/migration/`:**
- Purpose: Migrate v1.x installations to v2.0.0
- Contains: Migration orchestrator, migration manager, backup manager
- Key files: `migration-orchestrator.js`, `migration-manager.js`, `backup-manager.js`

**`bin/lib/version/`:**
- Purpose: Version detection, comparison, installation finding
- Contains: Old version detector, version checker, installation finder
- Key files: `old-version-detector.js`, `version-checker.js`, `installation-finder.js`

**`bin/lib/updater/`:**
- Purpose: Update checking and status formatting
- Contains: Update checker, validators, formatters, message generators
- Key files: `check-update.js`, `validator.js`, `format-status.js`, `update-messages.js`

**`bin/lib/manifests/`:**
- Purpose: Manifest reading, writing, validation, repair
- Contains: Reader, writer, schema, repair utilities
- Key files: `reader.js`, `writer.js`, `schema.js`, `repair.js`

**`bin/lib/io/` and `bin/lib/paths/`:**
- Purpose: Safe file operations and path utilities
- Contains: File operations, path resolvers, symlink resolvers
- Key files: `file-operations.js`, `path-resolver.js`, `symlink-resolver.js`

**`bin/lib/utils/`:**
- Purpose: Shared utilities
- Contains: File scanner
- Key files: `file-scanner.js`

**`bin/lib/config/`:**
- Purpose: Configuration constants
- Contains: Path allowlists, Windows reserved names
- Key files: `paths.js`

**`bin/lib/errors/`:**
- Purpose: Error types and exit codes
- Contains: Install error, directory error
- Key files: `install-error.js`, `directory-error.js`

**`templates/`:**
- Purpose: Universal templates (SOURCE OF TRUTH)
- Contains: Skills (29), agents (13), shared directory
- Key structure:
  - `agents/*.agent.md` - Agent templates with template variables
  - `agents/versions.json` - Consolidated agent versions
  - `skills/gsd-*/SKILL.md` - Skill templates
  - `skills/gsd-*/version.json` - Per-skill versions
  - `skills/get-shit-done/{claude|copilot|codex}/` - Platform-specific skills
  - `get-shit-done/.gsd-install-manifest.json` - Manifest template

**`tests/`:**
- Purpose: Test suite (Vitest)
- Contains: Unit tests, integration tests, version-specific tests, helpers
- Key files:
  - `unit/old-version-detector.test.js` (326 LOC)
  - `unit/migration-manager.test.js` (318 LOC)
  - `integration/migration-flow.test.js` (405 LOC)
  - `unit/frontmatter-serializer.test.js` (395 LOC)

**`hooks/`:**
- Purpose: Hooks for IDE integration
- Contains: Update checker hook, statusline hook
- Key files: `gsd-check-update.js`, `statusline.js`

**`scripts/`:**
- Purpose: Build and utility scripts
- Contains: Function auditor
- Key files: `audit-functions.js` (408 LOC)

**`get-shit-done/`:**
- Purpose: GSD workflow templates (source)
- Contains: References, templates, workflows
- Copied to installation directory by installer

**`.gsd-backup/`:**
- Purpose: Migration backups (auto-generated)
- Generated: Yes (by `backup-manager.js`)
- Committed: No (in `.gitignore`)

## Key File Locations

**Entry Points:**
- `bin/install.js`: Main entry point (`npx get-shit-done-multi`)
- `bin/lib/cli/interactive.js`: Interactive mode entry
- `bin/lib/cli/installation-core.js`: CLI mode entry

**Configuration:**
- `package.json`: NPM package definition, scripts, dependencies
- `vitest.config.js`: Vitest configuration
- `.gitignore`: Git ignore rules
- `.npmignore`: NPM ignore rules (excludes .planning/, tests/, etc.)

**Core Logic:**
- `bin/lib/installer/orchestrator.js`: Installation orchestration (332 LOC)
- `bin/lib/platforms/base-adapter.js`: Platform adapter interface
- `bin/lib/rendering/template-renderer.js`: Template variable replacement
- `bin/lib/manifests/schema.js`: Manifest schema and validation (170 LOC)

**Testing:**
- `tests/unit/*.test.js`: Unit tests
- `tests/integration/*.test.js`: Integration tests
- `tests/helpers/test-utils.js`: Test utilities

**Documentation:**
- `README.md`: User-facing documentation
- `GSD-STYLE.md`: GSD style guide
- `CHANGELOG.md`: Version history
- `.planning/*.md`: Planning documents (not in package)

## Naming Conventions

**Files:**
- Kebab case: `install.js`, `flag-parser.js`, `pre-flight-validator.js`
- Test files: `*.test.js` (e.g., `path-validator.test.js`)
- Platform adapters: `{platform}-adapter.js` (e.g., `claude-adapter.js`)
- Agent templates: `gsd-*.agent.md` (e.g., `gsd-planner.agent.md`)
- Skill templates: `gsd-*/SKILL.md` (e.g., `gsd-help/SKILL.md`)

**Directories:**
- Lowercase: `bin`, `lib`, `tests`, `templates`
- Kebab case for multi-word: `bin/lib`, `get-shit-done`
- Hidden directories: `.planning`, `.gsd-backup`

**Classes:**
- PascalCase: `PlatformAdapter`, `ClaudeAdapter`, `InstallError`

**Functions:**
- camelCase: `installSkills()`, `renderTemplate()`, `detectBinaries()`

**Constants:**
- UPPER_SNAKE_CASE: `EXIT_CODES`, `ALLOWED_DIRS`, `MANIFEST_FILE`

## Where to Add New Code

**New Platform Adapter:**
- Implementation: `bin/lib/platforms/{platform}-adapter.js` (extend `PlatformAdapter`)
- Registration: Add to `bin/lib/platforms/registry.js`
- Paths: Add to `bin/lib/platforms/platform-paths.js` (`platformDirs`)
- Detection: Add to `bin/lib/platforms/binary-detector.js`
- Tests: `tests/unit/{platform}-adapter.test.js`

**New Validation Check:**
- Pre-flight validation: Add to `bin/lib/preflight/pre-flight-validator.js`
- Path validation: Add to `bin/lib/validation/path-validator.js`
- CLI validation: Add to `bin/lib/validation/cli-validator.js`
- Tests: `tests/unit/` or `tests/integration/validation-flow.test.js`

**New CLI Feature:**
- Interactive prompt: Add to `bin/lib/cli/interactive.js`
- Flag parsing: Add to `bin/lib/cli/flag-parser.js`
- Usage docs: Update `bin/lib/cli/usage.js`
- Tests: `tests/integration/installation-output.test.js`

**New Installer Feature:**
- Orchestration: Modify `bin/lib/installer/orchestrator.js`
- File operations: Add to `bin/lib/io/file-operations.js`
- Tests: `tests/integration/installer.test.js`

**New Template:**
- Skill: Create `templates/skills/gsd-{name}/SKILL.md` + `version.json`
- Agent: Create `templates/agents/gsd-{name}.agent.md`, update `versions.json`
- Platform-specific: Create subdirectories in `templates/skills/get-shit-done/{platform}/`

**New Error Type:**
- Definition: Add to `bin/lib/errors/install-error.js`
- Factory function: Add factory function to same file
- Exit code: Add to `EXIT_CODES` constant
- Tests: `tests/unit/` (if needed)

**New Utility:**
- Shared helpers: `bin/lib/utils/`
- Path utilities: `bin/lib/paths/`
- File scanner: `bin/lib/utils/file-scanner.js`

## Special Directories

**`.planning/`:**
- Purpose: Project planning and documentation
- Generated: No (manually created)
- Committed: Yes (tracked in git)
- Distributed: No (excluded from npm package)

**`.gsd-backup/`:**
- Purpose: Migration backups (timestamped snapshots)
- Generated: Yes (by `backup-manager.js` during migration)
- Committed: No (in `.gitignore`)
- Distributed: No

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)
- Distributed: No

**`coverage/`:**
- Purpose: Test coverage reports
- Generated: Yes (by `vitest run --coverage`)
- Committed: No (in `.gitignore`)
- Distributed: No

**`templates/`:**
- Purpose: Universal templates (permanent source of truth)
- Generated: No (migrated once in Phase 1, then permanent)
- Committed: Yes (tracked in git)
- Distributed: Yes (included in npm package)

**`get-shit-done/`:**
- Purpose: GSD workflow templates (source)
- Generated: No (manually created)
- Committed: Yes (tracked in git)
- Distributed: Yes (included in npm package, copied to installations)

## NPM Package Structure

**Published to NPM:** `get-shit-done-multi`

**Included files** (from `package.json` `files` field):
- `bin/` - Executable and library code
- `get-shit-done/` - GSD workflow templates
- `hooks/` - IDE integration hooks
- `github/` - GitHub issue templates
- `docs/` - Documentation (if exists)

**Excluded files** (`.npmignore`):
- `.planning/` - Planning documents
- `tests/` - Test suite
- `.gsd-backup/` - Backup directory
- `coverage/` - Coverage reports
- `node_modules/` - Dependencies
- `.git/`, `.github/`, `.claude/`, `.codex/` - Version control and IDE dirs

**Entry point:** `bin: { "get-shit-done-multi": "bin/install.js" }`

**Version:** `2.0.0` (current milestone)

## File Size Distribution

**Largest source files:**
- `scripts/audit-functions.js`: 408 LOC
- `bin/lib/preflight/pre-flight-validator.js`: 369 LOC
- `bin/lib/installer/orchestrator.js`: 332 LOC
- `bin/lib/cli/logger.js`: 303 LOC
- `bin/lib/cli/interactive.js`: 258 LOC
- `bin/lib/version/old-version-detector.js`: 228 LOC
- `bin/lib/validation/pre-install-checks.js`: 226 LOC
- `bin/lib/migration/backup-manager.js`: 212 LOC
- `bin/lib/rendering/frontmatter-serializer.js`: 206 LOC
- `bin/lib/validation/path-validator.js`: 192 LOC

**Largest test files:**
- `tests/integration/migration-flow.test.js`: 405 LOC
- `tests/unit/frontmatter-serializer.test.js`: 395 LOC
- `tests/unit/old-version-detector.test.js`: 326 LOC
- `tests/unit/migration-manager.test.js`: 318 LOC
- `tests/integration/update-detection.test.js`: 215 LOC
- `tests/integration/installation-output.test.js`: 211 LOC

**Complexity notes:**
- Most modules stay under 250 LOC
- Orchestrator (332 LOC) is largest installer file (handles complex flow)
- Pre-flight validator (369 LOC) handles all validation logic
- Logger (303 LOC) provides extensive formatting options

## Installation Targets

**Global installations:**
- Claude Code: `~/.claude/`
- GitHub Copilot CLI: `~/.copilot/`
- Codex CLI: `~/.codex/`

**Local installations:**
- Claude Code: `.claude/`
- GitHub Copilot CLI: `.github/`
- Codex CLI: `.codex/`

**Installation structure:**
```
{platform_dir}/
├── skills/
│   ├── gsd-help/
│   │   └── SKILL.md
│   ├── gsd-add-phase/
│   │   └── SKILL.md
│   └── ... (28 skills)
├── agents/
│   ├── gsd-planner.agent.md
│   ├── gsd-executor.agent.md
│   └── ... (13 agents)
└── get-shit-done/
    ├── references/
    ├── templates/
    ├── workflows/
    └── .gsd-install-manifest.json  # Version tracking
```

## Migration Strategy

**Phase 1 (Complete):**
- ONE-TIME migration from `.github/` → `/templates/`
- Frontmatter corrections applied
- Version tracking added
- Migration code deleted after completion (preserved in git history)

**Post-Phase 1:**
- `/templates/` is permanent source of truth
- Installation always reads from `/templates/`
- `.github/` preserved as historical reference only
- No ongoing conversion logic

---

*Structure analysis: 2026-01-29*
