# Project Roadmap

**Project:** get-shit-done-multi  
**Milestone:** v2.0 — Complete Multi-Platform Installer  
**Created:** 2025-01-25  
**Status:** Phase 1 (Planning)

---

## Overview

This roadmap delivers a **complete template-based installer** that deploys AI CLI skills and agents to Claude Code, GitHub Copilot CLI, and Codex CLI. Users run `npx get-shit-done-multi`, answer interactive prompts, and get working skills installed atomically with rollback on failure.

**Approach:** Build foundation with single platform first (validate architecture), add multi-platform support with all three platforms (Claude, Copilot, Codex), enhance UX (interactive prompts), add reliability (transactions + versioning), then harden for production (security + cross-platform), and document everything.

**Version Strategy:** Initial release is v2.0 (complete product). Future versions follow SemVer: new commands = MINOR, breaking changes = MAJOR.

**Coverage:** 31 v2.0 requirements mapped across 7 phases

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

### Phase 1: Core Installer Foundation

**Goal:** User can install get-shit-done skills to Claude Code via `npx get-shit-done-multi --claude`

**Dependencies:** None (foundation)

**Plans:** 3 plans

**Requirements Mapped:**
- INSTALL-01: NPX entry point (version 2.0.0)
- INSTALL-02: File system operations
- INSTALL-03: Template rendering (copy from `.github/` and convert)
- CLI-02: Platform selection flags (`--claude`)
- CLI-05: Help and version flags
- SAFETY-02: Path normalization
- TEMPLATE-01: Use `.github/skills/` and `.github/agents/` as source
- TEMPLATE-01B: Convert to templates with {{VARIABLES}}
- TEMPLATE-03: Template variables
- TEST-01: Testing isolation
- TEST-02: Test cleanup

**Success Criteria:**
1. User runs `npx get-shit-done-multi --claude` and skills install to `~/.claude/skills/gsd-*/`
2. All 29 skills from `.github/skills/` converted to templates and installed
3. All 13 agents from `.github/agents/` converted to templates and installed
4. Shared directory (`get-shit-done/`) copies to `.claude/get-shit-done/` with manifest template
5. Template variables (e.g., `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`) replaced correctly in output files
6. Skill structure: `.claude/skills/gsd-<name>/SKILL.md` (directory-based)
7. Installation completes in <30 seconds for typical setup
8. `--help` and `--version` flags show correct information
9. Version displays as 2.0.0

**Key Deliverables:**
- `/bin/install.js` (entry point with shebang)
- `/bin/lib/io/file-operations.js` (copy, create directories)
- `/bin/lib/rendering/template-renderer.js` (string replacement)
- `/bin/lib/paths/path-resolver.js` (normalization, validation)
- `/templates/skills/gsd-*/SKILL.md` (29 skills copied from `.github/skills/` and converted)
- `/templates/agents/gsd-*.agent.md` (13 agents copied from `.github/agents/` and converted)
- `/get-shit-done/.gsd-install-manifest.json` (template)
- Basic error handling and logging

**Plans:**
- [ ] 01-01-PLAN.md — Foundation & Core Modules (Wave 1)
- [ ] 01-02-PLAN.md — Templates, CLI & Installation Orchestrator (Wave 2)
- [ ] 01-03-PLAN.md — Integration Testing & Verification (Wave 3)

**Notes:**
- Keep it simple: no adapter abstraction yet (validate mechanics first)
- No rollback yet (comes in Phase 4)
- No interactive prompts yet (comes in Phase 3)
- Initial version is 2.0.0

---

### Phase 2: Multi-Platform Support with All Three Platforms

**Goal:** User can install to Claude, Copilot, OR Codex via `--claude`, `--copilot`, or `--codex` flags, with correct platform-specific transformations

**Dependencies:** Phase 1 (core installer must work)

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

**Notes:**
- This validates the adapter pattern with all three platforms
- Platform detection checks for existing GSD installations, not CLI presence
- Binary detection (`copilot`, `claude`, `codex`) recommends which platforms to install

---

### Phase 3: Interactive CLI with Beautiful UX

**Goal:** User runs `npx get-shit-done-multi` (no flags), sees beautiful interactive prompts, selects platform and skills, confirms installation

**Dependencies:** Phase 2 (multi-platform support needed for selection)

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
6. User multi-selects skills/agents to install
7. User confirms installation before any file writes
8. Progress spinner shows during file operations
9. Success message shows next steps ("Run /gsd-new-project to start")
10. Errors show actionable guidance (not generic "failed")

**Key Deliverables:**
- `/bin/lib/prompts/interactive-prompts.js` (clack/prompts integration)
- `/bin/lib/prompts/intro-outro.js` (welcome/completion messages)
- Enhanced error handling with specific messages
- Progress indicators during installation
- Updated `/bin/install.js` to detect no flags → interactive mode

**Notes:**
- This is the primary UX for manual installation (most common use case)
- Flags still work for automation (CI/CD)

---

### Phase 4: Atomic Transactions and Rollback

**Goal:** Installation fails mid-process → all completed operations rollback, leaving no partial state

**Dependencies:** Phase 1-2 (needs file operations and adapters)

**Requirements Mapped:**
- INSTALL-04: Atomic operations with rollback
- INSTALL-05: Pre-installation validation
- VERSION-01: Installation manifest

**Success Criteria:**
1. Installer tracks every file write and directory creation
2. On failure (permission denied, disk full, etc.), rollback undoes all operations in reverse order
3. User is left with clean state (either fully installed or nothing changed)
4. Pre-installation checks detect problems before any writes (disk space, permissions, conflicts)
5. Manifest written to `/get-shit-done/.gsd-install-manifest.json` in each installation path after successful installation
6. Manifest includes: version (2.0.0), timestamp, installed files, platform, scope (global/local)

**Key Deliverables:**
- `/bin/lib/io/transaction.js` (InstallTransaction class)
- `/bin/lib/io/operations.js` (WriteFile, CreateDir operations with undo)
- `/bin/lib/validation/pre-install-checks.js` (disk space, permissions)
- `/bin/lib/validation/conflict-detection.js` (check existing files)
- Installation manifest generation

**Notes:**
- This addresses Critical Risk #1 (partial installations) from research/risks.md
- Transaction pattern: track operations → execute → rollback on error

---

### Phase 5: Update Detection and Versioning

**Goal:** User re-runs installer → sees installed version, gets prompted if update available, can upgrade

**Dependencies:** Phase 4 (needs installation manifest)

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

**Notes:**
- Uses semver for comparison (handles major/minor/patch)
- Update = re-install (no incremental updates)

---

### Phase 6: Path Security and Validation

**Goal:** Malicious or malformed paths are rejected before any file writes, preventing traversal attacks

**Dependencies:** Phase 1-4 (needs file operations and transactions)

**Requirements Mapped:**
- SAFETY-01: Path traversal prevention

**Success Criteria:**
1. All output paths validated before write operations
2. Paths containing `../` rejected with clear error
3. Absolute paths outside target directory rejected
4. Symlinks resolved before validation (prevent symlink bypass)
5. Validation integrated into transaction system (happens before write, not after)

**Key Deliverables:**
- `/bin/lib/validation/path-validator.js` (traversal detection)
- `/bin/lib/paths/symlink-resolver.js` (resolve before validation)
- Security tests for common attack vectors
- Integration with InstallTransaction

**Notes:**
- This addresses Critical Risk #2 (path traversal) from research/risks.md
- Validation must happen atomically (before any writes)

---

### Phase 7: Documentation and Polish

**Goal:** Complete documentation exists for installation, architecture, and platform differences

**Dependencies:** Phase 1-6 (document complete system)

**Requirements Mapped:**
- DOCS-01: Installation instructions
- DOCS-02: Architecture documentation
- DOCS-03: Platform comparison

**Success Criteria:**
1. `/docs/installation.md` explains interactive and non-interactive modes with examples for all three platforms
2. `/docs/architecture.md` documents adapter pattern and module structure
3. `/docs/platform-differences.md` shows tool mapping table and frontmatter differences for Claude, Copilot, and Codex
4. Troubleshooting section covers common errors with solutions
5. README.md updated with quick start and links to detailed docs
6. All docs use lowercase filenames and English only

**Key Deliverables:**
- `/docs/installation.md` (usage guide)
- `/docs/architecture.md` (design documentation)
- `/docs/platform-differences.md` (platform comparison)
- Updated README.md
- Inline code comments for public APIs

**Notes:**
- Documentation uses lowercase filenames (English only) per project constraints
- Focus on user-facing docs (not internal implementation details)
- Root directory contains only README.md and CHANGELOG.md

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
| 1 - Core Installer | Pending | — | — | Foundation (v2.0) |
| 2 - Multi-Platform | Pending | — | — | All 3 platforms |
| 3 - Interactive UX | Pending | — | — | Prompts |
| 4 - Transactions | Pending | — | — | Rollback |
| 5 - Versioning | Pending | — | — | Multi-install |
| 6 - Security | Pending | — | — | Path validation |
| 7 - Documentation | Pending | — | — | Complete docs |

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
