# Architecture

**Analysis Date:** 2026-02-01

**Scope:**
- Source files: 137 files
- Primary language: JavaScript (ESM, Node.js)
- LOC: ~7,500 lines (bin/lib), ~5,500 lines total in installer

## Pattern Overview

**Overall:** Modular Multi-Platform Installer with Adapter Pattern

**Key Characteristics:**
- Platform adapter pattern for cross-platform skill/agent deployment
- Orchestrator-based installation with atomic transactions
- Layered validation (preflight → runtime → post-install)
- Template-driven content transformation with variable substitution
- Migration and version management system

## Layers

**CLI Layer:**
- Purpose: Command-line interface and interactive mode
- Location: `bin/lib/cli/`
- Contains: Argument parsing, prompts, progress display, logging
- Depends on: Installer orchestrator, platform adapters, validation layer
- Used by: Entry point (`bin/install.js`)

**Platform Abstraction Layer:**
- Purpose: Platform-specific transformations and validation
- Location: `bin/lib/platforms/`
- Contains: Adapter registry, platform adapters (Claude/Copilot/Codex), validators, serializers
- Depends on: Shared base classes, field validators
- Used by: Installer orchestrator, skill/agent installers

**Installation Orchestration Layer:**
- Purpose: Coordinates file operations and installation workflow
- Location: `bin/lib/installer/`
- Contains: Main orchestrator, skill installer, agent installer, shared installer, platform instructions
- Depends on: Platform adapters, file operations, template renderer, manifest writer
- Used by: Installation core (`bin/lib/cli/installation-core.js`)

**Validation Layer:**
- Purpose: Pre-install checks and runtime validation
- Location: `bin/lib/validation/`, `bin/lib/preflight/`
- Contains: Path validators, permission checks, disk space checks, error formatters
- Depends on: File operations, error types
- Used by: Orchestrator, installation loop

**File I/O Layer:**
- Purpose: File system operations with error handling
- Location: `bin/lib/io/`, `bin/lib/paths/`
- Contains: File operations, path resolution, symlink handling
- Depends on: fs-extra, error types
- Used by: All layers requiring file operations

**Version & Migration Layer:**
- Purpose: Version detection, comparison, and migration orchestration
- Location: `bin/lib/version/`, `bin/lib/migration/`
- Contains: Version detector, migration manager, backup manager, manifest reader/writer
- Depends on: File operations, platform paths
- Used by: Orchestrator, installation loop

**Manifest & Metadata Layer:**
- Purpose: Installation tracking and state management
- Location: `bin/lib/manifests/`
- Contains: Schema, reader, writer, repair
- Depends on: File operations, Joi validation
- Used by: Orchestrator, version checker, migration manager

**Template Processing Layer:**
- Purpose: Template variable substitution and frontmatter transformation
- Location: `bin/lib/templates/`
- Contains: Template renderer, variable replacement
- Depends on: File operations
- Used by: Installer orchestrator, agent/skill installers

## Data Flow

**Installation Flow (CLI Mode):**

1. **Entry Point** (`bin/install.js`):
   - Parse CLI flags with Commander
   - Validate arguments (custom path, platform conflicts)
   - Detect old versions and trigger migration if needed
   - Route to interactive or direct installation

2. **Pre-Flight Validation** (`bin/lib/preflight/pre-flight-validator.js`):
   - Check disk space (with 50% buffer)
   - Validate templates exist
   - Check write permissions
   - Validate all target paths (8-layer security check)
   - Detect symlinks and warn

3. **Installation Loop** (`bin/lib/cli/install-loop.js`):
   - Iterate over selected platforms
   - Call installation orchestrator for each platform

4. **Orchestrator** (`bin/lib/installer/orchestrator.js`):
   - Resolve target directory (global/local/custom)
   - Check for old version and migrate if needed
   - Validate version (prevent downgrades, warn on major updates)
   - Prepare template variables (PLATFORM_ROOT, COMMAND_PREFIX, VERSION)
   - Install skills → agents → shared → platform instructions
   - Generate and write installation manifest

5. **Component Installation** (skills, agents, shared, instructions):
   - Read template files
   - Replace template variables (`{{VARIABLE}}`)
   - Transform frontmatter (platform-specific)
   - Validate frontmatter against platform schema
   - Write to target directory

6. **Post-Installation**:
   - Write manifest (`.gsd-install-manifest.json`)
   - Display success message and next steps

**Migration Flow:**

1. Detect old version (v1.x) in target directory
2. Prompt user for migration confirmation
3. Create backup directory with timestamp
4. Validate backup space
5. Copy old files to backup
6. Remove old installation
7. Proceed with v2.0.0 installation

**Interactive Mode Flow:**

1. Display intro with @clack/prompts
2. Detect platform CLIs (binary-detector)
3. Find existing installations with version status
4. Prompt for platform selection (multi-select)
5. Prompt for scope (global/local)
6. Hand off to installation loop (same as CLI mode)

## Key Abstractions

**PlatformAdapter (Base Class):**
- Purpose: Interface for platform-specific transformations
- Examples: `bin/lib/platforms/claude/adapter.js`, `bin/lib/platforms/copilot/adapter.js`, `bin/lib/platforms/codex/adapter.js`
- Pattern: Abstract base class with template methods
- Methods:
  - `getFileExtension()` - Returns `.md` for Claude, `.agent.md` for Copilot/Codex
  - `getCommandPrefix()` - Returns `/gsd-` for Claude, `$gsd-` for Copilot/Codex
  - `transformTools(tools)` - Converts tool list to platform format
  - `transformFrontmatter(content)` - Transforms agent frontmatter
  - `getTargetDir(isGlobal)` - Returns installation directory
  - `getInstructionsPath(isGlobal)` - Returns path to PLATFORM.md file

**AdapterRegistry (Singleton):**
- Purpose: Central registry for platform adapters
- Location: `bin/lib/platforms/registry.js`
- Pattern: Registry/Factory pattern
- Initialized with all three platform adapters on construction
- Used throughout codebase for adapter lookup

**BaseValidator (Base Class):**
- Purpose: Frontmatter validation for skills
- Examples: `bin/lib/platforms/claude/validator.js`, `bin/lib/platforms/copilot/validator.js`
- Pattern: Template Method pattern with hook methods
- Methods:
  - `validate(frontmatter, context)` - Main validation entry point
  - `validateRequiredFields()` - Common required field validation
  - `validateOptionalFields()` - Platform-specific optional fields (hook)
  - `validateUnknownFields()` - Platform-specific unknown field warnings (hook)

**Manifest Schema:**
- Purpose: Installation metadata tracking
- Location: `bin/lib/manifests/schema.js`
- Pattern: Data Transfer Object with Joi validation
- Fields:
  - `gsd_version` - Installed version (e.g., "2.0.0")
  - `platform` - Platform name (claude/copilot/codex)
  - `scope` - Installation scope (global/local)
  - `installed_at` - ISO timestamp
  - `files` - Array of relative file paths

**Template Variables:**
- Purpose: Platform-agnostic template content
- Pattern: Mustache-style variable substitution (`{{VARIABLE}}`)
- Variables:
  - `{{PLATFORM_ROOT}}` - Path reference (.claude/.github/.codex)
  - `{{COMMAND_PREFIX}}` - Command prefix (/gsd- or $gsd-)
  - `{{VERSION}}` - Current GSD version
  - `{{PLATFORM_NAME}}` - Platform name (claude/copilot/codex)

## Entry Points

**CLI Entry Point:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-multi [flags]`
- Responsibilities:
  - Parse command-line arguments
  - Validate flags and custom paths
  - Check for updates (--check-updates)
  - Detect and migrate old versions
  - Route to interactive or direct installation mode

**Interactive Entry Point:**
- Location: `bin/lib/cli/interactive.js`
- Triggers: Running without flags (TTY detected)
- Responsibilities:
  - Display beautiful prompts with @clack/prompts
  - Detect platform CLIs
  - Discover existing installations with version status
  - Collect platform and scope selections
  - Hand off to installation loop

**Installation Orchestrator:**
- Location: `bin/lib/installer/orchestrator.js`
- Triggers: Called by installation loop for each platform
- Responsibilities:
  - Symlink detection and confirmation
  - Old version migration
  - Version validation (downgrade prevention)
  - Template variable preparation
  - Sequential component installation (skills → agents → shared → instructions)
  - Manifest generation

## Error Handling

**Strategy:** Layered error handling with custom error types

**Patterns:**

**InstallError (Custom Error Class):**
- Location: `bin/lib/errors/install-error.js`
- Purpose: Structured errors with exit codes
- Exit codes:
  - 1: GENERIC_ERROR
  - 2: INVALID_ARGS
  - 3: MISSING_TEMPLATES
  - 4: PERMISSION_DENIED
  - 5: INSUFFICIENT_SPACE
  - 6: INVALID_PATH

**ValidationError (Custom Error Class):**
- Location: `bin/lib/platforms/_shared/validation-error.js`
- Purpose: Frontmatter validation failures
- Contains: field name, validation reason, file path, platform

**Error Logging:**
- Location: `bin/lib/validation/error-logger.js`
- Pattern: File-based error logging for debugging
- Logged to: `.planning/errors/install-error-[timestamp].json`
- Contains: Error details, stack trace, installation context

**Pre-flight Validation:**
- Location: `bin/lib/preflight/pre-flight-validator.js`
- Pattern: Collect all validation errors, display grouped report
- Validation order: disk space → templates → permissions → paths → symlinks
- Fails fast on prerequisites (templates missing)

**Runtime Error Handling:**
- Pattern: Try-catch at orchestrator level
- User-facing: Friendly error messages via error-formatter
- Debug: Detailed error logs to .planning/errors/
- Recovery: Atomic installations (all-or-nothing per platform)

## Cross-Cutting Concerns

**Logging:**
- Location: `bin/lib/cli/logger.js`
- Pattern: Structured logging with chalk colors
- Functions:
  - `logger.info()`, `logger.success()`, `logger.warn()`, `logger.error()`
  - `logger.blockTitle()` - Bordered titles
  - `logger.simpleSubtitle()` - Section headers
  - `logger.listItem()` - Bulleted list items
  - `logger.verboseInProgress()`, `logger.verboseComplete()` - Verbose mode output

**Validation:**
- Path validation: 8-layer security checks (traversal, null bytes, special chars, etc.)
- Frontmatter validation: Platform-specific validators with base validator
- Version validation: Semantic version comparison, downgrade prevention
- Custom path validation: Prevent multiple platforms to same directory

**Progress Display:**
- Location: `bin/lib/cli/progress.js`
- Pattern: cli-progress bars for non-verbose mode
- Modes:
  - Verbose: File-by-file output
  - Non-verbose: Progress bars with completion lines

**Symlink Handling:**
- Location: `bin/lib/paths/symlink-resolver.js`
- Pattern: Single-level symlink resolution with user confirmation
- Behavior: Detect symlinks, warn user, get confirmation before writing

**Transaction Safety:**
- Pattern: Per-platform atomic installations
- Approach: Install all components or fail entirely
- Rollback: Not implemented (user must manually clean up on failure)
- Migration: Backup old version before upgrade

**Version Management:**
- Semantic versioning with semver library
- Version comparison: `bin/lib/version/version-checker.js`
- Old version detection: Pattern-based detection of v1.x installations
- Manifest-based tracking: Each installation tracked in `.gsd-install-manifest.json`

**Security:**
- Path validation at multiple layers (input, pre-flight, runtime)
- Template variable sanitization (no user-controlled variables)
- Symlink detection and confirmation
- Permission checks before file operations

---

*Architecture analysis: 2026-02-01*
