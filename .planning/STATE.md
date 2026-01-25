# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Specs in /specs/skills/ serve as single source of truth for GSD commands across 3 platforms (Copilot, Claude, Codex)
**Current focus:** Milestone v1.10.0 - Installation CLI Optimization with breaking changes

## Current Position

Milestone: v1.10.0 - Installation CLI Optimization
Phase: 5.1 of 11 (Codebase Architecture Optimization) — IN PROGRESS 🔄
Progress: [█████░░░░░░] 45% (5/11 phases complete, 2/8 plans in Phase 5.1)
Last activity: 2026-01-25 — Completed Plan 05.1-02 (Domain Migration)
Next: Plan 05.1-03 (Test Structure Unification)

**3 New Phases Inserted After Phase 5:**
- Phase 5.1: Codebase Architecture Optimization (4-5 days) ⚠️ CRITICAL - IN PROGRESS
- Phase 5.2: Codex Global Support & Path Unification (1-2 days)
- Phase 5.3: Future Integration Preparation & Validation (2-3 days)

**Phase 5.1 In Progress:**
- 2 plans executed (05.1-01, 05.1-02) ✓
- 10 tasks completed (5 from 01, 5 from 02), 50+ files migrated
- 18/18 must-haves verified (100%)
- Analysis tools installed: depcheck, madge, unimported, dependency-cruiser, npm-check-updates
- Baseline: 254 passing tests (16 suites), 100% pass rate
- Zero circular dependencies - clean architecture maintained
- 4 unused transitive dependencies identified (not removable - part of dependencies)
- All source files in dependency tree (no dead code)
- **Domain structure complete:**
  - `platforms/` - Claude, Copilot, Codex adapters + shared utilities
  - `configuration/` - Flags, paths, menu, routing (7 config modules)
  - `templating/` - Template engine, doc-generator
  - `installation/` - Reporter, colors, migrations, CLI detection
  - `testing/` - Test utilities + fixtures structure
- All code migrated and organized by feature/domain
- All import paths updated and verified (254 tests passing)
- Doc generator working in new location
- **Next:** Plan 05.1-03 (Test Structure Unification)

**Phase 5 Complete:**
- 2 plans executed (05-01, 05-02)
- 10 tasks completed, 9 files created/modified
- 12/12 must-haves verified (100%)
- 41 tests passing, 91.37% coverage
- Reporter infrastructure with boxen integration
- Install.js integrated with Reporter for clean output
- POSIX-compliant exit codes (0=success, 1=any failure)
- Multi-platform error resilience
- **Next:** Phase 6 (Uninstall Implementation)

**Phase 4 Complete:**
- 2 plans executed (04-01, 04-02)
- 7 tasks completed, 8 files modified (2 created, 6 modified)
- 11/11 must-haves verified (100%)
- 84 tests passing, 98.8% coverage
- Cross-platform path resolution working (Windows/macOS/Linux/WSL)
- Conflict detection and auto-cleanup implemented
- Old Claude path migration warning added
- Config-dir flag support enabled

**Milestone Context:** Redesign installation CLI from implicit platform assumptions (`--local` = Claude) to explicit platform selection (`--claude --local`) with multi-platform support and interactive menu. **BREAKING CHANGE**: Hard removal of old flags (`--local`, `--global`, `--codex-global`).

**NEW: Architecture Optimization Added** - 3 phases inserted before Uninstall to restructure codebase, implement Codex global, and prepare for future AI tool integrations (GPT-4All, Mistral, Gemini).

**Key Changes:**
- Platform flags: `--claude`, `--copilot`, `--codex`, `--all`
- Scope modifiers: `--global`, `--local` (combine with platform flags)
- Interactive menu with checkbox multi-select ✅ COMPLETE
- **Path resolution updated:** Claude global now `~/.claude/` (breaking change) ✅ COMPLETE
- **Conflict resolution:** Auto-cleanup GSD content, old path detection ✅ COMPLETE
- **Config-dir support:** Custom installation directories ✅ COMPLETE
- Uninstall.js implementation (P0, not deferred)
- Codex local only (global shows warning)
- Hard removal of old flags (no backward compatibility)

Progress: [█████░░░░░░] 45% (5/11 phases complete)

## Performance Metrics

**Milestone Timeline:**
- Start date: 2026-01-24 (Phase 1 execution started)
- Estimated duration: 3-4 weeks (17-23 days)
- Target completion: TBD

**Phase Breakdown:**

| Phase | Name | Estimate | Status |
|-------|------|----------|--------|
| 1 | Dependency Setup | 1 day | **Complete** ✓ (2 min) |
| 2 | Flag System Redesign | 3-4 days | **Complete** ✓ (15 min) |
| 3 | Interactive Menu | 2-3 days | **Complete** ✓ (45 min) |
| 4 | Platform Paths | 2-3 days | **Complete** ✓ (Plan 1: 4 min, Plan 2: TBD) |
| 5 | Message Optimization | 2 days | **Complete** ✓ (Plan 1: 4 min, Plan 2: 5 min) |
| 5.1 | Architecture Optimization | 4-5 days | **Next** 🔄 ⚠️ CRITICAL |
| 5.2 | Codex Global & Path Unification | 1-2 days | Pending |
| 5.3 | Future Integration Prep | 2-3 days | Pending |
| 6 | Uninstall Implementation | 2-3 days | Pending |
| 7 | Testing & QA | 3-4 days | Pending |
| 8 | Documentation & Migration | 2-3 days | Pending |

**Coverage:**
- Total requirements: 44 (29 original + 15 new architecture)
- Requirements mapped: 44/44 (100%)
- Orphaned requirements: 0

*Metrics will be updated after each phase completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions for v1.10.0:

- **[ROADMAP]** Use Commander.js v14+ for argument parsing (zero dependencies, clean API, built-in validation)
- **[ROADMAP]** Use Prompts v2.4+ for interactive menus (lightweight, beautiful UI, checkbox support)
- **[ROADMAP]** Hard removal of old flags (no soft deprecation, forces migration)
- **[ROADMAP]** Codex local only in v1.10.0 (global can be added in v1.11.0 if needed)
- **[ROADMAP]** Extract routing to module (replace 100+ line if/else with clean router)
- **[ROADMAP]** Message manager module (context-aware output, shared between install/uninstall)
- **[ROADMAP]** Shared code for install/uninstall (DRY principle, consistent behavior)
- **[ROADMAP]** Focus on unit/integration tests (less brittle than E2E, faster feedback)
- **[ROADMAP]** Simple migration guide (focus on flag transition only, avoid complexity)
- **[ROADMAP]** Two-section CHANGELOG (separate user-facing and contributor-facing changes)
- **[01-01]** Use exact version 14.0.2 for Commander.js (not caret range) for strictest version control
- **[01-01]** Commander.js promoted from transitive to direct dependency for stability
- **[01-01]** Functional verification (instantiation + basic operations) for dependency validation
- **[02-01]** Context-aware old flag detection (--local/--global checked based on platform flag presence)
- **[02-01]** Same flag names for old and new system with different semantics based on context
- **[02-01]** Lenient deduplication (warn) vs strict conflicts (error) for better UX
- **[02-01]** needsMenu flag pattern for loose coupling between parser and menu system
- **[02-03]** Commander.js boolean flags are idempotent - duplicate flags handled gracefully without custom logic
- **[02-03]** Jest configuration supports both unit tests (bin/lib/*.test.js) and integration tests (__tests__/*.test.js)
- **[02-03]** 100% test coverage target for flag system modules (exceeds >80% requirement)
- **[03-01]** Array-building approach for conditional prompts questions (cleaner than type function)
- **[03-01]** Dual validation (`min: 1` + `validate` function) for better UX on empty selection
- **[03-01]** Scope null handling: flag parser returns null when no scope flag, menu knows to ask
- **[03-01]** --local/--global alone are NEW flags (scope presets), only --codex-global is truly old
- **[04-01]** Breaking change: Claude global path from ~/Library/Application Support/Claude to ~/.claude/
- **[04-01]** Codex global installation not supported (throws clear error)
- **[04-01]** configDir parameter uses absolute path resolution with platform subdirectories
- **[04-01]** Permission errors provide actionable suggestions (--local for global, --config-dir for local)
- **[04-01]** Windows validation allows : only after drive letter (C:)
- **[05-01]** Use boxen v6.2.1 (not v8.0.1) for CommonJS compatibility
- **[05-01]** Lazy-load boxen with getBoxen() to support Jest mocking
- **[05-01]** Inject write function in Reporter constructor for testability
- **[05-01]** Reporter manages indentation state for hierarchical output (2 spaces per level)
- **[05-02]** Convert validateAndPrepareInstall errors to thrown exceptions for error resilience
- **[05-02]** Mock boxen in tests using jest.mock() for ESM compatibility
- **[05-02]** Update jest.config.js to include bin/*.test.js pattern for integration tests
- **[05-02]** Error collection pattern: results array with { platform, success, details/error }
- **[05-02]** POSIX exit codes: 0 for all success, 1 for any failure
- **[ROADMAP-EVOLUTION]** Phase 5.1 inserted: Architecture optimization (restructure bin/ and lib-ghcc/, SOLID principles, prepare for GPT-4All/Mistral/Gemini)
- **[ROADMAP-EVOLUTION]** Phase 5.2 inserted: Codex global support (implement `--codex --global` to `~/.codex/` on clean architecture)
- **[ROADMAP-EVOLUTION]** Phase 5.3 inserted: Future integration preparation and comprehensive validation
- **[ROADMAP-EVOLUTION]** Phase order corrected: Architecture optimization MUST happen before Codex global to avoid refactoring new code
- **[05.1-01]** Analysis-driven cleanup: Use mature npm tools (depcheck, madge, unimported) for data-driven restructuring decisions
- **[05.1-01]** Manual dependency tree analysis when unimported needs entry point configuration (madge + comm utility)
- **[05.1-01]** Git checkpoint pattern: Commit before major changes for rollback safety
- **[05.1-01]** Separate analysis files for each category (analysis-{type}.txt pattern)
- **[05.1-02]** Feature/domain organization chosen over technical layers (platforms vs adapters)
- **[05.1-02]** Codex uses local paths only (no global support) in context-builder
- **[05.1-02]** Test-helpers consolidated into testing/ domain with fixtures/ structure
- **[05.1-02]** Standalone test runners excluded from Jest (orchestration, templating use custom runners)
- **[05.1-02]** Template-system renamed to templating for domain naming consistency
- **[05.1-02]** Domain structure: platforms/ configuration/ templating/ installation/ testing/
- **[05.1-02]** Import paths follow new domain structure (../configuration/ not ../lib/)
- **[05.1-02]** Platform-specific paths with null-safe fallbacks for unsupported scopes
- **[05.1-02]** Doc generator in templating/doc-generator/ with package.json script references


### Pending Todos

**Phase 5.1 - Wave 3 (Domain Migration - Configuration & Menu):**
- Migrate flag-parser.js to configuration/
- Migrate old-flag-detector.js to configuration/
- Migrate flag-validator.js to configuration/
- Migrate conflict-resolver.js to configuration/
- Migrate interactive-menu.js to configuration/
- Update import paths after migration

### Roadmap Evolution

**Current roadmap:** v1.10.0 with 11 phases (8 original + 3 inserted)
- Phase 1: Dependency Setup (DEPS-01, DEPS-02) ✅
- Phase 2: Flag System Redesign (FLAG-01 to FLAG-06) ✅
- Phase 3: Interactive Menu (MENU-01 to MENU-04) ✅
- Phase 4: Platform Paths (PATH-01 to PATH-03) ✅
- Phase 5: Message Optimization (MSG-01 to MSG-03) ✅
- **Phase 5.1: Codebase Architecture Optimization (ARCH-OPT-01 to ARCH-OPT-08) 🔄 NEXT ⚠️ CRITICAL**
- **Phase 5.2: Codex Global & Path Unification (CODEX-GLOBAL-01, CODEX-GLOBAL-02, PATH-UNIF-01)**
- **Phase 5.3: Future Integration Preparation (FUTURE-PREP-01 to FUTURE-PREP-04)**
- Phase 6: Uninstall Implementation (UNINST-01 to UNINST-03)
- Phase 7: Testing & QA (TEST-01 to TEST-04)
- Phase 8: Documentation & Migration (DOCS-01 to DOCS-04)

**Scope changes from original research:**
- Codex global: ~~NOT implemented (show warning only)~~ → ✅ NOW IMPLEMENTING (Phase 5.2, after architecture cleanup)
- Architecture optimization: ✅ ADDED (Phase 5.1) - restructure FIRST, then add features
- Future AI tools prep: ✅ ADDED (Phase 5.3) - GPT-4All, Mistral, Gemini
- Backward compatibility: NONE (hard removal, not soft deprecation)
- Migration guide: Simplified (basic flag transition only)
- Uninstall: NOW P0 (was considered for deferral)
- Version: Keeping v1.10.0 despite breaking change
- CHANGELOG: Two distinct sections required

### Blockers/Concerns

None currently. Phase 5.1 Plans 01-02 complete with excellent results.

**Key findings from domain migration:**
- Zero circular dependencies maintained - clean architecture
- All source files in use - no dead code
- 50+ files successfully migrated to domain structure
- All 254 tests passing (100% pass rate)
- Import paths correctly updated across entire codebase
- Domain boundaries clear: platforms, configuration, templating, installation, testing

**Phase 5.1 progressing well** - 2 of 8 plans complete, foundation solid for remaining work.

## Session Continuity

Last session: 2026-01-25 09:28:46Z
Stopped at: Completed 05.1-02-PLAN.md (Domain Migration)
Resume file: None

**Next steps:**
1. Plan 05.1-03: Test Structure Unification (consolidate test patterns)
2. Continue Phase 5.1 execution (6 more plans)
3. Phase 5.2: Codex Global Support (build on clean architecture)
4. Phase 5.3: Future Integration Preparation & Validation

---

*STATE.md initialized for v1.10.0 milestone — 2026-01-24*
