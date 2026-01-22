# Roadmap: Multi-Platform Agent Optimization

**Project:** Multi-Platform Agent Template System
**Depth:** Comprehensive
**Created:** 2026-01-21

## Overview

Transform the existing GSD agent system from single-platform (Claude-optimized) to dual-platform (Claude + Copilot) using template-based generation. Six phases follow natural dependency chain: foundation → platform handling → generation → integration → testing → documentation. Each phase delivers testable, verifiable capabilities that unblock the next.

## Phases

### Phase 1: Template Engine Foundation
**Goal:** Template infrastructure renders agent specs with platform-specific variables

**Dependencies:** None (foundational)

**Requirements:** TMPL-01, TMPL-03, TMPL-05, TMPL-07, TMPL-09

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Dependencies & spec parser with gray-matter
- [ ] 01-02-PLAN.md — Context builder & template engine with YAML validation
- [ ] 01-03-PLAN.md — Generator orchestrator & integration tests

**Success Criteria:**
1. Template system parses YAML frontmatter from agent specs using gray-matter
2. Variable substitution replaces `{{variable}}` placeholders with context values
3. Template engine validates output YAML structure before returning
4. Error messages identify exact line/field when template parsing fails
5. Unit tests verify parsing and rendering for all variable types

---

### Phase 2: Platform Abstraction Layer
**Goal:** Platform differences isolated in compatibility layer with canonical tool names

**Dependencies:** Phase 1 (template engine needed to consume platform definitions)

**Requirements:** PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05, PLAT-06

**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Tool compatibility matrix & canonical names
- [ ] 02-02-PLAN.md — Platform capability flags & field transformers
- [ ] 02-03-PLAN.md — Platform validators & integration tests

**Success Criteria:**
1. Tool compatibility matrix maps canonical names (`Bash`, `Read`, `Edit`, `Grep`) to platform-specific formats
2. Platform capability flags control conditional rendering (model support, MCP config, hooks)
3. Generated Claude agents validate against official frontmatter spec
4. Generated Copilot agents validate against official configuration spec
5. Both platforms have equal optimization priority (no feature compromise)

---

### Phase 3: Spec Migration & Template Generation
**Goal:** All existing agents converted to spec-as-template format with platform rendering

**Dependencies:** Phase 1 (template engine), Phase 2 (platform abstraction)

**Requirements:** TMPL-04, TMPL-06, AGNT-01, AGNT-02, AGNT-03, AGNT-04

**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Spec infrastructure & conversion utilities
- [ ] 03-02-PLAN.md — Agent migration (pilot + bulk)
- [ ] 03-03-PLAN.md — Platform generation & validation testing

**Success Criteria:**
1. All 11 GSD agents exist as single-source template files in `specs/agents/`
2. Template rendering produces valid Claude agent format (YAML frontmatter + markdown)
3. Template rendering produces valid Copilot agent format (YAML frontmatter + markdown)
4. Agent functionality identical across platforms (behavior unchanged)
5. Existing orchestration system works with generated agents

---

### Phase 3.1: Agent Size Optimization
**Goal:** Split oversized agents into coordinator/specialist pairs for 100% platform coverage

**Dependencies:** Phase 3 (needs working generation pipeline)

**Requirements:** 
- AGNT-02 (platform compatibility)
- AGNT-04 (validation)
- ARCH-01 (backward compatibility - use original names)
- ARCH-02 (documentation naming conventions)
- ARCH-03 (content preservation - zero loss)
- ARCH-04 (clean generation - test-output regeneration)

**Plans:** 4 plans in 3 waves

Plans:
- [x] 03.1-01-PLAN.md — Document pattern & split gsd-planner
- [x] 03.1-02-PLAN.md — Split gsd-debugger
- [x] 03.1-03-PLAN.md — Update references
- [x] 03.1-04-PLAN.md — Clean regeneration & validation (checkpoint)

**Success Criteria:**
1. All 4 agents (2 split pairs) <30,000 characters each
2. Zero content loss - all examples, details, methodology preserved
3. Coordinator agents renamed to original names (gsd-planner, gsd-debugger) for backward compatibility
4. Original oversized specs removed after content verified in splits
5. Documentation follows naming conventions (lowercase-with-hyphens.md)
6. Clean test-output regeneration with all 13/13 agents for both platforms
7. All tests passing with updated agent names

---

### Phase 4: Installation Workflow Integration
**Goal:** Template generation integrated into existing install.js with flag support

**Dependencies:** Phase 3.1 (needs 100% platform coverage)

**Requirements:** INST-01, INST-02, INST-03, INST-04, INST-05, INST-06, TMPL-02, TMPL-08, VERS-01, VERS-02, VERS-03

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Install integration (generation in install/installCopilot/installCodex)
- [x] 04-02-PLAN.md — Version metadata & documentation (field-transformer, package.json, CHANGELOG)

**Success Criteria:**
1. `--copilot` flag generates optimized agents to `.github/copilot/agents/`
2. `--local`/`--global` flags generate optimized agents to Claude directories
3. `--all` flag installs for all detected CLIs using platform-specific optimization
4. Re-running install overwrites safely (idempotent operation)
5. Generated files include version metadata (template version, generation date, platform)
6. Package version bumped to 1.8.1 with changelog documenting optimization

---

### Phase 4.1: Installation Quality & Copilot Spec Compliance
**Goal:** Fix critical tool mapping issues and ensure Copilot agents use primary aliases with zero warnings

**Dependencies:** Phase 4 (discovered during installation testing)

**Requirements:** SPEC-01, SPEC-02, SPEC-03 (Copilot spec compliance), INST-07 (zero warnings)

**Plans:** 3 plans in 2 waves

Plans:
- [x] 04.1-01-PLAN.md — Bidirectional tool mapper + Copilot PRIMARY aliases
- [x] 04.1-02-PLAN.md — Update tool references in prompts with Mustache conditionals
- [x] 04.1-03-PLAN.md — Zero warnings validation (Wave 2, checkpoint)
- [x] 04.1-04-PLAN.md — Fix test expectations (gap closure)

**Success Criteria:**
1. Tool mapper recognizes uppercase, lowercase, and all aliases bidirectionally
2. Copilot agents use PRIMARY aliases (execute, edit, search, agent) not compatible aliases
3. Claude agents continue using uppercase names (Bash, Read, Edit, Grep, Glob, Task)
4. Color field filtered from Copilot agent frontmatter
5. Tool references in agent prompt content use platform-specific names
6. Install.js runs with ZERO warnings on all platforms (--copilot, --local, --all)
7. Grep+Glob deduplicated to single 'search' tool in Copilot
8. All 181 tests passing (141 existing + 40 new tool mapper tests)
9. Validation report shows 100% spec compliance for both platforms

---


### Phase 5: Cross-Platform Testing & Validation
**Goal:** Every agent verified through actual installation and invocation on both CLIs

**Dependencies:** Phase 4.1 (needs zero-warnings installation workflow)

**Requirements:** (Validates all previous requirements through runtime testing)

**Plans:** 3 plans in 3 waves

Plans:
- [ ] 05-01-PLAN.md — Generation & installation testing
- [ ] 05-02-PLAN.md — Invocation smoke tests (checkpoint)
- [ ] 05-03-PLAN.md — E2E orchestrator & documentation

**Success Criteria:**
1. Generation tests validate all 11 agents render correctly for both platforms
2. Installation tests validate files land in correct platform directories with correct formatting
3. Invocation smoke tests call agents via CLI and verify tool execution
4. E2E test runner orchestrates: generation → installation → invocation → report
5. Platform-specific features verified (tools string vs array, metadata presence)

---

### Phase 6: Documentation & Polish
**Goal:** Documentation complete and ready for 2.0.0 release with architecture docs, migration guide, and updated README

**Dependencies:** Phase 5 (documentation based on tested implementation)

**Requirements:** PLAT-05, TMPL-09 (help documentation)

**Plans:** 3 plans in 2 waves

Plans:
- [x] 06-01-PLAN.md — Technical documentation (ARCHITECTURE.md + CONTRIBUTING.md)
- [x] 06-02-PLAN.md — Migration guide (MIGRATION-V2.md for v1.x → v2.0 upgrade)
- [x] 06-03-PLAN.md — README & release prep (README.md update + CHANGELOG.md + version bump to 2.0.0)

**Success Criteria:**
1. ARCHITECTURE.md documents template system and platform abstraction with design decisions
2. CONTRIBUTING.md explains how to add agents, modify templates, and run tests
3. MIGRATION-V2.md provides v1.x → v2.0 upgrade guide with breaking changes and benefits
4. README.md updated with multi-platform architecture section and documentation references
5. CHANGELOG.md has complete 2.0.0 entry documenting all Phase 1-5 changes
6. package.json version bumped to 2.0.0 (major release for breaking changes)

---

## Progress

| Phase | Status | Completed | Progress |
|-------|--------|-----------|----------|
| 1 - Template Engine Foundation | Complete | 2026-01-21 | ██████████ 100% |
| 2 - Platform Abstraction Layer | Complete | 2026-01-21 | ██████████ 100% |
| 3 - Spec Migration & Template Generation | Complete | 2026-01-21 | ██████████ 100% |
| 3.1 - Agent Size Optimization | Complete | 2026-01-21 | ██████████ 100% |
| 4 - Installation Workflow Integration | Pending | — | ░░░░░░░░░░ 0% |
| 4.1 - Installation Quality & Copilot Spec Compliance | Complete | 2026-01-22 | ██████████ 100% |
| 5 - Cross-Platform Testing & Validation | Complete | 2026-01-22 | ██████████ 100% |
| 6 - Documentation & Polish | Complete | 2026-01-22 | ██████████ 100% |

**Overall:** 7/8 phases complete (88%)

---

*Roadmap created: 2026-01-21*
*Last updated: 2026-01-22*
