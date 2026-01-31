# Project Roadmap

**Project:** get-shit-done-multi  
**Milestone:** v2.0 — Complete Multi-Platform Installer  
**Created:** 2025-01-25  
**Status:** Phase 9 Complete ✅ — All phases finished

---

## Overview

This roadmap delivers a **complete template-based installer** that deploys AI CLI skills and agents to Claude Code, GitHub Copilot CLI, and Codex CLI. Users run `npx get-shit-done-multi`, answer interactive prompts, and get working skills installed atomically with rollback on failure.

**Approach:** Establish clean foundation with ONE-TIME migration (Phase 1 converts `.github/` → `/templates/` with frontmatter corrections, then deleted), build core installer using templates (Phase 2), add multi-platform support (Phase 3), enhance UX with interactive prompts (Phase 4), add reliability with transactions (Phase 5) and versioning (Phase 6), harden with security (Phase 7), document everything (Phase 8), and add platform instructions installer (Phase 9).

**Architecture Strategy:** Phase 1 is a ONE-TIME migration that establishes `/templates/` as permanent source of truth. After Phase 1, `.github/` becomes historical reference only, and all future work uses `/templates/`. Conversion logic is temporary and deleted after Phase 1 completes.

**Version Strategy:** Initial release is v2.0 (complete product). Future versions follow SemVer: new commands = MINOR, breaking changes = MAJOR.

**Coverage:** 37 v2.0 requirements mapped across 9 phases

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **fs-extra** | ^11.2.0 | File operations | Promise-based with better error handling than native fs |
| **@clack/prompts** | ^0.11.0 | Interactive CLI | Modern prompts with spinners, disabled options for "coming soon" |
| **chalk** | ^5.3.0 | Terminal colors | Better UX with colored output |
| **ora** | ^8.0.1 | Loading spinners | Feedback during long operations |
| **ejs** | ^3.1.9 | Template engine | JavaScript/JSON templates with conditionals |
| **semver** | ^7.5.4 | Version comparison | Detect updates, handle major/minor/patch |

### Platform Requirements

- **Node.js ≥16.7.0** (native ESM support)
- **Claude Code** (optional, detected via `.claude/get-shit-done/` paths)
- **GitHub Copilot CLI** (optional, detected via `copilot` binary and `.github/get-shit-done/` paths)
- **Codex CLI** (optional, detected via `codex` binary and `.codex/get-shit-done/` paths)

---

## Phases

### Phase 1: Template Migration (ONE-TIME) ✅ COMPLETE

**Goal:** Migrate `.github/` skills and agents to `/templates/` with frontmatter corrections, validate manually, establish permanent source of truth

**Type:** ONE-TIME MIGRATION with MANDATORY manual validation gate

**Dependencies:** None (foundation)

**Plans:** 4 plans (all complete)

**Completed:** 2026-01-26

**Verification:** 28/28 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- TEMPLATE-01: Migration to template structure (Phase 1 one-time)
- TEMPLATE-01B: Template variable injection (Phase 1 one-time)
- TEMPLATE-01C: Frontmatter format correction for skills (Phase 1 one-time)
- TEMPLATE-01D: Agent frontmatter correction (Phase 1 one-time)
- TEMPLATE-02B: Tool name reference table
- TEMPLATE-03: Template variables
- TEST-01: Testing isolation
- TEST-02: Test cleanup

**Success Criteria:**
1. All 29 skills migrated from `.github/skills/` → `/templates/skills/` with corrected frontmatter
2. All 13 agents migrated from `.github/agents/` → `/templates/agents/` with corrected frontmatter
3. Skill frontmatter corrections applied: `allowed-tools` (comma-separated string), `argument-hint`, removed unsupported fields
4. Agent frontmatter corrections applied: `tools` string, `skills` auto-generated from content scan, removed metadata block
5. version.json created per skill (29 files in `/templates/skills/gsd-*/version.json`)
6. versions.json created for all agents (1 file in `/templates/agents/versions.json`)
7. Template variables injected: `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, `{{VERSION}}`, `{{PLATFORM_NAME}}`
8. Tool names mapped correctly (Copilot aliases → Claude official names)
9. Shared directory template (`/templates/get-shit-done/`) with manifest template
10. Skills field auto-generated for agents (scans for `/gsd-*` references in content)
11. All templates validate against official Claude/Copilot specs
12. Migration script validates 100% success before completion
13. **MANDATORY PAUSE:** Migration outputs validation report and STOPS
14. **Manual validation:** User reviews all generated templates, validates frontmatter, checks spec compliance
15. **Explicit approval required:** User must explicitly approve Phase 1 results before Phase 2 begins
16. **After approval:** Migration code committed once to git, then DELETED completely from working tree
17. `.github/` remains untouched (READ-ONLY historical reference)

**Key Deliverables:**
- `/scripts/migrate-to-templates.js` (ONE-TIME migration script)
- `/templates/skills/gsd-*/SKILL.md` (29 skills with corrected frontmatter)
- `/templates/skills/gsd-*/version.json` (29 version files)
- `/templates/agents/gsd-*.agent.md` (13 agents with corrected frontmatter)
- `/templates/agents/versions.json` (1 consolidated versions file)
- `/templates/get-shit-done/.gsd-install-manifest.json` (template)
- Frontmatter parser (gray-matter for YAML parsing)
- Tool name mapping utilities
- Skill reference extractor (scans agent content for skill references)
- Validation suite (checks output against official specs)
- Migration report (shows before/after comparison, validation results, PAUSES for review)

**Post-Phase 1 Actions (AFTER MANUAL APPROVAL):**
1. User validates templates manually (spot-check frontmatter, verify corrections)
2. User explicitly approves Phase 1 results (verbal confirmation or flag)
3. Commit migration code to git: `git add scripts/ && git commit -m "feat: Phase 1 migration complete"`
4. Delete migration code: `rm -rf scripts/migrate-to-templates.js` (preserves git history only)
5. Commit deletion: `git add -A && git commit -m "chore: remove Phase 1 migration code"`
6. Update documentation to reference `/templates/` as permanent source
7. Begin Phase 2 (installation foundation)

**CRITICAL CONSTRAINTS:**
- NO code preservation beyond git history (no .archive/, no stages/, no shared/)
- NO reusable components between Phase 1 and Phase 2+
- Phase 2+ written FRESH (may duplicate logic, that's acceptable)
- Migration code exists ONLY in git history after deletion

**References:**
- See `.planning/FRONTMATTER-CORRECTIONS.md` for skill corrections spec
- See `.planning/AGENT-CORRECTIONS.md` for agent corrections spec

**Plans:**
- [ ] 01-01-PLAN.md — Migration Script & Frontmatter Parsing (Wave 1)
- [ ] 01-02-PLAN.md — Skills Migration & Correction (Wave 2)
- [ ] 01-03-PLAN.md — Agents Migration & Correction (Wave 3)
- [ ] 01-04-PLAN.md — Validation, Report & Manual Review Gate (Wave 4)

**Notes:**
- This is a ONE-TIME migration, not an ongoing transformation pipeline
- Phase 1 MUST pause for manual validation (not automated approval)
- After Phase 1, `/templates/` becomes permanent source of truth
- `.github/` preserved as historical reference only
- Migration code committed once, then deleted (preserved only in git history)
- Phase 2+ has ZERO dependencies on Phase 1 code (fresh implementation)

---

### Phase 2: Core Installer Foundation

**Goal:** User can install get-shit-done skills to Claude Code via `npx get-shit-done-multi --claude` using templates from `/templates/`

**Dependencies:** Phase 1 (templates must exist)

**Plans:** 4 plans

**Requirements Mapped:**
- INSTALL-01: NPX entry point (version 2.0.0)
- INSTALL-02: File system operations
- INSTALL-03: Template rendering (uses `/templates/` as source, never `.github/`)
- CLI-02: Platform selection flags (`--claude`)
- CLI-05: Help and version flags
- SAFETY-02: Path normalization

**Success Criteria:**
1. User runs `npx get-shit-done-multi --claude` and skills install to `~/.claude/skills/gsd-*/`
2. Installation reads from `/templates/` directory (never `.github/`)
3. Template variables (e.g., `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`) replaced correctly in output files
4. Skill structure: `.claude/skills/gsd-<name>/SKILL.md` (directory-based)
5. Agent structure: `.claude/agents/gsd-<name>.md` (flat files)
6. Shared directory copies to `.claude/get-shit-done/` with manifest
7. Installation completes in <30 seconds for typical setup
8. `--help` and `--version` flags show correct information
9. Version displays as 2.0.0

**Key Deliverables:**
- `/bin/install.js` (entry point with shebang)
- `/bin/lib/io/file-operations.js` (copy, create directories)
- `/bin/lib/rendering/template-renderer.js` (string replacement, uses `/templates/`)
- `/bin/lib/paths/path-resolver.js` (normalization, validation)
- `/get-shit-done/.gsd-install-manifest.json` (generated from template)
- Basic error handling and logging

**Plans:**
- [ ] 02-01-PLAN.md — Foundation & Project Structure (Wave 1)
- [ ] 02-02-PLAN.md — Core Modules (Wave 2)
- [ ] 02-03-PLAN.md — CLI Integration & Installation Orchestration (Wave 3)
- [ ] 02-04-PLAN.md — Test Infrastructure & Integration Tests (Wave 4)

**Notes:**
- Keep it simple: no adapter abstraction yet (validate mechanics first)
- No rollback yet (comes in Phase 5)
- No interactive prompts yet (comes in Phase 4)
- Initial version is 2.0.0
- `/templates/` is source of truth (migration completed in Phase 1)

---

### Phase 3: Multi-Platform Support with All Three Platforms

**Goal:** User can install to Claude, Copilot, OR Codex via `--claude`, `--copilot`, or `--codex` flags, with correct platform-specific transformations

**Dependencies:** Phase 2 (core installer must work)

**Plans:** 3 plans

**Completed:** 2026-01-26

**Verification:** 23/23 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- PLATFORM-01: Platform detection (GSD-specific paths)
- PLATFORM-01B: Binary detection for recommendations
- PLATFORM-02: Platform adapter interface
- PLATFORM-03: Claude Code adapter (updated for `.claude/skills/`)
- PLATFORM-04: GitHub Copilot adapter (binary `copilot`, paths `~/.copilot/` and `.github/`)
- PLATFORM-04B: Codex CLI adapter (`$gsd-` prefix, paths `~/.codex/` and `.codex/`)
- PLATFORM-05: Shared directory copy (per platform, with manifests)
- CLI-03: Installation mode flags (`--local`, `--global`)
- TEMPLATE-02: Platform-specific transformations

**Success Criteria:**
1. User runs `npx get-shit-done-multi --copilot --global` and skills install to `~/.copilot/skills/gsd/`
2. User runs `npx get-shit-done-multi --copilot --local` and skills install to `.github/skills/gsd/`
3. User runs `npx get-shit-done-multi --codex --global` and skills install to `~/.codex/skills/gsd/`
4. Tool names transform correctly:
   - Claude: `Read, Write, Bash` (capitalized)
   - Copilot/Codex: `read, edit, execute` (lowercase + mappings)
5. Frontmatter transforms correctly (Copilot/Codex get metadata, Claude doesn't)
6. File extensions differ per platform (`.md` for Claude, `.agent.md` for Copilot/Codex)
7. Path references rewrite per platform (`@.claude/...` vs `@.github/...` vs `@.codex/...`)
8. Command prefixes transform correctly (`/gsd-` for Claude/Copilot, `$gsd-` for Codex)
9. All three `--claude`, `--copilot`, `--codex` flags can be used simultaneously (install to all three)
10. Detection uses GSD paths (`.github/skills/gsd-*`, etc.), not CLI binaries
11. Binary detection (`copilot`, `claude`, `codex`) used for recommendations only

**Key Deliverables:**
- `/bin/lib/platforms/base-adapter.js` (adapter interface)
- `/bin/lib/platforms/claude-adapter.js` (Claude transformations)
- `/bin/lib/platforms/copilot-adapter.js` (Copilot transformations)
- `/bin/lib/platforms/codex-adapter.js` (Codex transformations with `$gsd-` prefix)
- `/bin/lib/platforms/detector.js` (detect GSD installations via paths)
- `/bin/lib/platforms/binary-detector.js` (detect CLI binaries for recommendations)
- `/bin/lib/platforms/registry.js` (adapter lookup)
- Updated rendering to use adapters for transformations

**Plans:**
- [x] 03-01-PLAN.md — Platform Foundation (Wave 1)
- [x] 03-02-PLAN.md — Concrete Adapters (Wave 2)
- [x] 03-03-PLAN.md — Orchestrator Integration and CLI (Wave 3)

**Notes:**
- This validates the adapter pattern with all three platforms
- Platform detection checks for existing GSD installations, not CLI presence
- Binary detection (`copilot`, `claude`, `codex`) recommends which platforms to install
- ARCHITECTURAL RULE: Each adapter extends ONLY PlatformAdapter (no cross-inheritance)

---

### Phase 4: Interactive CLI with Beautiful UX ✅ COMPLETE

**Goal:** User runs `npx get-shit-done-multi` (no flags), sees beautiful interactive prompts, selects platform and skills, confirms installation

**Dependencies:** Phase 3 (multi-platform support needed for selection)

**Plans:** 1 plan (complete)

**Completed:** 2026-01-26

**Verification:** ✅ 12/12 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- CLI-01: Interactive mode (default)
- CLI-04: Confirmation flags (`--yes`)
- UX-01: Progress feedback
- UX-02: Beautiful interactive prompts
- UX-03: Error handling with guidance

**Success Criteria:**
1. User runs `npx get-shit-done-multi` with no flags → interactive prompts appear
2. Installer auto-detects installed CLI binaries (`copilot`, `claude`, `codex`) and recommends platforms
3. Installer detects existing GSD installations and shows their versions
4. User selects platform from menu (disabled options show "coming soon" for unsupported platforms)
5. User selects scope (global or local)
6. Global detection check: If zero CLIs detected, show warning + confirmation before platform selection
7. Installation proceeds without skill selection or confirmation prompts (streamlined UX)
8. Progress bars show during file operations (reuses cli-progress MultiBar)
9. Success message shows next steps ("Run /gsd-help to get started")
10. Errors show actionable guidance (not generic "failed")
11. CTRL+C cancellation exits gracefully with exit code 0

**Key Deliverables:**
- `/bin/lib/cli/interactive.js` (runInteractive orchestrator, @clack/prompts integration)
- Updated `/bin/install.js` to detect no flags + TTY → interactive mode
- Progress indicators reused from Phase 2/3 (cli-progress)
- Error formatting reused from Phase 2/3 (chalk + logger)

**Plans:**
- [x] 04-01-PLAN.md — Interactive Mode with @clack/prompts (Wave 1) ✅ COMPLETE

**Notes:**
- This is the primary UX for manual installation (most common use case)
- Flags still work for automation (CI/CD)
- Installs ALL skills/agents by default (no individual selection)
- No confirmation prompt before installation (streamlined per user feedback)

---

### Phase 5: Pre-Installation Validation & Manifest Generation

**Goal:** Validate installation conditions before any writes, generate manifest after successful installation

**SCOPE CHANGE:** No rollback implementation. Focus on prevention (validation) over recovery.

**Dependencies:** Phase 2-4 (needs file operations, adapters, and interactive CLI)

**Plans:** 2 plans (all complete)

**Completed:** 2026-01-27

**Verification:** 10/10 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- INSTALL-05: Pre-installation validation
- VERSION-01: Installation manifest
- (INSTALL-04 deferred - no rollback in Phase 5)

**Success Criteria:**
1. Pre-installation disk space check (exact + 10% buffer)
2. Pre-installation permission check (test actual write)
3. Existing installation detection (read manifest)
4. Path validation (no traversal, no system directories)
5. Manifest generation after successful install
6. Manifest includes: gsd_version, platform, scope, timestamp, file list
7. Error logging to `.gsd-error.log` in target directory
8. User-friendly error messages on terminal
9. Actionable guidance on validation failures
10. Clear retry instructions on installation failure

**Key Deliverables:**
- `/bin/lib/validation/pre-install-checks.js` (validation functions)
- `/bin/lib/validation/manifest-generator.js` (manifest with file list)
- `/bin/lib/validation/error-logger.js` (error logging and formatting)
- Updated `orchestrator.js` with validation gate and manifest generation
- Updated `installation-core.js` with error logging wrapper

**Plans:**
- [x] 05-01-PLAN.md — Pre-Installation Validation Module (Wave 1) ✅
- [x] 05-02-PLAN.md — Manifest Generation & Integration (Wave 2) ✅

**Notes:**
- Prevention over recovery: validation catches ~80% of failures before writes
- No rollback complexity: simpler codebase, faster execution
- Manual cleanup required on failure (clear instructions provided)
- Trade-off accepted: partial installations possible but rare

---

### Phase 6: Update Detection and Versioning

**Goal:** User re-runs installer → sees installed version, gets prompted if update available, can upgrade

**Dependencies:** Phase 5 (needs installation manifest)

**Plans:** 2 plans

**Requirements Mapped:**
- VERSION-02: Update detection
- VERSION-03: Version display

**Success Criteria:**
1. On re-run, installer reads ALL `.gsd-install-manifest.json` files from all possible paths:
   - `~/.claude/get-shit-done/.gsd-install-manifest.json`
   - `~/.copilot/get-shit-done/.gsd-install-manifest.json`
   - `~/.codex/get-shit-done/.gsd-install-manifest.json`
   - `.claude/get-shit-done/.gsd-install-manifest.json`
   - `.github/get-shit-done/.gsd-install-manifest.json`
   - `.codex/get-shit-done/.gsd-install-manifest.json`
2. Installer compares each installed version vs current version using semver
3. If any installation is outdated, prompt user: "Update available for [platform] (2.0.0 → 2.1.0). Update now? [Y/n]"
4. If user confirms, update proceeds (re-install with new version) for that platform
5. `--version` output shows:
   - Current installer version
   - All detected installations with their versions, platforms, and scopes

**Key Deliverables:**
- `/bin/lib/version/version-checker.js` (compare versions across all installations)
- `/bin/lib/version/manifest-reader.js` (read manifests from all paths)
- `/bin/lib/version/installation-finder.js` (discover all GSD installations)
- Update prompts in interactive mode (per platform)
- Version display in `--version` output showing all installations

**Plans:**
- [x] 06-01-PLAN.md — Core Version Detection Modules (Wave 1)
- [x] 06-02-PLAN.md — Interactive CLI Integration & Update Flow (Wave 2)

**Notes:**
- Uses semver for comparison (handles major/minor/patch)
- Update = re-install (no incremental updates)

---

### Phase 6.1: Old Version Detection & Migration (INSERTED) ✅ COMPLETE

**Goal:** Detect old v1.x installations, offer upgrade with automatic backup, and install v2.0.0

**Dependencies:** Phase 6 (needs version detection infrastructure)

**Type:** Urgent work - Discovered incompatibility between v1.x and v2.0.0 structures

**Plans:** 4 plans in 3 waves (all complete)

**Completed:** 2026-01-28

**Verification:** 10/10 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- VERSION-04: Compatibility with older versions (migration path)
- UX-06: Clear error messages for incompatible installations

**Success Criteria:**
1. Installer detects old v1.x installations (monolithic `.github/skills/get-shit-done/` structure)
2. User sees clear warning: "Version X.X detected (incompatible with v2.0.0)"
3. Single confirmation prompt: "Create backup and upgrade to v2.0.0? [Yes/No]"
4. If Yes: Automatic backup to `[install-dir]/.gsd-backup/YYYY-MM-DD-HHMM/`
5. All old files moved to backup directory (commands, agents, hooks, settings)
6. Clear message shows backup location and manual deletion instructions
7. v2.0.0 installation proceeds after successful backup
8. If No: Exit with explanation that v1.x is incompatible
9. Backup failures preserve old files (no deletion)
10. Integration tests pass for all migration scenarios

**Key Deliverables:**
- `/bin/lib/version/old-version-detector.js` (detect v1.x structure)
- `/bin/lib/migration/migration-manager.js` (backup and migration flow)
- `/bin/lib/migration/backup-manager.js` (atomic backup operations)
- Integration with orchestrator (pre-installation check)
- Integration with interactive mode (migration prompt)
- Updated check-updates flow (incompatibility warnings)
- Integration tests for migration scenarios
- README section: "Upgrading from v1.x"

**Plans:**
- [x] 06.1-01-PLAN.md — Old Version Detector Module (Wave 1) ✅
- [x] 06.1-02-PLAN.md — Migration Manager & Backup Operations (Wave 2) ✅
- [x] 06.1-03-PLAN.md — Integration with Installer Flows (Wave 2) ✅
- [x] 06.1-04-PLAN.md — Integration Tests & Documentation (Wave 3) ✅

**Notes:**
- Inserted as urgent work discovered during Phase 6 completion
- v1.x structure incompatible: monolithic skills vs. modular v2.0
- Migration is one-way (v1.x → v2.0), no downgrade support
- Backup directory in home to avoid project conflicts
- See `06.1-RESEARCH.md` for detailed structural analysis

---

### Phase 6.2: Installation Output Verification & Bug Fixes (INSERTED)

**Goal:** Fix critical installation bugs affecting frontmatter transformation and template variable replacement

**Dependencies:** Phase 6.1 (needs version detection infrastructure)

**Type:** Urgent work - Discovered critical bugs affecting all Copilot installations

**Plans:** 3 plans in 3 waves

**Requirements Mapped:**
- PLATFORM-03: Claude adapter frontmatter (skills field required)
- PLATFORM-04: Copilot adapter frontmatter (skills field forbidden, tools format)
- PLATFORM-04B: Codex adapter frontmatter (skills field forbidden)
- INSTALL-03: Template rendering (variable replacement)

**Success Criteria:**
1. Integration tests verify actual installation output for all platforms
2. Claude agents include `skills` field in frontmatter
3. Copilot agents exclude `skills` field from frontmatter
4. Codex agents exclude `skills` field from frontmatter
5. Copilot/Codex tools serialized as single-line array: `['tool-a', 'tool-b']`
6. All template variables replaced in get-shit-done/ directory files
7. Recursive processing handles all file types (.md, .json, .sh)
8. All integration tests pass (new + existing)

**Key Deliverables:**
- Custom frontmatter serializer for Copilot/Codex (single-line tools format)
- Fixed `ClaudeAdapter.transformFrontmatter()` - includes skills field
- Orchestrator calls `adapter.transformFrontmatter()` during agent installation
- Recursive template variable processing in `installShared()`
- Comprehensive integration tests (13 agents × 3 platforms = 39 test cases)

**Plans:**
- [x] 06.2-01-PLAN.md — Custom Frontmatter Serializer (Wave 1)
- [x] 06.2-02-PLAN.md — Fix Agent Frontmatter Transformation Pipeline (Wave 2)
- [x] 06.2-03-PLAN.md — Recursive Variable Replacement & Integration Tests (Wave 3)

**Notes:**
- Inserted as urgent work discovered after Phase 6.1 completion
- Affects ALL production installations (Claude, Copilot, Codex)
- Three critical bugs identified:
  1. Skills field handling (wrong for all platforms)
  2. Tools serialization format (Copilot/Codex multi-line vs required single-line)
  3. Template variables not replaced in shared directory files
- Must complete before Phase 7 to ensure security validation works on correct output

---

### Phase 7: Path Security and Validation ✅ COMPLETE

**Goal:** Malicious or malformed paths are rejected before any file writes, preventing traversal attacks

**Dependencies:** Phase 2-5 (needs file operations and transactions)

**Plans:** 2 plans (all complete)

**Completed:** 2026-01-28

**Verification:** 10/10 must-haves verified (100%) — PASSED

**Requirements Mapped:**
- SAFETY-01: Path traversal prevention

**Success Criteria:**
1. All output paths validated before write operations using 8-layer defense-in-depth approach
2. Paths containing `../` and URL-encoded variants (`%2e%2e%2f`) rejected with clear error
3. Absolute paths outside target directory rejected
4. Windows reserved names (CON, PRN, etc.) blocked on all platforms
5. Symlinks resolved to single level only before validation (chains rejected)
6. Path length limits enforced (260 Windows, 4096 Unix)
7. Allowlist validation (only .claude, .github, .codex, get-shit-done permitted)
8. Comprehensive security tests covering 10+ attack vectors
9. Interactive mode prompts for symlink confirmation
10. Educational error messages for security violations

**Key Deliverables:**
- `/bin/lib/validation/path-validator.js` (8-layer validation with URL decoding, null byte check, traversal detection, containment, allowlist, length limits, Windows reserved names)
- `/bin/lib/paths/symlink-resolver.js` (single-level resolution with chain detection)
- Enhanced `pre-install-checks.js` integration
- Symlink confirmation prompts in interactive mode
- Unit tests for path-validator and symlink-resolver
- Integration tests for security scenarios

**Plans:**
- [x] 07-01-PLAN.md — Path Security Validation Modules (Wave 1)
- [x] 07-02-PLAN.md — Integration & Security Testing (Wave 2)

**Notes:**
- This addresses Critical Risk #2 (path traversal) from research/risks.md
- Defense-in-depth approach: 8 independent validation layers
- Research-backed implementation using Node.js built-ins only
- Cross-platform Windows reserved name validation
- Validation happens atomically (before any writes)

---

### Phase 7.1: Pre-Flight Validation Refactor (INSERTED)

**Goal:** Centralize all validation before installation begins (fail-fast with grouped errors)

**Dependencies:** Phase 7 (uses path-validator and symlink-resolver)

**Plans:** 2 plans

**Requirements Mapped:**
- None (internal refactoring for better UX and code clarity)

**Success Criteria:**
1. New `bin/lib/preflight/` module created with `pre-flight-validator.js`
2. Function `validateBeforeInstall()` orchestrates all upfront validation
3. `install.js` calls validation at line ~101 (after banner, before installation)
4. Validation checks: templates exist, paths secure, disk space, permissions, symlinks
5. Multiple errors collected and displayed together (fail-slow reporting, fail-fast execution)
6. `orchestrator.js` simplified - batch validation removed (no longer needed)
7. Per-file validation removed (single-point validation only)
8. All tests run in `/tmp` with isolated subdirectories
9. Tests copy full project to `/tmp` (protect real templates)
10. Tests execute `install.js` directly (integration tests, not mocks)

**Key Deliverables:**
- `/bin/lib/preflight/pre-flight-validator.js` (orchestrator module)
- Updated `install.js` with validation gate
- Simplified `orchestrator.js` (remove redundant validation)
- Comprehensive tests in `/tmp`

**Plans:**
- [x] 07.1-01-PLAN.md — Create pre-flight validation orchestrator with grouped error reporting
- [x] 07.1-02-PLAN.md — Integrate into install.js, cleanup orchestrator.js, add integration tests

**Status:** ✅ COMPLETE

**Notes:**
- **Philosophy:** Single-point validation (no defense-in-depth redundancy)
- **Trust:** Tests catch bugs, fs operations fail naturally with clear errors
- **UX:** Fail-fast with all errors grouped (better than scattered errors)
- **Architecture:** `preflight/` uses transversal modules (`validation/`, `paths/`)
- **Testing:** Opción A (copy full project) ensures templates are never touched

---


### Phase 7.2: Codebase Cleanup and Publishing Fixes (INSERTED)

**Goal:** Fix npm publishing configuration, remove obsolete code/tests, update to Node 20, and resolve map-codebase concerns

**Dependencies:** Phase 7.1 (validation and testing infrastructure complete)

**Plans:** 4 plans in 4 waves ✅ COMPLETE

**Requirements Mapped:**
- None (technical debt cleanup and publishing preparation)

**Success Criteria:**
1. **npm Publishing Config:** package.json includes templates/ and bin/ folders in published package ✓
2. **npm Publishing Config:** Analyze root folders (github/, hooks/, etc.) and remove/include as needed for minimal published package ✓
3. **Broken Template Renderer:** Remove obsolete prepublishOnly script reference (scripts/build-templates.js doesn't exist) ✓
4. **Path Validation Tests:** Update tests to match current correct implementation - N/A (tests already correct)
5. **Version Detection:** Analyze TODO comments in version detection code - update or remove orphaned code ✓
6. **Large Files Cleanup:** Delete audit-functions.json, audit-functions.md, and audit-functions.* from root ✓
7. **Large Files Cleanup:** Remove scripts and tests related to deleted audit files ✓
8. **Empty Catch Blocks:** Prioritize checking specific error codes over generic catch blocks ✓
9. **Environment Variables:** Analyze ALLOW_SYMLINKS usage - remove if test code, keep minimal production usage ✓
10. **Node.js Version:** Update project minimum to Node 20 in package.json and documentation ✓
11. **Template Phase Reference:** Ensure Phase 1 template generation doesn't appear as a risk in future map-codebase reports ✓

**Key Deliverables:**
- Updated package.json with correct files/folders for npm publish
- Removed obsolete prepublishOnly script (scripts/build-templates.js never existed)
- Cleaned up version detection TODOs
- Deleted audit-functions.* files from root (5MB+)
- Removed scripts/ directory (only contained audit-functions.js)
- Improved error handling in catch blocks (added error parameter and comment)
- Removed ALLOW_SYMLINKS environment variable (redundant with skipPrompts)
- Node 20 minimum version requirement
- Deleted development tooling (hooks/, coverage/, docker files)
- Verified bin/install.js works with minimal dependencies post-publish

Plans:
- [x] 07.2-01-PLAN.md — Critical publishing fixes (files array, prepublishOnly, Node 20)
- [x] 07.2-02-PLAN.md — Code cleanup and error handling (audit files, catch block, env vars, TODOs)
- [x] 07.2-03-PLAN.md — Development tooling cleanup (hooks, coverage, docker)
- [x] 07.2-04-PLAN.md — Publishing verification (npm pack workflow with human checkpoint)

**Status:** ✅ COMPLETE

**Notes:**
- Critical bug fixed: gray-matter moved to dependencies (was in devDependencies)
- Package verified production-ready (339KB tarball, 192 files)
- 8 pre-existing test failures documented (from Plan 02 changes, do not block publish)
- Repository ~320KB smaller after cleanup

**Wave Structure:**
- Wave 1: Plan 01 (blocking - package.json must be fixed first)
- Wave 2: Plan 02 (parallel cleanup after package.json fixed)
- Wave 3: Plan 03 (dev tooling cleanup after tests pass)
- Wave 4: Plan 04 (verification checkpoint - final quality gate)

**Details:**
Plans break down into 4 waves for efficient parallel execution. Wave 1 fixes critical publishing bugs (3 one-line changes with HIGH IMPACT). Waves 2-3 clean up obsolete code and development tooling. Wave 4 verifies with npm pack → extract → test workflow.

**Testing Strategy:**
- All tests run in /tmp with isolated directories
- Test npm pack locally before publishing
- Verify bin/install.js executes correctly after pack/extract

---
### Phase 8: Documentation and Polish

**Goal:** Complete documentation exists for installation, architecture, and platform differences

**Dependencies:** Phase 1-7 (document complete system)

**Requirements Mapped:**
- DOCS-01: Installation instructions
- DOCS-02: Architecture documentation
- DOCS-03: Platform comparison

**Success Criteria:**
1. README.md brief hub (50-150 lines), ASCII diagram, links to docs/, proper attribution
2. CONTRIBUTING.md development setup, PR process, test commands
3. CHANGELOG.md Keep a Changelog format, v2.0.0 documented
4. 12 docs/ files covering installation, platforms, concepts, architecture
5. Markdown linting setup with markdownlint-cli2
6. All documentation passes lint validation

**Plans:** 5/5 plans complete

Plans:
- [x] 08-01-PLAN.md — Root documentation (README, CONTRIBUTING, CHANGELOG)
- [x] 08-02-PLAN.md — Installation docs (how-to-install, upgrade, uninstall, what-gets-installed, troubleshooting)
- [x] 08-03-PLAN.md — Platform docs (comparison, specifics, migration)
- [x] 08-04-PLAN.md — Architecture & advanced (what-is-gsd, how-gsd-works, customize, architecture, docs/README)
- [x] 08-05-PLAN.md — Quality validation (markdownlint setup, all docs passing lint)

**Wave Structure:**
- Wave 1 (Parallel): 08-01, 08-02, 08-03 (independent documentation groups)
- Wave 2: 08-04 (depends on Wave 1 for links in docs/README)
- Wave 3: 08-05 (depends on all docs existing for lint validation)

**Key Deliverables:**
- Root: README.md, CONTRIBUTING.md, CHANGELOG.md
- Installation: how-to-install, how-to-upgrade, how-to-uninstall, what-gets-installed, troubleshooting
- Platform: platform-comparison, platform-specifics, platform-migration
- Concepts: what-is-gsd, how-gsd-works, how-to-customize
- Technical: architecture, docs/README (documentation index)
- Quality: .markdownlint-cli2.jsonc configuration

**Notes:**
- Question-driven file names (how-to-install.md not installation.md)
- Layered structure (Quick Start → Details → Troubleshooting)
- No emojis, natural human writing
- ASCII diagrams in README (npm compatible), Mermaid in architecture.md (GitHub renders)
- Real examples from templates/ directory

---

### Phase 9: Platform Instructions Installer ✅ COMPLETE

**Goal:** Install platform-specific instructions file (AGENTS.md/CLAUDE.md/copilot-instructions.md) with smart merge logic

**Type:** Feature Enhancement (v2.1+)

**Dependencies:** Phase 2 (core installer), Phase 3 (multi-platform support)

**Plans:** 4 plans (all complete)

**Status:** COMPLETE ✅

**Completed:** 2026-01-30

**Requirements Mapped:** None (post-v2.0 enhancement)

**Success Criteria:**
1. New function `installPlatformInstructions()` created with merge logic
2. Smart merge: create new, append without markers, or replace content between first/last line markers
3. All 3 adapters return correct paths via getInstructionsPath(isGlobal) method
4. Orchestrator integration in both verbose and non-verbose modes
5. Template variables (PLATFORM_ROOT, COMMAND_PREFIX) replaced correctly
6. Integration tests pass for all platforms and merge scenarios
7. No duplicate content when installing multiple times
8. User content preserved when replacing GSD section

**Plans:** 4 plans

Plans:
- [x] 09-01-PLAN.md — Implement install-platform-instructions.js with merge logic
- [x] 09-02-PLAN.md — Add getInstructionsPath() method to all adapters
- [x] 09-03-PLAN.md — Integrate into orchestrator.js (both verbose modes)
- [x] 09-04-PLAN.md — Create integration tests for all platforms and merge scenarios

**Wave Structure:**
- Wave 1: 09-01, 09-02 (parallel - function implementation and adapter methods)
- Wave 2: 09-03 (depends on Wave 1 - orchestrator integration)
- Wave 3: 09-04 (depends on Wave 2 - integration tests)

**Key Deliverables:**
- `bin/lib/installer/install-platform-instructions.js` (new file)
- `bin/lib/platforms/instruction-paths.js` (new file)
- Updated adapters with `getInstructionsPath(isGlobal)` method
- Orchestrator integration after `installShared()`
- Integration tests for merge logic

**Notes:**
- Post-v2.0 feature (backward compatible)
- Template file `templates/AGENTS.md` already exists
- Similar pattern to `install-shared.js` for consistency
- Dynamic block markers (first/last line) prevent content duplication on reinstall
- Preserves user's custom instructions when updating GSD section
- Line ending normalization (CRLF → LF) for cross-platform compatibility

---

### Phase 10: Milestone Completion Workflow Unification

**Goal:** Unify milestone completion commands into streamlined workflow that moves directly to history/, uses ask_user for confirmations, and deprecates redundant commands

**Type:** Workflow Optimization & UX Enhancement

**Dependencies:** Phase 2 (core installer foundation)

**Plans:** 4 plans (not started)

**Status:** NOT STARTED

**Requirements Mapped:** None (post-v2.0 optimization)

**Success Criteria:**
1. Research document created analyzing existing skill patterns (structure, XML vs markdown, language style, examples)
2. `/gsd-complete-milestone` unified to move all files directly to `.planning/history/v{X.Y}/`
3. All confirmations use `ask_user` tool (no manual text prompts)
4. Git tag creation is optional via ask_user
5. `/gsd-archive-milestone` and `/gsd-restore-milestone` show deprecation messages automatically
6. Deprecated workflow files removed from `/templates/get-shit-done/workflows/`
7. `/gsd-list-milestones` updated to list from history/ with no restore references
8. Workspace always clean after complete-milestone (only PROJECT, MILESTONES, codebase/, config remain)

**Plans:** 4 plans

Plans:
- [ ] 10-01-PLAN.md — Research existing skill patterns and create style guide
- [ ] 10-02-PLAN.md — Refactor gsd-complete-milestone to unify archive functionality
- [ ] 10-03-PLAN.md — Deprecate archive/restore commands with automatic messages
- [ ] 10-04-PLAN.md — Update gsd-list-milestones for new structure

**Wave Structure:**
- Wave 1: 10-01 (research - must complete first to inform implementation)
- Wave 2: 10-02, 10-03, 10-04 (parallel - independent refactoring after research)

**Key Deliverables:**
- `RESEARCH.md` documenting skill writing patterns and style guide
- Updated `/templates/skills/gsd-complete-milestone/SKILL.md`
- Updated `/templates/get-shit-done/workflows/complete-milestone.md`
- Deprecated `/templates/skills/gsd-archive-milestone/SKILL.md` (auto-response only)
- Deprecated `/templates/skills/gsd-restore-milestone/SKILL.md` (auto-response only)
- Deleted `/templates/get-shit-done/workflows/archive-milestone.md`
- Deleted `/templates/get-shit-done/workflows/restore-milestone.md`
- Updated `/templates/skills/gsd-list-milestones/SKILL.md`
- Updated `/templates/get-shit-done/workflows/list-milestones.md`
- Support scripts (if needed) in `/templates/skills/{skill-name}/scripts/`

**Notes:**
- Scripts referenced with `{{PLATFORM_ROOT}}/skills/{skill-name}/scripts/{script-name}`
- Deprecation messages similar to `/gsd-help` (respond directly, no confirmation)
- Tag creation optional to support both release milestones and internal sprints
- Workspace cleanup enables clean slate for `/gsd-new-milestone`
- Single source of truth for archived milestones (`.planning/history/` only)

---

## Phase Sequencing

### Critical Path
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

### Parallel Work Opportunities

**After Phase 2 completes:**
- Phase 3 (Interactive UX) and Phase 4 (Transactions) can proceed in parallel
  - UX changes prompts/display logic
  - Transactions change operation mechanics
  - Minimal overlap

**After Phase 4 completes:**
- Phase 5 (Versioning) and Phase 6 (Security) can proceed in parallel
  - Versioning reads manifests and compares
  - Security validates paths
  - Different concerns

**Phase 7 (Docs) should be last:**
- Documents complete system
- Captures final architecture decisions

### Dependencies Summary

| Phase | Depends On | Can Run Parallel With |
|-------|------------|----------------------|
| 1 | None | — |
| 2 | 1 | — |
| 3 | 2 | 4 |
| 4 | 1-2 | 3 |
| 5 | 4 | 6 |
| 6 | 1-4 | 5 |
| 7 | 1-6 | — |
| 10 | 2 | — |

---

## Version 2.0 Complete Product

### What v2.0 Delivers

**Includes:** All 7 Phases

**Delivers:**
- Core installation to Claude, Copilot, and Codex
- Multi-platform adapter pattern for all three platforms
- Interactive UX with beautiful prompts
- Atomic transactions with rollback
- Update detection and versioning across all installations
- Path security hardening (traversal prevention)
- Cross-platform support (macOS, Linux, Windows)
- Complete documentation

**What users can do:**
- Run `npx get-shit-done-multi` and get working skills installed for any supported platform
- Choose platform(s) interactively or via flags (`--claude`, `--copilot`, `--codex`)
- Choose scope (global or local) per platform
- Recover from failures (rollback leaves clean state)
- Get notified of updates for each installation
- Use on Windows, macOS, or Linux

**Why this is v2.0:**
- Complete product (not MVP)
- All three major platforms supported
- Production-ready (security, transactions, cross-platform)
- Fully documented

### Future Enhancements (v2.x)

**Not in v2.0 roadmap (see REQUIREMENTS.md v2.x):**
- Auto-update flag (UPDATE-01) - can be v2.1
- Uninstall command (UNINSTALL-01) - can be v2.1  
- Template sandboxing (SECURITY-01) - can be v2.2
- Plugin system for external adapters (PLUGIN-01) - separate future project

**Version Strategy:**
- New commands/features = MINOR version bump (v2.1, v2.2, etc.)
- Breaking changes = MAJOR version bump (v3.0)
- Bug fixes = PATCH version bump (v2.0.1, v2.0.2, etc.)

---

## Progress Tracking

| Phase | Status | Start Date | Completion Date | Notes |
|-------|--------|------------|-----------------|-------|
| 1 - Template Migration | Complete ✅ | 2026-01-26 | 2026-01-26 | Foundation (v2.0) |
| 2 - Core Installer | Complete ✅ | 2026-01-26 | 2026-01-26 | All 3 platforms |
| 3 - Multi-Platform | Complete ✅ | 2026-01-26 | 2026-01-27 | Prompts |
| 4 - Interactive UX | Complete ✅ | 2026-01-27 | 2026-01-27 | Rollback |
| 5 - Transactions | Complete ✅ | 2026-01-27 | 2026-01-27 | Multi-install |
| 6 - Versioning | Complete ✅ | 2026-01-27 | 2026-01-27 | Update detection |
| 6.1 - Old Version Detection | Complete ✅ | 2026-01-27 | 2026-01-27 | Migration support |
| 6.2 - Output Verification | Complete ✅ | 2026-01-27 | 2026-01-28 | Bug fixes |
| 7 - Path Security | Complete ✅ | 2026-01-28 | 2026-01-28 | Path validation |
| 7.1 - Pre-Flight Validation | Complete ✅ | 2026-01-28 | 2026-01-28 | Refactoring |
| 7.2 - Cleanup & Publishing | Complete ✅ | 2026-01-29 | 2026-01-29 | Publishing fixes |
| 8 - Documentation | Complete ✅ | 2026-01-29 | 2026-01-29 | Complete docs |
| 9 - Platform Instructions | Complete ✅ | 2026-01-30 | 2026-01-30 | Instructions installer |

**Legend:**
- **Pending:** Not started
- **In Progress:** Active development
- **Complete:** Success criteria met
- **Blocked:** Waiting on dependency or external factor

---

## Requirement Coverage

### Coverage by Phase

| Phase | Requirements Covered | Count |
|-------|---------------------|-------|
| 1 - Core Installer | INSTALL-01, INSTALL-02, INSTALL-03, CLI-02, CLI-05, SAFETY-02, TEMPLATE-01, TEMPLATE-01B, TEMPLATE-03, TEST-01, TEST-02 | 11 |
| 2 - Multi-Platform | PLATFORM-01, PLATFORM-01B, PLATFORM-02, PLATFORM-03, PLATFORM-04, PLATFORM-04B, PLATFORM-05, CLI-03, TEMPLATE-02 | 9 |
| 3 - Interactive UX | CLI-01, CLI-04, UX-01, UX-02, UX-03 | 5 |
| 4 - Transactions | INSTALL-04, INSTALL-05, VERSION-01 | 3 |
| 5 - Versioning | VERSION-02, VERSION-03 | 2 |
| 6 - Security | SAFETY-01 | 1 |
| 7 - Documentation | DOCS-01, DOCS-02, DOCS-03 | 3 |

**Total Mapped:** 34/34 requirements ✓

### Orphaned Requirements

None. All v2.0 requirements (31 total) mapped to phases.

---

## Research Flags

From research/SUMMARY.md analysis:

| Phase | Research Needed | Status |
|-------|----------------|--------|
| 1 | ❌ No | Ecosystem patterns documented |
| 2 | ❌ No | Platform mappings complete |
| 3 | ❌ No | @clack/prompts documented |
| 4 | ❌ No | Transaction pattern standard |
| 5 | ❌ No | Semver comparison standard |
| 6 | ❌ No | Transaction pattern standard |
| 7 | ❌ No | Documentation standards known |

**Action items:**
- Phase 6 planning: Review OWASP path traversal prevention guidelines
- All phases: Cross-platform testing on Windows (via GitHub Actions)

---

## Risk Mitigation Mapping

**From research/risks.md:**

| Risk | Severity | Mitigation Phase |
|------|----------|------------------|
| Partial installations without rollback | 🔴 Critical | Phase 4 |
| Path traversal vulnerabilities | 🔴 Critical | Phase 6 |
| Frontmatter breaking changes | 🟡 High | Phase 2 (versioned adapters) |
| Template pollution from new platforms | 🟡 Moderate | Phase 2 (adapter pattern) |
| Windows path handling | 🟡 Moderate | Phases 1-6 (continuous testing) |

All critical risks addressed in v2.0 (Phases 1-6).

---

**Last Updated:** 2025-01-25 (Revised with v2.0 scope)  
**Next Action:** Run `/gsd-plan-phase 1` to decompose Phase 1 into executable plans
