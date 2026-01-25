# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Specs in /specs/skills/ serve as single source of truth for GSD commands across 3 platforms (Copilot, Claude, Codex)
**Current focus:** Milestone v1.10.0 - Installation CLI Optimization with breaking changes

## Current Position

Milestone: v1.10.0 - Installation CLI Optimization
Phase: 5.2 of 15 (Function-level Inventory of `bin/**` - Stage 1) — COMPLETE ✓
Progress: [████░░░░░░░░░░░] 40% (6/15 phases complete)
Last activity: 2026-01-25 — Completed Plan 05.2-03 (Documentation Finalization & Verification)
Next: Phase 5.3 — Function-level Consolidation (Stage 2)

**Phase 5.2 Plan 01a Complete:** ✅ 2026-01-25
- Plan 01a: Cleanup & Foundation Setup (3.4 min)
- AST parser with dual-parser fallback (@babel/parser + acorn)
- Complexity calculator with McCabe's algorithm (Simple < 5, Moderate 5-9, Complex >= 10)
- Parsers installed: @babel/parser ^7.28.6, acorn ^8.15.0
- Directory structure created: eval/stage_1/, bin/lib/analysis/
- Tested: 82 functions extracted from install.js
- Resolved Questions 1 and 5 from research phase
- Ready for advanced analysis utilities (plan 01b)

**Phase 5.2 Plan 01b Complete:** ✅ 2026-01-25 (executed before 01a)
- Plan 01b: Advanced Analysis Utilities (3.5 min)
- 4 utilities created: side-effects, classifier, relationships, confidence
- I/O side effects detector (file system, console, network)
- 3-heuristic helper detection (scope + naming + usage, 2+ = helper)
- Deduction-based confidence scoring (start 100%, min 30%)
- Direct call relationships tracker with reverse dependency mapping
- All 6 analysis utilities now operational and tested
- Ready for function-level inventory of bin/**

**Phase 5.2 Plan 03 Complete:** ✅ 2026-01-25
- Plan 03: Documentation Finalization & Verification (2 min)
- DEPENDENCY-GRAPH.md with direct-only relationships (92 functions)
- INVENTORY-SUMMARY.md documenting all 5 research questions applied
- Statistics: 30 simple (32.6%), 21 moderate (22.8%), 41 complex (44.6%)
- High-dependency functions identified: getConfigPaths (10 callers), visit (8), render (6)
- All 92 functions flagged with <100% confidence for Stage 2 review
- Phase 5.2 Stage 1 complete - ready for Phase 5.3 consolidation

**Phase 5.1 Complete:** ✅ 2026-01-25
- 5 plans executed (01-01, 02-01, 02-02, 02-03, 03-01)
- All 3 waves complete: Analysis, Migration, Modernization
- 8/8 ARCH-OPT requirements verified (100%)
- **Test results:** 254 passing tests (16 suites), 100% pass rate ✨
- **Coverage:** 12.64% (improved from 10.47% baseline, +2.17%)
- **Architecture:** Zero circular dependencies, clean domain structure
- **Import paths:** All fixed and verified working
- **Report:** PHASE-5.1-REPORT.md (381 lines, comprehensive documentation)
- **Cleanup:** 4 unused dependencies removed, 9 unused files removed
- **Dependencies:** 7 packages updated to latest stable (boxen 8.x, chalk 5.x, execa 9.x, jest 30.x)
- **Domain structure complete and populated:**
  - `platforms/` - 5 files (Claude, Copilot, Codex adapters + shared utilities)
  - `configuration/` - 7 files (Flags, paths, menu, routing, validation)
  - `templating/` - 15 files (Template engine, doc-generator, spec parser)
  - `installation/` - 12 files (Reporter, colors, migrations, CLI detection)
  - `testing/` - 1 file (CLI invoker + fixtures directory)
- All code migrated and organized by feature/domain
- All import paths updated and verified
- Doc generator working in new location
- Architecture diagrams: before/after comparison
- **Documentation:** Comprehensive PHASE-5.1-REPORT.md (381 lines)
- **Next:** Phase 5.2 (Codex Global Support & Path Unification)

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

**NEW: Architecture Optimization Complete + Function-level Audit Added** - Phase 5.1 complete (2026-01-25). 4 urgent phases inserted (5.2-5.5) for comprehensive function-by-function audit and consolidation of `bin/**` and `lib-ghcc/`, preparing for modern, maintainable structure and future AI tool integrations.

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

Progress: [████░░░░░░░░░░░] 40% (6/15 phases complete)

## Performance Metrics

**Milestone Timeline:**
- Start date: 2026-01-24 (Phase 1 execution started)
- Estimated duration: 5-7 weeks (35-50 days with function-level audit)
- Target completion: TBD

**Phase Breakdown:**

| Phase | Name | Estimate | Status |
|-------|------|----------|--------|
| 1 | Dependency Setup | 1 day | **Complete** ✓ (2 min) |
| 2 | Flag System Redesign | 3-4 days | **Complete** ✓ (15 min) |
| 3 | Interactive Menu | 2-3 days | **Complete** ✓ (45 min) |
| 4 | Platform Paths | 2-3 days | **Complete** ✓ (8 min) |
| 5 | Message Optimization | 2 days | **Complete** ✓ (9 min) |
| 5.1 | Architecture Optimization | 4-5 days | **Complete** ✓ (5 days) |
| 5.2 | Function-level Inventory | 3-4 days | **Next** 🔄 Stage 1 |
| 5.3 | Function-level Consolidation | 3-4 days | Pending (Stage 2) |
| 5.4 | Function-level Index Review | 2-3 days | Pending (Stage 3) |
| 5.5 | Execute Unification | 3-5 days | Pending (Implementation) |
| 5.6 | Codex Global & Path Unification | 1-2 days | Pending |
| 5.7 | Future Integration Prep | 2-3 days | Pending |
| 6 | Uninstall Implementation | 2-3 days | Pending |
| 7 | Testing & QA | 3-4 days | Pending |
| 8 | Documentation & Migration | 2-3 days | Pending |

**Coverage:**
- Total requirements: 61 (29 original + 15 architecture + 17 function-level audit)
- Requirements mapped: 61/61 (100%)
- Requirements complete: 26/61 (43%)
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
- **[ROADMAP-EVOLUTION]** Phases 5.2-5.5 inserted (2026-01-25): Function-level audit and consolidation (URGENT) - comprehensive bin/** analysis with mandatory user interaction
- **[ROADMAP-EVOLUTION]** Old Phase 5.2 → Phase 5.6: Codex global support (implement `--codex --global` to `~/.codex/` on consolidated architecture)
- **[ROADMAP-EVOLUTION]** Old Phase 5.3 → Phase 5.7: Future integration preparation and comprehensive validation
- **[ROADMAP-EVOLUTION]** Phase order: Architecture optimization → Function-level audit → Codex global to build on clean, consolidated foundation
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
- **[05.1-02-03]** Split test strategy: integration in __tests__/, unit tests colocated in bin/lib/
- **[05.1-02-03]** Jest multi-location support via testMatch patterns (not multiple configs)
- **[05.1-02-03]** Coverage thresholds set to 80% (statements/functions/lines), 75% (branches)
- **[05.1-02-03]** Standalone test runners (orchestration, templating) excluded via testPathIgnorePatterns
- **[05.1-02-03]** Coverage tracked in both bin/ and lib-ghcc/ directories
- **[05.1-03]** Aggressive dependency update strategy successful with zero breaking changes
- **[05.1-03]** ESM-only packages (chalk 5.x, execa 9.x, boxen 8.x) work in CommonJS project
- **[05.1-03]** No reverts needed despite ESM-only marketing (packages provide compatibility)
- **[05.1-03]** Comprehensive Phase 5.1 report provides audit trail and future integration guidance
- **[05.2-01a]** Dual-parser fallback strategy: @babel/parser primary, acorn fallback for edge cases
- **[05.2-01a]** Hardcoded complexity thresholds: Simple < 5, Moderate 5-9, Complex >= 10 (configurable later)
- **[05.2-01a]** Three sourceType strategies for @babel/parser: module, script, unambiguous (automatic detection)
- **[05.2-01b]** I/O side effects only (file system, console, network) - NOT state mutations
- **[05.2-01b]** 3-heuristic helper detection: scope + naming + usage, 2+ matches = helper
- **[05.2-01b]** Confidence deductions: dynamic requires -20%, unclear naming -10%, no JSDoc -5%, complex without docs -15%, unclear deps -10%
- **[05.2-01b]** Direct call relationships only in Stage 1 (one level deep), transitive deferred to Stage 2
- **[05.2-01b]** Minimum confidence score: 30% (never go below this floor)
- **[05.2-01b]** Helper naming patterns: starts with _, internal, private, anonymous, arrow_; ends with helper, util
- **[05.2-01b]** Reverse dependency mapping via buildCalledByMap for helper detection


### Pending Todos

**Pending Todos

**Phase 5.2 - Function-level Inventory (Stage 1):**
- Clean up all `.txt` artifacts from Phase 5.1 tests (with user confirmation)
- Create `/eval/stage_1/` directory structure
- Analyze every function in `bin/**` individually
- Document: purpose, inputs/outputs, side effects, dependencies
- Get user confirmation via `ask_user` for each function analysis
- Create Stage 1 analysis documents with mandatory YAML headers

**Phase 5.3 - Function-level Consolidation (Stage 2):**
- Evaluate repeated/overlapping logic across all functions
- Identify duplication and unification opportunities
- Present consolidation options to user via `ask_user`
- Create Stage 2 documents with merge/keep/rename/move decisions

**Phase 5.4 - Function-level Index Review (Stage 3):**
- Analyze `index.js` function-by-function
- Identify clarity, duplication, and optimization opportunities
- Review all proposals with user via `ask_user`
- Document Stage 3 findings and improvement proposals

**Phase 5.5 - Execute Unification:**
- Implement approved consolidation plans
- Execute merge/rename/move operations
- Optimize `index.js` and `bin/**` structure
- Minimize/remove `lib-ghcc/` dependencies (with user approval)
- Verify no breaking changes

**Phase 5.6 - Codex Global Support:**
- Implement `--codex --global` support
- Add codex global path to paths.js
- Create codex global installation logic
- Test codex global installation flow

**Phase 5.7 - Future Integration Preparation:**
- Document extension points for future platforms
- Validate architecture extensibility
- Create platform adapter template

### Roadmap Evolution

**Current roadmap:** v1.10.0 with 15 phases (8 original + 7 inserted)
- Phase 1: Dependency Setup (DEPS-01, DEPS-02) ✅
- Phase 2: Flag System Redesign (FLAG-01 to FLAG-06) ✅
- Phase 3: Interactive Menu (MENU-01 to MENU-04) ✅
- Phase 4: Platform Paths (PATH-01 to PATH-03) ✅
- Phase 5: Message Optimization (MSG-01 to MSG-03) ✅
- **Phase 5.1: Codebase Architecture Optimization (ARCH-OPT-01 to ARCH-OPT-08) ✅ COMPLETE**
- **Phase 5.2: Function-level Inventory - Stage 1 (FN-AUDIT-01 to FN-AUDIT-05) 🔄 NEXT (URGENT)**
- **Phase 5.3: Function-level Consolidation - Stage 2 (FN-CONSOL-01 to FN-CONSOL-04) (URGENT)**
- **Phase 5.4: Function-level Index Review - Stage 3 (FN-INDEX-01 to FN-INDEX-03) (URGENT)**
- **Phase 5.5: Execute Unification (FN-EXEC-01 to FN-EXEC-04) (URGENT)**
- **Phase 5.6: Codex Global & Path Unification (CODEX-GLOBAL-01, CODEX-GLOBAL-02, PATH-UNIF-01)**
- **Phase 5.7: Future Integration Preparation (FUTURE-PREP-01 to FUTURE-PREP-04)**
- Phase 6: Uninstall Implementation (UNINST-01 to UNINST-03)
- Phase 7: Testing & QA (TEST-01 to TEST-04)
- Phase 8: Documentation & Migration (DOCS-01 to DOCS-04)

**Urgent insertions (2026-01-25):**
- Phases 5.2-5.5 added for comprehensive function-level audit and consolidation
- Function-first approach (not file-first) with mandatory user interaction
- Clean up Phase 5.1 test artifacts before starting
- Old phases 5.2-5.3 renumbered to 5.6-5.7
- Critical path now 11-16 days longer (function-level work)

**Scope changes from original research:**
- Codex global: ~~NOT implemented (show warning only)~~ → ✅ NOW IMPLEMENTING (Phase 5.6, after function audit)
- Architecture optimization: ✅ COMPLETE (Phase 5.1) - restructure FIRST, then add features
- **Function-level audit: ✅ NOW ADDED (Phases 5.2-5.5) - comprehensive bin/** consolidation with user decisions**
- Future AI tools prep: ✅ READY (Phase 5.7) - GPT-4All, Mistral, Gemini
- Backward compatibility: NONE (hard removal, not soft deprecation)
- Migration guide: Simplified (basic flag transition only)
- Uninstall: NOW P0 (was considered for deferral)
- Version: Keeping v1.10.0 despite breaking change
- CHANGELOG: Two distinct sections required

### Blockers/Concerns

None currently. Phase 5.2 Plan 01a complete with foundation utilities ready.

**Key achievements from Phase 5.2 Plan 01a:**
- Dual-parser AST extraction strategy operational (@babel/parser + acorn)
- McCabe complexity calculator with hardcoded thresholds (Simple/Moderate/Complex)
- Successfully tested: 82 functions extracted from install.js
- Analysis utilities: 6 modules ready (ast-parser, complexity, side-effects, classifier, relationships, confidence)
- Directory structure in place: eval/stage_1/ for analysis documents
- Resolved research questions 1 and 5

**Key achievements from Phase 5.1 (all 4 plans):**
- Zero circular dependencies maintained - clean architecture
- All source files in use - no dead code  
- 50 files organized across 5 domains
- All 254 tests passing (100% pass rate) ✨
- Coverage improved: 12.64% (baseline 10.47%, +2.17%)
- Import paths correctly updated across entire codebase
- Domain boundaries clear and well-populated
- Doc generator working in new location
- Architecture diagrams generated for before/after comparison
- 7 dependencies updated to latest stable versions
- Comprehensive documentation (PHASE-5.1-REPORT.md, 381 lines)

**Phase 5.2 Stage 1 complete** - Ready for Phase 5.3 (Function-level Consolidation - Stage 2).

## Session Continuity

Last session: 2026-01-25T19:01:50Z
Stopped at: Completed Plan 05.2-03 (Documentation Finalization & Verification)
Resume file: None

**Next steps:**
1. Phase 5.3: Function-level Consolidation (Stage 2) - Evaluate duplication and propose merge/keep/rename/move with user decisions
4. Phase 5.4: Function-level Index Review (Stage 3) - Analyze index.js for clarity and optimization
5. Phase 5.5: Execute Unification - Implement approved consolidation plans
6. Phase 5.6: Codex Global Support (implement `--codex --global` to `~/.codex/`)
7. Phase 5.7: Future Integration Preparation (document extension points)
8. Phase 6: Uninstall Implementation

---

*STATE.md initialized for v1.10.0 milestone — 2026-01-24*
