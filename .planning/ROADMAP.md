# Roadmap: GSD Skills Standardization

## Overview

Transform 29 GSD commands from legacy format to unified multi-platform specs in `/specs/skills/`. The migration reuses proven template system from agent specs, enabling single source of truth that generates platform-specific outputs for Claude Code, GitHub Copilot CLI, and Codex CLI. Phases progress from foundation (schema, validation) → high-complexity orchestrators → simpler commands → comprehensive testing and documentation, with legacy format maintained for compatibility throughout transition.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Schema** - Establish spec structure and prove architecture
- [ ] **Phase 2: Template Engine Integration** - Extend install.js with spec generation pipeline
- [ ] **Phase 3: High-Complexity Orchestrators** - Migrate critical multi-agent commands
- [ ] **Phase 4: Mid-Complexity Commands** - Migrate planning and verification commands
- [ ] **Phase 5: Simple Command Migration** - Bulk migrate remaining single-stage commands
- [ ] **Phase 6: Orchestration Validation** - Verify subagent spawning and structured returns
- [ ] **Phase 7: Multi-Platform Testing** - Test installation and execution on all 3 platforms
- [ ] **Phase 8: Documentation & Release** - Complete docs and ship v1.9.1

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

### Phase 5: Simple Command Migration
**Goal**: Bulk migrate remaining 19 single-stage commands with no orchestration
**Depends on**: Phase 4
**Requirements**: MIGR-03, MIGR-06, MIGR-07, MIGR-08, MIGR-09
**Success Criteria** (what must be TRUE):
  1. All 19 remaining commands migrated: progress, add-todo, check-todos, help, verify-installation, etc.
  2. Batch migration tool created for simple command conversion
  3. All basic frontmatter and tool declarations working
  4. No orchestration or complex argument handling required
  5. All commands install and are discoverable on at least one platform
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
**Plans**: TBD

Plans:
- [ ] TBD during planning

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
