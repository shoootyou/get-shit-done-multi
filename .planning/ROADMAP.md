# Project Roadmap

**Project:** get-shit-done-multi  
**Milestone:** v1.0 — Template-Based Multi-Platform Installer  
**Created:** 2025-01-25  
**Status:** Phase 1 (Planning)

---

## Overview

This roadmap delivers a **template-based installer** that deploys AI CLI skills and agents to Claude Code and GitHub Copilot CLI. Users run `npx get-shit-done-multi`, answer interactive prompts, and get working skills installed atomically with rollback on failure.

**Approach:** Build foundation with single platform first (validate architecture), add multi-platform support (validate adapter pattern), enhance UX (interactive prompts), add reliability (transactions + versioning), then harden for production (security + cross-platform).

**Coverage:** 29 v1 requirements mapped across 8 phases

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
- **Claude Code** (optional, detected via `~/.claude/`)
- **GitHub Copilot CLI** (optional, detected via `gh copilot --version`)

---

## Phases

### Phase 1: Core Installer Foundation

**Goal:** User can install get-shit-done skills to Claude Code via `npx get-shit-done-multi --claude`

**Dependencies:** None (foundation)

**Requirements Mapped:**
- INSTALL-01: NPX entry point
- INSTALL-02: File system operations
- INSTALL-03: Template rendering (basic string replacement)
- CLI-02: Platform selection flags (`--claude`)
- CLI-05: Help and version flags
- SAFETY-02: Path normalization
- TEMPLATE-01: Base templates
- TEMPLATE-03: Template variables

**Success Criteria:**
1. User runs `npx get-shit-done-multi --claude` and skills install to `~/.claude/commands/gsd/`
2. Shared directory (`get-shit-done/`) copies to `.claude/get-shit-done/`
3. Template variables (e.g., `{{PLATFORM_ROOT}}`) replaced correctly in output files
4. Installation completes in <30 seconds for typical setup
5. `--help` and `--version` flags show correct information

**Key Deliverables:**
- `/bin/install.js` (entry point with shebang)
- `/bin/lib/io/file-operations.js` (copy, create directories)
- `/bin/lib/rendering/template-renderer.js` (string replacement)
- `/bin/lib/paths/path-resolver.js` (normalization, validation)
- `/templates/base/` (shared skill templates)
- `/templates/platforms/claude/` (Claude-specific files)
- Basic error handling and logging

**Notes:**
- Keep it simple: no adapter abstraction yet (validate mechanics first)
- No rollback yet (comes in Phase 4)
- No interactive prompts yet (comes in Phase 3)

---

### Phase 2: Multi-Platform Support with Adapters

**Goal:** User can install to Claude OR Copilot via `--claude` or `--copilot` flags, with correct platform-specific transformations

**Dependencies:** Phase 1 (core installer must work)

**Requirements Mapped:**
- PLATFORM-01: Platform detection
- PLATFORM-02: Platform adapter interface
- PLATFORM-03: Claude Code adapter
- PLATFORM-04: GitHub Copilot adapter
- PLATFORM-05: Shared directory copy (per platform)
- CLI-03: Installation mode flags (`--local`, `--global`)
- TEMPLATE-02: Platform overlays

**Success Criteria:**
1. User runs `npx get-shit-done-multi --copilot` and skills install to `.github/skills/get-shit-done/`
2. Tool names transform correctly (Claude: `Read, Write, Bash` → Copilot: `read, edit, execute`)
3. Frontmatter transforms correctly (Copilot gets required metadata block, Claude doesn't)
4. File extensions differ per platform (`.md` for Claude, `.agent.md` for Copilot)
5. Path references rewrite per platform (`@~/.claude/...` vs `@.github/...`)
6. Both `--claude` and `--copilot` flags can be used simultaneously (install to both)

**Key Deliverables:**
- `/bin/lib/platforms/base-adapter.js` (adapter interface)
- `/bin/lib/platforms/claude-adapter.js` (Claude transformations)
- `/bin/lib/platforms/copilot-adapter.js` (Copilot transformations)
- `/bin/lib/platforms/detector.js` (detect installed platforms)
- `/bin/lib/platforms/registry.js` (adapter lookup)
- `/templates/platforms/copilot/` (GitHub-specific files)
- Updated rendering to use adapters for transformations

**Notes:**
- This validates the adapter pattern before adding more platforms
- Platform detection (auto-detect Claude/Copilot) prepares for Phase 3 interactive mode

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
2. Installer auto-detects installed platforms, shows which are available
3. User selects platform from menu (disabled options show "coming soon")
4. User multi-selects skills/agents to install
5. User confirms installation before any file writes
6. Progress spinner shows during file operations
7. Success message shows next steps ("Run /gsd:new-project to start")
8. Errors show actionable guidance (not generic "failed")

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
5. `.gsd-install-manifest.json` written after successful installation with: version, timestamp, installed files, platform

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
1. On re-run, installer reads `.gsd-install-manifest.json` to find installed version
2. Installer compares installed version vs current version using semver
3. If outdated, prompt user: "Update available (1.0.0 → 1.2.0). Update now? [Y/n]"
4. If user confirms, update proceeds (re-install with new version)
5. `--version` output shows installed version alongside current version if different

**Key Deliverables:**
- `/bin/lib/version/version-checker.js` (compare versions)
- `/bin/lib/version/manifest-reader.js` (read existing installation)
- Update prompts in interactive mode
- Version display in `--version` output

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

### Phase 7: Cross-Platform Path Handling

**Goal:** Installer works identically on macOS, Linux, and Windows with correct path separators and home directory resolution

**Dependencies:** Phase 1-2 (needs path utilities)

**Requirements Mapped:**
- SAFETY-02: Path normalization (extended for Windows)

**Success Criteria:**
1. Installer runs on Windows with PowerShell → correct path separators (`\` vs `/`)
2. Home directory resolves correctly on Windows (`%APPDATA%` or `%USERPROFILE%`)
3. Path operations use `path.join()` and `path.resolve()` (no string concatenation)
4. Case-insensitive filesystem handling (Windows) doesn't break installation
5. All paths display correctly in Windows console

**Key Deliverables:**
- Windows-specific path resolution in `/bin/lib/paths/path-resolver.js`
- Environment variable handling (cross-platform)
- Windows testing with GitHub Actions (Windows runner)
- Path normalization tests for all platforms

**Notes:**
- This addresses Moderate Risk #5 (Windows path handling) from research/risks.md
- Empirical testing required (can't fully validate on macOS/Linux)

---

### Phase 8: Documentation and Polish

**Goal:** Complete documentation exists for installation, architecture, and platform differences

**Dependencies:** Phase 1-7 (document complete system)

**Requirements Mapped:**
- DOCS-01: Installation instructions
- DOCS-02: Architecture documentation
- DOCS-03: Platform comparison

**Success Criteria:**
1. `/docs/installation.md` explains interactive and non-interactive modes with examples
2. `/docs/architecture.md` documents adapter pattern and module structure
3. `/docs/platform-differences.md` shows tool mapping table and frontmatter differences
4. Troubleshooting section covers common errors with solutions
5. README.md updated with quick start and links to detailed docs

**Key Deliverables:**
- `/docs/installation.md` (usage guide)
- `/docs/architecture.md` (design documentation)
- `/docs/platform-differences.md` (platform comparison)
- Updated README.md
- Inline code comments for public APIs

**Notes:**
- Documentation uses lowercase filenames (English only) per project constraints
- Focus on user-facing docs (not internal implementation details)

---

## Phase Sequencing

### Critical Path
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
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

**Phase 7 (Windows) can run parallel to Phase 5-6:**
- Testing-focused (not major feature work)
- May uncover bugs in earlier phases (feedback loop)

**Phase 8 (Docs) should be last:**
- Documents complete system
- Captures final architecture decisions

### Dependencies Summary

| Phase | Depends On | Can Run Parallel With |
|-------|------------|----------------------|
| 1 | None | — |
| 2 | 1 | — |
| 3 | 2 | 4 |
| 4 | 1-2 | 3 |
| 5 | 4 | 6, 7 |
| 6 | 1-4 | 5, 7 |
| 7 | 1-2 | 5, 6 |
| 8 | 1-7 | — |

---

## MVP Definition

### Minimum Viable Product (v1.0)

**Includes:** Phases 1-5

**Delivers:**
- Core installation to Claude and Copilot
- Multi-platform adapter pattern
- Interactive UX with beautiful prompts
- Atomic transactions with rollback
- Update detection and versioning

**What users can do:**
- Run `npx get-shit-done-multi` and get working skills installed
- Choose platform interactively or via flags
- Recover from failures (rollback leaves clean state)
- Get notified of updates

**Why this is MVP:**
- Addresses core value proposition (template-based installer)
- Mitigates Critical Risk #1 (partial installations)
- Provides excellent UX (interactive prompts)
- Enables version management (updates)

### Deferred to v1.5

**Includes:** Phases 6-7

**Delivers:**
- Path security hardening (traversal prevention)
- Windows testing and cross-platform polish

**Why deferred:**
- Security important but lower risk than partial installations
- Basic path validation exists in Phase 1 (extended in Phase 6)
- Windows support nice-to-have (most users on macOS/Linux)

### Deferred to v2.0

**Not in roadmap (see REQUIREMENTS.md v2):**
- Codex CLI support (CODEX-01)
- Plugin system for external adapters (PLUGIN-01)
- Advanced security (template sandboxing, signatures) (SECURITY-01)
- Auto-update flag (UPDATE-01)
- Uninstall command (UNINSTALL-01)

---

## Progress Tracking

| Phase | Status | Start Date | Completion Date | Notes |
|-------|--------|------------|-----------------|-------|
| 1 - Core Installer | Pending | — | — | Foundation |
| 2 - Multi-Platform | Pending | — | — | Adapters |
| 3 - Interactive UX | Pending | — | — | Prompts |
| 4 - Transactions | Pending | — | — | Rollback |
| 5 - Versioning | Pending | — | — | Updates |
| 6 - Security | Pending | — | — | v1.5 |
| 7 - Cross-Platform | Pending | — | — | v1.5 |
| 8 - Documentation | Pending | — | — | Polish |

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
| 1 - Core Installer | INSTALL-01, INSTALL-02, INSTALL-03, CLI-02, CLI-05, SAFETY-02, TEMPLATE-01, TEMPLATE-03 | 8 |
| 2 - Multi-Platform | PLATFORM-01, PLATFORM-02, PLATFORM-03, PLATFORM-04, PLATFORM-05, CLI-03, TEMPLATE-02 | 7 |
| 3 - Interactive UX | CLI-01, CLI-04, UX-01, UX-02, UX-03 | 5 |
| 4 - Transactions | INSTALL-04, INSTALL-05, VERSION-01 | 3 |
| 5 - Versioning | VERSION-02, VERSION-03 | 2 |
| 6 - Security | SAFETY-01 | 1 |
| 7 - Cross-Platform | (extends SAFETY-02) | 0 new |
| 8 - Documentation | DOCS-01, DOCS-02, DOCS-03 | 3 |

**Total Mapped:** 29/29 requirements ✓

### Orphaned Requirements

None. All v1 requirements mapped to phases.

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
| 6 | ⚠️ May need | OWASP path traversal guidance |
| 7 | ⚠️ Needs testing | Windows environment required |
| 8 | ❌ No | Documentation standards known |

**Action items:**
- Phase 6 planning: Review OWASP path traversal prevention guidelines
- Phase 7 execution: Set up Windows testing environment (GitHub Actions or local VM)

---

## Risk Mitigation Mapping

**From research/risks.md:**

| Risk | Severity | Mitigation Phase |
|------|----------|------------------|
| Partial installations without rollback | 🔴 Critical | Phase 4 |
| Path traversal vulnerabilities | 🔴 Critical | Phase 6 |
| Frontmatter breaking changes | 🟡 High | Phase 2 (versioned adapters) |
| Template pollution from new platforms | 🟡 Moderate | Phase 2 (adapter pattern) |
| Windows path handling | 🟡 Moderate | Phase 7 |

All critical risks addressed in v1.0 MVP (Phases 1-5 for Risk #1, Phase 6 deferred to v1.5).

---

**Last Updated:** 2025-01-25  
**Next Action:** Run `/gsd-plan-phase 1` to decompose Phase 1 into executable plans
