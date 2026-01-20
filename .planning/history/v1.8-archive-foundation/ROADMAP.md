# Roadmap: GSD Milestone & Codebase Management

## Overview

This roadmap delivers milestone archiving with full historical traceability and enhanced codebase mapping that excludes infrastructure directories. Starting with safe archive operations (Phase 1), we build the exclusion system for accurate codebase analysis (Phase 2), add discovery and recovery capabilities (Phase 3), and complete integration with existing workflows (Phase 4). The result is a complete milestone lifecycle: archive → map → restore → verify, enabling clean project evolution.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Archive Foundation** - Safe milestone archiving with git validation and MILESTONES.md registry
- [x] **Phase 2: Codebase Mapping Enhancement** - Exclusion system with .gitignore support and custom patterns (incomplete - see 2.1)
- [x] **Phase 2.1: Exclusion Enforcement (INSERTED)** - Fix workflow to actually enforce exclusions  
- [x] **Phase 3: Discovery & Restore** - List archived milestones and restore capability
- [x] **Phase 4: Workflow Integration** - Integration with verify-milestone and completion guidance

## Phase Details

### Phase 1: Archive Foundation
**Goal**: Users can safely archive completed milestones with full metadata preservation and git-based traceability
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07, ARCH-08, ARCH-09, ARCH-10, ARCH-11, ARCH-12
**Success Criteria** (what must be TRUE):
  1. User can archive a completed milestone with `/gsd:archive-milestone` command
  2. User is prompted for confirmation before archiving to prevent accidental execution
  3. Archive operation blocks if git working directory contains uncommitted changes
  4. Archive moves ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md, research/, and phases/ to `.planning/history/[milestone-name]/`
  5. Archive preserves `.planning/codebase/` directory (keeps last map active for next milestone)
  6. MILESTONES.md registry exists with milestone name, date, archive location, requirements count, and key commit SHAs
  7. Archive creates git commit with descriptive message including milestone name
  8. Archive creates git tag `archive/[milestone-name]` for historical reference
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Git utilities & transaction framework for atomic operations
- [x] 01-02-PLAN.md — Milestone registry management with archive tracking  
- [x] 01-03-PLAN.md — Archive milestone command + workflow with validation

**Status:** COMPLETE (2026-01-20)

### Phase 2: Codebase Mapping Enhancement
**Goal**: Codebase analysis accurately reflects application code only by excluding infrastructure and respecting .gitignore patterns
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, MAP-06, MAP-07, MAP-08, MAP-09, MAP-10
**Success Criteria** (what must be TRUE):
  1. map-codebase excludes infrastructure directories (.claude, .github, .codex, node_modules, .git)
  2. map-codebase excludes build artifacts (dist, build, out, target, coverage)
  3. map-codebase respects .gitignore patterns when analyzing codebase
  4. map-codebase reads `.planning/map-config.json` for custom exclusion patterns (optional)
  5. map-codebase generates directory tree visualization in STRUCTURE.md showing analyzed files only
  6. map-codebase includes file count and line count metrics in generated documents
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Exclusion system: default patterns, .gitignore support, config file
- [x] 02-02-PLAN.md — Metrics & tree: file/line counts, directory tree visualization

**Status:** INCOMPLETE - Exclusions not enforced in practice (see Phase 2.1)

### Phase 2.1: Exclusion Enforcement (INSERTED)
**Goal**: Codebase mapping agents actually exclude infrastructure directories when exploring
**Depends on**: Phase 2
**Requirements**: FIX-01, FIX-02, FIX-03, FIX-04
**Success Criteria** (what must be TRUE):
  1. map-codebase in empty dir with .github/ folder produces documents with 0 files found
  2. map-codebase in project with .gitignore respects all .gitignore patterns
  3. map-codebase with custom .planning/map-config.json respects custom exclusions
  4. All 7 codebase documents exclude infrastructure consistently
**Plans**: 1 plan

Plans:
- [x] 02.1-01-PLAN.md — Fix exclusion enforcement: workflow builds list, passes to agents

**Why inserted:** Phase 2 implementation was incomplete. Exclusion patterns exist in agent instructions but workflow doesn't pass them to agents in spawn prompts. Agents ignore vague "see instructions" directive and scan all directories including GSD infrastructure.

### Phase 3: Discovery & Restore
**Goal**: Users can discover archived milestones and restore them if needed, providing safety valve for archiving operations
**Depends on**: Phase 2
**Requirements**: LIST-01, LIST-02, REST-01, REST-02, REST-03, REST-04
**Success Criteria** (what must be TRUE):
  1. User can list all archived milestones with `/gsd:list-milestones` command
  2. list-milestones shows milestone name, date archived, location, and requirement count in readable format
  3. User can restore archived milestone with `/gsd:restore-milestone [name]` command
  4. Restore operation blocks if git working directory contains uncommitted changes
  5. Restore moves files from `.planning/history/[milestone-name]/` back to `.planning/` root
  6. MILESTONES.md is updated to mark milestone as "restored" with timestamp
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — List milestones: command + workflow to display archive registry
- [x] 03-02-PLAN.md — Restore milestone: command + workflow with validation and registry update

**Status:** COMPLETE (2026-01-20)

### Phase 4: Workflow Integration
**Goal**: Archive workflow integrates seamlessly with existing GSD workflows, providing smooth milestone transitions
**Depends on**: Phase 3
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05
**Success Criteria** (what must be TRUE):
  1. verify-milestone workflow suggests running archive-milestone after successful verification
  2. archive-milestone suggests running `/gsd:map-codebase` after completion to refresh codebase analysis
  3. archive-milestone output shows clear next steps (map refresh, new milestone planning)
  4. MILESTONES.md file structure supports markdown table format with proper headers
  5. All archive operations use atomic file moves to prevent partial state on interruption
**Plans**: 1 plan

Plans:
- [x] 04-01-PLAN.md — Workflow integration: verify→archive suggestion, MILESTONES.md headers, atomic operations

**Status:** COMPLETE (2026-01-20)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 4

Decimal phases (2.1, 3.5, etc.) are INSERTED phases for urgent fixes or scope additions.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Archive Foundation | 3/3 | Complete | 2026-01-20 |
| 2. Codebase Mapping Enhancement | 2/2 | Incomplete (see 2.1) | - |
| 2.1. Exclusion Enforcement | 1/1 | Complete | 2026-01-20 |
| 3. Discovery & Restore | 2/2 | Complete | 2026-01-20 |
| 4. Workflow Integration | 1/1 | Complete | 2026-01-20 |

**Milestone Status:** COMPLETE (9/9 plans executed successfully)

**Total Duration:** 2026-01-20 (single day)

**Verified:** Yes - See `.planning/VERIFICATION.md` (36/37 requirements verified, 97%)

---
*Roadmap created: 2026-01-20*
*Last updated: 2026-01-20 after initial creation*
