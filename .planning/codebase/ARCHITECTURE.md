# Architecture

**Analysis Date:** 2026-01-29

**Scope:**
- Source files: 81 files
- Primary language: JavaScript (100% of codebase)
- LOC: 9,740 lines
- Test coverage: 21 test files

## Pattern Overview

**Overall:** Template-Based Multi-Platform Installer with Adapter Pattern

**Key Characteristics:**
- Adapter pattern for platform-specific transformations (Claude, Copilot, Codex)
- Template-driven installation from `/templates/` to platform-specific directories
- Atomic transaction pattern with rollback on failure
- Manifest-based version tracking and update detection
- Interactive CLI with beautiful prompts using @clack/prompts
- Isolated platform adapters (no inheritance between platforms per ADR)

## Layers

**CLI Layer:**
- Purpose: User interaction, flag parsing, mode detection, progress display
- Location: `bin/lib/cli/`
- Contains: Interactive prompts, banner management, progress bars, logger utilities, flag parsing
- Depends on: Platform layer, Installer layer, Updater layer
- Used by: Entry point (`bin/install.js`)

**Platform Layer:**
- Purpose: Platform-specific transformations and detection
- Location: `bin/lib/platforms/`
- Contains: Platform adapters (Claude, Copilot, Codex), registry, detector, binary detector, path management
- Depends on: Rendering layer, IO layer
- Used by: CLI layer, Installer layer

**Installer Layer:**
- Purpose: Orchestrate file installation, template processing, manifest generation
- Location: `bin/lib/installer/`
- Contains: Installation orchestrator, skills installer, agents installer, shared installer
- Depends on: Platform layer, Rendering layer, IO layer, Validation layer, Migration layer
- Used by: CLI layer

**Rendering Layer:**
- Purpose: Template variable replacement and frontmatter processing
- Location: `bin/lib/rendering/`
- Contains: Template renderer, frontmatter serializer, frontmatter cleaner
- Depends on: IO layer
- Used by: Installer layer, Platform layer

**Validation Layer:**
- Purpose: Pre-flight checks, path validation, security checks
- Location: `bin/lib/validation/`, `bin/lib/preflight/`
- Contains: Path validators, pre-install checks, CLI validators, pre-flight validator
- Depends on: IO layer, Config layer
- Used by: Installer layer, CLI layer

**Migration Layer:**
- Purpose: Migrate old v1.x installations to v2.0.0
- Location: `bin/lib/migration/`
- Contains: Migration orchestrator, migration manager, backup manager
- Depends on: Version layer, IO layer, Platform layer
- Used by: Installer layer (orchestrator)

**Version Layer:**
- Purpose: Version detection, comparison, old version handling
- Location: `bin/lib/version/`
- Contains: Old version detector, version checker, version detector, installation finder
- Depends on: Platform layer, Manifest layer
- Used by: Updater layer, Migration layer, Installer layer

**Updater Layer:**
- Purpose: Check for updates, validate installations
- Location: `bin/lib/updater/`
- Contains: Update checker, global/local/custom-path checkers, validator, formatters
- Depends on: Version layer, Manifest layer
- Used by: CLI layer (check-updates flag)

**Manifest Layer:**
- Purpose: Read/write/validate installation manifests
- Location: `bin/lib/manifests/`
- Contains: Manifest reader, writer, schema, repair utilities
- Depends on: IO layer
- Used by: Installer layer, Updater layer, Version layer

**IO Layer:**
- Purpose: Safe file system operations with validation
- Location: `bin/lib/io/`, `bin/lib/paths/`
- Contains: File operations (copy, read, write), path resolvers, symlink resolvers
- Depends on: Validation layer (path validator)
- Used by: All layers that interact with file system

**Config Layer:**
- Purpose: Central configuration and constants
- Location: `bin/lib/config/`
- Contains: Path allowlists, Windows reserved names
- Depends on: Nothing (leaf)
- Used by: Validation layer

**Error Layer:**
- Purpose: Custom error types and exit codes
- Location: `bin/lib/errors/`
- Contains: Install errors, directory errors, exit codes
- Depends on: Nothing (leaf)
- Used by: All layers

## Data Flow

**Installation Flow:**

1. **Entry Point** (`bin/install.js`)
   - Parse CLI flags via `flag-parser.js`
   - Detect platforms via `detector.js` and `binary-detector.js`
   - Choose interactive or CLI mode via `mode-detector.js`

2. **Mode Selection**
   - **Interactive:** Run `interactive.js` → prompt for platforms/scope → `install-loop.js`
   - **CLI:** Parse flags → `install-loop.js`

3. **Installation Loop** (`install-loop.js`)
   - Check for old versions via `migration-orchestrator.js`
   - Migrate if needed via `migration-manager.js` and `backup-manager.js`
   - For each platform: call `installation-core.js` → `orchestrator.js`

4. **Orchestration** (`orchestrator.js`)
   - Run pre-flight validation via `pre-flight-validator.js`
   - Detect existing installation via `pre-install-checks.js`
   - Validate version via `version-checker.js` (block downgrades, warn on major updates)
   - Install skills via `install-skills.js`
   - Install agents via `install-agents.js`
   - Install shared directory via `install-shared.js`
   - Generate and write manifest via `manifests/writer.js`

5. **Template Processing**
   - Load template from `/templates/{skills|agents}/`
   - Get platform adapter from `registry.js`
   - Replace variables via `template-renderer.js`
   - Transform frontmatter via adapter's `transformFrontmatter()`
   - Clean frontmatter via `frontmatter-cleaner.js`
   - Write to target directory via `file-operations.js`

6. **Completion**
   - Display summary via `logger.js`
   - Show next steps via `next-steps.js`

**Update Check Flow:**

1. `handleCheckUpdates()` in `check-update.js`
2. Check global installations via `check-global.js`
3. Check local installations via `check-local.js`
4. Check custom path via `check-custom-path.js`
5. Validate each installation via `updater/validator.js`
6. Compare versions via `version-checker.js`
7. Format status via `format-status.js`
8. Display messages via `update-messages.js`

**State Management:**
- Stateless architecture (no in-memory state)
- State persisted in `.gsd-install-manifest.json` per installation
- Manifest contains: version, platform, scope, installed files, timestamp

## Key Abstractions

**PlatformAdapter (Abstract Base Class):**
- Purpose: Define interface for platform-specific transformations
- Location: `bin/lib/platforms/base-adapter.js`
- Implementations: `claude-adapter.js`, `copilot-adapter.js`, `codex-adapter.js`
- Pattern: Each platform has complete implementation (NO inheritance between platforms per ADR)
- Methods:
  - `getFileExtension()` - `.md` vs `.agent.md`
  - `getTargetDir(isGlobal)` - `.claude` vs `.github` vs `.codex`
  - `getCommandPrefix()` - `/gsd-` vs `$gsd-`
  - `transformTools(tools)` - Map tool names (Read/Write/Bash → read/write/execute)
  - `transformFrontmatter(data)` - Platform-specific frontmatter formatting
  - `getPathReference()` - `.claude` vs `.github` vs `.codex`

**AdapterRegistry (Singleton):**
- Purpose: Centralized registry of platform adapters
- Location: `bin/lib/platforms/registry.js`
- Pattern: Factory pattern for adapter instances
- Methods:
  - `getAdapter(platformName)` - Get adapter instance
  - `getSupportedPlatforms()` - List all platforms

**Template Variables:**
- Purpose: Platform-agnostic template placeholders
- Variables:
  - `{{PLATFORM_ROOT}}` - `.claude`, `.github`, or `.codex`
  - `{{COMMAND_PREFIX}}` - `/gsd-` or `$gsd-`
  - `{{VERSION}}` - GSD version (e.g., "2.0.0")
  - `{{PLATFORM_NAME}}` - "claude", "copilot", or "codex"
- Location: Defined in `orchestrator.js`, replaced by `template-renderer.js`

**Manifest Schema:**
- Purpose: Track installation metadata and files
- Location: `bin/lib/manifests/schema.js`
- Schema:
  ```javascript
  {
    gsd_version: "2.0.0",
    platform: "claude" | "copilot" | "codex",
    scope: "global" | "local",
    installed_at: "2026-01-29T...",
    files: ["skills/gsd-help/SKILL.md", ...]
  }
  ```
- Validation: `validateManifest()` checks required fields and types
- Repair: `repairManifest()` fixes common issues (string files → array)

## Entry Points

**Main Entry Point:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-multi [flags]`
- Responsibilities:
  - Parse CLI arguments via commander
  - Show banner via `banner-manager.js`
  - Check for old versions via `migration-orchestrator.js`
  - Choose interactive vs CLI mode
  - Execute installation loop

**Interactive Mode Entry:**
- Location: `bin/lib/cli/interactive.js`
- Triggers: No flags provided + valid TTY
- Responsibilities:
  - Detect platforms
  - Prompt for platform selection
  - Prompt for scope selection
  - Hand off to `install-loop.js`

**CLI Mode Entry:**
- Location: `bin/lib/cli/flag-parser.js` → `install-loop.js`
- Triggers: Flags provided (--claude, --all, etc.)
- Responsibilities:
  - Parse platform flags
  - Parse scope flags
  - Validate flag combinations
  - Hand off to `install-loop.js`

**Hook Entry Points:**
- Location: `hooks/gsd-check-update.js`, `hooks/statusline.js`
- Triggers: Manual execution or IDE integration
- Responsibilities:
  - Check updates: `gsd-check-update.js`
  - Show statusline: `statusline.js`

## Error Handling

**Strategy:** Fail-fast with grouped error reporting

**Patterns:**

1. **Pre-Flight Validation (Fail-Fast):**
   - All validations run in `pre-flight-validator.js`
   - Collect all errors before failing
   - Display grouped errors with sections
   - Exit before any file operations
   - Example:
     ```javascript
     const errors = [];
     errors.push(...pathErrors);
     errors.push(...diskSpaceErrors);
     if (errors.length > 0) {
       displayGroupedErrors(errors);
       throw new Error('Pre-flight checks failed');
     }
     ```

2. **Custom Error Types:**
   - Location: `bin/lib/errors/install-error.js`
   - Types: `InstallError` with exit codes
   - Factory functions: `permissionDenied()`, `insufficientSpace()`, `invalidPath()`
   - Exit codes: `EXIT_CODES.INVALID_ARGS`, `EXIT_CODES.PERMISSION_DENIED`, etc.

3. **Validation Chain:**
   - Path validation via `path-validator.js` (traversal attacks, absolute paths)
   - CLI validation via `cli-validator.js` (flag combinations)
   - Manifest validation via `manifests/schema.js`

4. **Migration Error Handling:**
   - Backup before migration via `backup-manager.js`
   - Rollback on failure
   - User confirmation for risky operations
   - Preserve v1.x installation if migration fails

5. **Manifest Repair:**
   - Detect corrupt manifests via `reader.js`
   - Attempt repair via `repair.js`
   - Only repair known issues (e.g., string → array conversion)
   - Log repair actions

## Cross-Cutting Concerns

**Logging:**
- Framework: Custom logger (`bin/lib/cli/logger.js`)
- Levels: info, success, warn, error, verbose
- Features:
  - Colored output via chalk
  - Indentation support
  - Subtitle formatting
  - Block titles with width calculation
  - Verbose mode toggle
- Patterns:
  ```javascript
  logger.info('Message', indent, fullColor);
  logger.success('Done', 2);
  logger.warn('Warning', 2);
  logger.error('Failed', 2);
  logger.verbose('Details', 2, isVerbose);
  ```

**Validation:**
- Approach: Centralized in validation and preflight layers
- Path validation: `path-validator.js` (traversal, absolute, Windows reserved)
- CLI validation: `cli-validator.js` (flag combinations, platform conflicts)
- Pre-install checks: `pre-install-checks.js` (existing installations)
- Pre-flight validation: `pre-flight-validator.js` (all checks before installation)

**Authentication:**
- Approach: Not applicable (installer does not authenticate)
- Note: Platform CLIs (Claude, Copilot, Codex) handle their own auth

**Progress Feedback:**
- Interactive mode: Spinners and prompts via @clack/prompts
- CLI mode: Progress bars via cli-progress (or simple completion lines)
- Verbose mode: File-by-file logging
- Non-verbose mode: Grouped completion summaries

**Platform Isolation:**
- Approach: Adapter pattern with NO inheritance between adapters
- Architecture Decision: `.planning/ARCHITECTURE-DECISION.md` (Platform Adapter Isolation Over DRY)
- Rationale: Changes to one platform should not affect others
- Trade-off: Code duplication acceptable for isolation and maintainability

**Path Management:**
- Approach: Centralized in `bin/lib/platforms/platform-paths.js`
- Architecture Decision: `.planning/ARCHITECTURE-DECISION.md` (Centralized Path Management)
- Single source of truth for all platform paths
- Functions:
  - `getPlatformDir(platform, isGlobal)` - Get platform directory
  - `getInstallPath(platform, isGlobal)` - Get full install path
  - `getManifestPath(platform, isGlobal)` - Get manifest path
  - `getAllGlobalPaths()`, `getAllLocalPaths()` - For discovery
  - `derivePlatformFromPath(manifestPath)` - Reverse lookup

**Testing:**
- Framework: Vitest
- Coverage: 21 test files (unit + integration + version-specific)
- Isolation: All tests run in `/tmp` (never in source directory)
- Protection: Source files (`.github/`, `.claude/`, `.codex/`) never modified
- Key test files:
  - `tests/unit/old-version-detector.test.js` (326 LOC)
  - `tests/unit/migration-manager.test.js` (318 LOC)
  - `tests/integration/migration-flow.test.js` (405 LOC)
  - `tests/unit/frontmatter-serializer.test.js` (395 LOC)

**Atomic Operations:**
- Approach: Transaction pattern in installer orchestrator
- Backup before migration via `backup-manager.js`
- Rollback on failure (future enhancement)
- Manifest written only after successful installation
- All-or-nothing guarantee for file operations

---

## Architecture Decision Records

### ADR 1: Platform Adapter Isolation Over DRY (2026-01-26)

**Status:** ✅ APPROVED | **Impact:** HIGH

**Decision:** Each platform MUST have its own complete adapter implementation. NO inheritance between platform adapters (ClaudeAdapter, CopilotAdapter, CodexAdapter).

**Rationale:**
- **Platform Isolation:** Changes to Copilot specs only affect CopilotAdapter
- **Maintainability:** Clear boundaries, no inheritance surprises
- **Debugging:** No parent class tracing needed
- **Future-Proofing:** Platform specs may diverge over time
- **Trade-off:** 200 lines of duplication is acceptable vs coupling

**Implementation:**
```
PlatformAdapter (base)
    ├─ ClaudeAdapter (complete, isolated)
    ├─ CopilotAdapter (complete, isolated)
    └─ CodexAdapter (complete, isolated)
```

**Consequences:**
- ✅ Platform changes confined to single file
- ✅ Self-contained adapters (easier testing/debugging)
- ⚠️ ~200 LOC duplicated across 3 adapters
- ⚠️ Bug fixes may need changes in multiple files

**References:** REQUIREMENTS.md (PLATFORM-02), phases/03-*/03-RESEARCH.md

---

### ADR 2: Centralized Path Management (2026-01-27)

**Status:** ✅ IMPLEMENTED | **Impact:** MEDIUM

**Decision:** Create `bin/lib/platforms/platform-paths.js` as single source of truth for all GSD path definitions.

**Problem:** Platform paths hardcoded across ~10 files, making maintenance error-prone.

**Implementation:**
```javascript
// Platform directory mappings
platformDirs = {
  claude: { global: '.claude', local: '.claude' },
  copilot: { global: '.copilot', local: '.github' },
  codex: { global: '.codex', local: '.codex' }
};

// Helper functions
getPlatformDir(platform, isGlobal)
getInstallPath(platform, isGlobal)
getManifestPath(platform, isGlobal)
derivePlatformFromPath(manifestPath)
```

**Benefits:**
- Single source of truth for all paths
- Consistent with platform-names.js pattern
- Easier to add new platforms
- Reduced duplication

**Files Refactored:** 7 files (claude/copilot/codex adapters, detector, installation-finder, check-update)

---

*Architecture analysis: 2026-01-29 (includes ADRs from project history)*
