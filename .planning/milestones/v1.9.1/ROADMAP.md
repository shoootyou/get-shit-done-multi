# Roadmap: GSD Skills Standardization

## Overview

Transform 29 GSD commands from legacy format to unified multi-platform specs in `/specs/skills/`. The migration reuses proven template system from agent specs, enabling single source of truth that generates platform-specific outputs for Claude Code, GitHub Copilot CLI, and Codex CLI. Phases progress from foundation (schema, validation) → high-complexity orchestrators → simpler commands → comprehensive testing and documentation, with legacy format maintained for compatibility throughout transition.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Schema** - Establish spec structure and prove architecture
- [x] **Phase 2: Template Engine Integration** - Extend install.js with spec generation pipeline
- [x] **Phase 3: High-Complexity Orchestrators** - Migrate critical multi-agent commands
- [x] **Phase 4: Mid-Complexity Commands** - Migrate planning and verification commands
- [x] **Phase 5: Simple Command Migration** - Bulk migrate remaining single-stage commands
- [x] **Phase 5.1: Fix git identity preservation in agents (INSERTED)** - URGENT: Fix agents to preserve user git identity
- [x] **Phase 6: Orchestration Validation** - Verify subagent spawning and structured returns
- [x] **Phase 7: Multi-Platform Testing** - Test installation and execution on all 3 platforms
- [x] **Phase 8: Documentation & Release** - Complete docs and ship v1.9.1
- [x] **Phase 8.1: Documentation Cleanup & Fixes (INSERTED)** - URGENT: Pre-release documentation refinements and cleanup

## Phase Details

### Phase 1: Foundation & Schema
**Goal**: Establish spec structure, define canonical schemas, and prove architecture with test migration
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-04, FOUN-05, MIGR-02
**Success Criteria** (what must be TRUE):
  1. Directory `/specs/skills/` exists with README documenting structure
  2. Canonical frontmatter schema defined with name, description, tools, metadata fields
  3. Metadata template exists with platform, versions, generated timestamp fields
  4. Test skill (gsd-help) successfully migrated to folder structure `/specs/skills/gsd-help/SKILL.md`
  5. Command name mapping table created documenting all 29 commands (gsd: → gsd-)
**Plans**: 2 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md — Foundation structure, canonical schema, command mapping (Wave 1)
- [ ] 01-02-PLAN.md — Test migration of gsd-help with human verification (Wave 2)

### Phase 2: Template Engine Integration
**Goal**: Extend install.js to generate skills from specs using existing template system
**Depends on**: Phase 1
**Requirements**: FOUN-03, FOUN-07, FOUN-08, PLAT-01, PLAT-02, PLAT-03, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Function `generateSkillsFromSpecs()` exists in install.js and processes `/specs/skills/`
  2. Conditional syntax ({{#isClaude}}, {{#isCopilot}}, {{#isCodex}}) renders correctly in generated output
  3. Frontmatter inheritance works allowing shared blocks across commands
  4. Metadata fields auto-generate with correct timestamps and version numbers
  5. All 3 platform adapters (Claude, Copilot, Codex) integrated with skill generation
  6. Test skill (gsd-help) installs successfully on at least one platform
**Plans**: 5 plans in 4 waves

Plans:
- [x] 02-01-PLAN.md — Create generateSkillsFromSpecs() function (Wave 1)
- [x] 02-02-PLAN.md — Implement frontmatter inheritance with _shared.yml (Wave 1)
- [x] 02-03-PLAN.md — Integrate skill generation into all 3 platform installers (Wave 2)
- [x] 02-04-PLAN.md — End-to-end verification with gsd-help test case (Wave 3 - checkpoint)
- [x] 02-05-PLAN.md — Fix skill output structure and safe testing (Wave 4 - gap closure)

### Phase 3: High-Complexity Orchestrators
**Goal**: Migrate critical orchestration commands with multi-agent spawning
**Depends on**: Phase 2
**Requirements**: MIGR-01, MIGR-05, MIGR-07, MIGR-08, ORCH-01, ORCH-02, ORCH-03, ORCH-04, ORCH-05
**Success Criteria** (what must be TRUE):
  1. Command gsd-new-project migrated with parallel subagent spawning (5 agents)
  2. Command gsd-new-milestone migrated with orchestration logic intact
  3. Command gsd-execute-phase migrated with wave-based parallelization
  4. All @-references preserved and working in migrated commands
  5. Multi-section XML structure maintained (<objective>, <process>, etc.)
  6. Dependency audit complete documenting all cross-command references
**Plans**: 6 plans in 3 waves
**Status**: ✅ Complete (2026-01-24)

Plans:
- [x] 03-01-PLAN.md — Dependency audit and @-reference validation (Wave 1)
- [x] 03-02-PLAN.md — Migrate execute-phase orchestrator (Wave 1)
- [x] 03-03-PLAN.md — Migrate new-project & new-milestone orchestrators (Wave 2)
- [x] 03-04-PLAN.md — E2E orchestration verification (Wave 3 - checkpoint)
- [x] 03-05-PLAN.md — Fix --project-dir flag (Wave 3 - gap closure)
- [x] 03-06-PLAN.md — Fix skills directory path (Wave 3 - gap closure)

### Phase 4: Mid-Complexity Commands
**Goal**: Migrate planning, verification, and research commands with 1-2 subagent spawns
**Depends on**: Phase 3
**Requirements**: MIGR-04, MIGR-07, MIGR-08, ORCH-06, ORCH-07
**Success Criteria** (what must be TRUE):
  1. Commands plan-phase, research-phase, debug, map-codebase migrated to spec format
  2. Subagent spawning (1-2 agents) works correctly in all commands
  3. Argument handling preserved (--research, --gaps-only, etc.)
  4. Process subsections (<phase>, <step>) maintained in structure
  5. Embedded bash validation blocks preserved and functional
**Plans**: 5 plans in 4 waves

Plans:
- [x] 04-01-PLAN.md — Migrate research-phase (checkpoint continuation, Wave 1)
- [x] 04-02-PLAN.md — Migrate map-codebase (prose → explicit spawns, Wave 1)
- [x] 04-03-PLAN.md — Migrate debug (session persistence, Wave 2)
- [x] 04-04-PLAN.md — Migrate plan-phase (verification loop, 4 flags, most complex, Wave 3)
- [x] 04-05-PLAN.md — E2E verification checkpoint (test all 4 commands, Wave 4)

### Phase 5: Simple Command Migration
**Goal**: Bulk migrate remaining 21 single-stage commands with minimal orchestration
**Depends on**: Phase 4
**Requirements**: MIGR-03, MIGR-06, MIGR-07, MIGR-08, MIGR-09
**Success Criteria** (what must be TRUE):
  1. All 21 remaining commands migrated: progress, verify-work, milestone lifecycle, todos, phase management, reference commands
  2. All basic frontmatter and tool declarations working
  3. Spawning commands preserve subagent invocation patterns (verify-work, audit-milestone, plan-milestone-gaps)
  4. Progress routing hub works correctly (routes to 11 commands based on state)
  5. All commands install and are discoverable on at least one platform
**Plans**: 9 plans in 5 waves

Plans:
- [x] 05-01-PLAN.md — Batch 1: Reference commands (help, verify-installation, list-milestones, whats-new) - Wave 1
- [x] 05-02-PLAN.md — Batch 2: Status/utility commands (pause-work, resume-work, list-phase-assumptions) - Wave 1
- [x] 05-03-PLAN.md — Batch 3: Phase management (add-phase, insert-phase, remove-phase) - Wave 2
- [x] 05-04-PLAN.md — Batch 4: Todo management (add-todo, check-todos) - Wave 2
- [x] 05-05-PLAN.md — Batch 5: Verification suite (verify-work, discuss-phase) - Wave 3
- [x] 05-06-PLAN.md — Batch 6: Milestone lifecycle (complete, audit, plan-gaps, archive, restore) - Wave 3
- [x] 05-07-PLAN.md — Batch 7: Update command - Wave 3
- [x] 05-08-PLAN.md — Batch 8: Progress routing hub (MUST GO LAST) - Wave 4
- [x] 05-09-PLAN.md — E2E verification checkpoint - Wave 5

### Phase 5.1: Fix git identity preservation in agents (INSERTED)

**Goal:** Fix agents to preserve user git identity when making commits, add git config to project setup
**Depends on:** Phase 5
**Requirements:** None (urgent fix, addresses git identity override issue)
**Success Criteria** (what must be TRUE):
  1. Git identity schema exists in config.json template with name, email, source fields
  2. New-project workflow collects git identity during setup (Phase 5.5)
  3. User can choose global git config or project-only storage
  4. Bash helper functions exist for reading identity and committing with user attribution
  5. All 5 agents (executor, planner, debugger, researchers) use identity-preserving commits
  6. Git commits show user name, not agent name ("Lex" not "GSD Debugger")
**Plans:** 2 plans in 2 waves

Plans:
- [x] 5.1-01-PLAN.md — Git identity foundation (config schema, new-project updates, helpers) - Wave 1
- [x] 5.1-02-PLAN.md — Update agent specs to use identity-preserving commits - Wave 2

**Details:**
URGENT: Multiple agents (gsd-debugger, gsd-executor, gsd-planner, etc.) are overriding user git identity when making commits. Root cause: GitHub Copilot CLI uses agent `name` field as git author. Solution: Use git environment variables (GIT_AUTHOR_*, GIT_COMMITTER_*) which override platform behavior.

### Phase 6: Orchestration Validation
**Goal**: Verify subagent spawning, structured returns, and cross-command invocation work end-to-end
**Depends on**: Phase 5
**Requirements**: ORCH-06, ORCH-08, MIGR-10, TEST-09
**Success Criteria** (what must be TRUE):
  1. Structured return parsing works in orchestrators (## RESEARCH COMPLETE format)
  2. Parallel subagent spawning tested (gsd-new-project with 5 agents)
  3. Context passing via @-references verified across command boundaries
  4. Validation suite created comparing legacy vs new spec behavior
  5. Variable interpolation in @-references works correctly
**Plans**: 3 plans in 3 waves

Plans:
- [x] 06-01-PLAN.md — Structured Returns + Parallel Spawning (Wave 1)
- [x] 06-02-PLAN.md — Sequential Spawning + @-References (Wave 2)
- [x] 06-03-PLAN.md — Integration Suite + Report (Wave 3)

### Phase 7: Multi-Platform Testing
**Goal**: Test installation and execution on all 3 platforms with comprehensive coverage
**Depends on**: Phase 6
**Requirements**: FOUN-06, PLAT-05, PLAT-06, PLAT-07, PLAT-08, PLAT-09, PLAT-10, PLAT-11, TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08, TEST-10
**Success Criteria** (what must be TRUE):
  1. All 29 commands install successfully on Claude Code
  2. All 29 commands install successfully on GitHub Copilot CLI
  3. All 29 commands install successfully on Codex CLI
  4. Tool mapping verified (Claude tools → platform equivalents)
  5. Platform-specific content renders correctly via conditionals
  6. Legacy fallback works when spec missing (no breaking changes)
  7. Jest test suite passes with tests for parsing, conditionals, frontmatter, metadata
  8. Regression tests verify all 29 commands behave identically to legacy versions
**Plans**: 3 plans in 3 waves

Plans:
- [ ] 07-01-PLAN.md — Foundation + Jest Suite (Wave 1)
- [ ] 07-02-PLAN.md — Platform Testing + Execution (Wave 2, checkpoint)
- [ ] 07-03-PLAN.md — Analysis + Reporting (Wave 3)

### Phase 8: Documentation & Release
**Goal**: Complete documentation, update changelog, and release v1.9.1
**Depends on**: Phase 7
**Requirements**: MIGR-11, DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08, DOCS-09, DOCS-10
**Success Criteria** (what must be TRUE):
  1. File `/specs/skills/README.md` documents structure with examples
  2. Frontmatter schema documented with all field descriptions
  3. Conditional syntax usage documented with examples
  4. Migration guide created for future command additions
  5. Main README.md updated referencing new spec structure
  6. File `bin/install.js` changes documented with code comments
  7. Troubleshooting guide created for common installation issues
  8. CHANGELOG.md updated with v1.9.1 release notes
  9. Transition strategy documented (legacy → new spec coexistence)
  10. Command reference comparison table created (old vs new format)
**Plans**: 3 plans in 3 waves

Plans:
- [ ] 08-01-PLAN.md — Core documentation (README expansion + comparison table) - Wave 1
- [ ] 08-02-PLAN.md — User guides (migration + troubleshooting) - Wave 2
- [ ] 08-03-PLAN.md — Release artifacts (cleanup script + CHANGELOG + README) - Wave 3

### Phase 8.1: Documentation Cleanup & Fixes (INSERTED)

**Goal:** Refine documentation structure, fix inconsistencies, and implement proper migration mechanism
**Depends on:** Phase 8
**Plans:** 5 plans in 3 waves

Plans:
- [x] 8.1-01-PLAN.md — Migration mechanism & file organization (Wave 1)
- [x] 8.1-02-PLAN.md — Documentation content updates (Wave 1, parallel)
- [x] 8.1-03-PLAN.md — Link validation (Wave 2)
- [x] 8.1-04-PLAN.md — Script audit & asset updates (Wave 2)
- [x] 8.1-05-PLAN.md — Close verification gaps (Wave 3, gap closure)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Schema | 0/TBD | Not started | - |
| 2. Template Engine Integration | 0/TBD | Not started | - |
| 3. High-Complexity Orchestrators | 0/TBD | Not started | - |
| 4. Mid-Complexity Commands | 0/TBD | Not started | - |
| 5. Simple Command Migration | 0/TBD | Not started | - |
| 6. Orchestration Validation | 0/TBD | Not started | - |
| 7. Multi-Platform Testing | 0/TBD | Not started | - |
| 8. Documentation & Release | 0/TBD | Not started | - |
