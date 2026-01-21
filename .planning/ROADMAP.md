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
**Goal:** Split oversized agents into coordinator/specialist pairs to achieve 100% Copilot platform coverage (15/15 agents) while preserving ALL content with zero information loss

**Dependencies:** Phase 3 (needs working generation pipeline)

**Requirements:** AGNT-02 (platform compatibility), AGNT-04 (validation)

**Plans:** 4 plans in 3 waves

Plans:
- [ ] 03.1-01-PLAN.md — Document split pattern & split gsd-planner (coordinator + strategist)
- [ ] 03.1-02-PLAN.md — Split gsd-debugger (investigator + specialist)
- [ ] 03.1-03-PLAN.md — Update all command/orchestrator references to new coordinator names
- [ ] 03.1-04-PLAN.md — Generate, validate, and verify 100% platform coverage

**Success Criteria:**
1. gsd-planner-coordinator + gsd-planner-strategist both <30,000 characters (preserves all 41K original content)
2. gsd-debugger-investigator + gsd-debugger-specialist both <30,000 characters (preserves all 35K original content)
3. Zero content loss - all examples, tables, and patterns preserved through functional decomposition
4. Coordinators can spawn specialists via task tool for complex scenarios
5. All 15/15 agents working on both platforms (100% coverage)
6. Commands/orchestrators reference new coordinator agents (no breaking changes)

---

### Phase 4: Installation Workflow Integration
**Goal:** Template generation integrated into existing install.js with flag support

**Dependencies:** Phase 3.1 (needs 100% platform coverage)

**Requirements:** INST-01, INST-02, INST-03, INST-04, INST-05, INST-06, TMPL-02, TMPL-08, VERS-01, VERS-02, VERS-03

**Success Criteria:**
1. `--copilot` flag generates optimized agents to `.github/copilot/agents/`
2. `--local`/`--global` flags generate optimized agents to Claude directories
3. `--all` flag installs for all detected CLIs using platform-specific optimization
4. Re-running install overwrites safely (idempotent operation)
5. Generated files include version metadata (template version, generation date, platform)
6. Package version bumped to 1.8.1 with changelog documenting optimization

---

### Phase 5: Cross-Platform Testing & Validation
**Goal:** Every agent verified through actual installation and invocation on both CLIs

**Dependencies:** Phase 4 (needs integrated installation workflow)

**Requirements:** (Validates all previous requirements through runtime testing)

**Success Criteria:**
1. CI pipeline installs generated agents on both Claude and Copilot platforms
2. Smoke tests invoke each agent with simple task on both platforms
3. Test logs verify tools execute correctly (Bash runs, Read accesses files, etc.)
4. Round-trip validation confirms template → agent → functional behavior
5. Platform-specific features verified (model selection on Claude, MCP on Copilot)

---

### Phase 6: Documentation & Polish
**Goal:** Users can successfully install, use, and troubleshoot template system

**Dependencies:** Phase 5 (documentation based on tested examples)

**Requirements:** PLAT-05, TMPL-09 (help documentation)

**Success Criteria:**
1. README documents installation with `--copilot` and `--local`/`--global` flags
2. Migration guide explains how existing agent authors update to template format
3. Platform support matrix shows which features work on Claude vs Copilot
4. Troubleshooting guide covers common errors with solutions
5. Examples generated from actual template output (no documentation drift)

---

## Progress

| Phase | Status | Completed | Progress |
|-------|--------|-----------|----------|
| 1 - Template Engine Foundation | Complete | 2026-01-21 | ██████████ 100% |
| 2 - Platform Abstraction Layer | Complete | 2026-01-21 | ██████████ 100% |
| 3 - Spec Migration & Template Generation | Complete | 2026-01-21 | ██████████ 100% |
| 3.1 - Agent Size Optimization | Planning | — | ░░░░░░░░░░ 0% |
| 4 - Installation Workflow Integration | Pending | — | ░░░░░░░░░░ 0% |
| 5 - Cross-Platform Testing & Validation | Pending | — | ░░░░░░░░░░ 0% |
| 6 - Documentation & Polish | Pending | — | ░░░░░░░░░░ 0% |

**Overall:** 3/7 phases complete (43%)
| 2 - Platform Abstraction Layer | Complete | 2026-01-21 | ██████████ 100% |
| 3 - Spec Migration & Template Generation | Planning | — | ░░░░░░░░░░ 0% |
| 4 - Installation Workflow Integration | Pending | — | ░░░░░░░░░░ 0% |
| 5 - Cross-Platform Testing & Validation | Pending | — | ░░░░░░░░░░ 0% |
| 6 - Documentation & Polish | Pending | — | ░░░░░░░░░░ 0% |

**Overall:** 2/6 phases complete (33%)

---

*Roadmap created: 2026-01-21*
*Last updated: 2026-01-21*
