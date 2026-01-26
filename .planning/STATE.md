# Project State

**Last Updated:** 2026-01-26  
**Updated By:** Manual documentation update

---

## Project Reference

**Core Value:** Template-based installer that deploys AI CLI skills and agents to multiple platforms (Claude Code, GitHub Copilot CLI, Codex CLI) via single npx command with interactive UX and atomic transactions.

**Current Milestone:** v2.0 — Complete Multi-Platform Installer

**Current Focus:** Documentation and planning phase - defining frontmatter corrections for skills and agents based on official Claude and Copilot specifications.

---

## Current Position

### Phase Status
**Current Phase:** 0 (Pre-implementation - Documentation)  
**Phase Goal:** Document all requirements and corrections needed before Phase 1 execution  
**Started:** 2026-01-25  
**Last Activity:** 2026-01-26 (completed frontmatter and agent corrections documentation)

### Plan Status
**Current Plan:** None (documentation phase)  
**Plan Goal:** Complete specification of template corrections  
**Status:** Documentation complete, ready for Phase 1 planning

### Progress Bar
```
Milestone v2.0: Complete Multi-Platform Installer
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0% (documentation phase)

Phase 0: Documentation & Planning
[████████████████████████████████████████████████] 100% (requirements documented)
```

---

## Performance Metrics

### Velocity
- **Phases Completed:** 0 (documentation phase)
- **Plans Completed:** 0
- **Days Active:** 2
- **Documentation Created:** 4 files

### Quality
- **Requirements Documented:** 37/37 (100%)
- **Corrections Documented:** 42 files (29 skills + 13 agents)

### Coverage
- **Requirements Mapped:** 37/37 (100%)
- **Requirements Completed:** 0/37 (0% - implementation pending)

---

## Accumulated Context

### Key Decisions

1. **2026-01-26:** Frontmatter corrections based on official Claude documentation
   - Skills use `allowed-tools` (not `tools`)
   - Skills use `argument-hint` (not `arguments` array)
   - Remove unsupported fields: skill_version, requires_version, platforms, metadata
   - Create version.json per skill for metadata preservation
   - Rationale: Align with official Claude slash-commands spec

2. **2026-01-26:** Agent frontmatter corrections differ from skills
   - Agents use `tools` (not `allowed-tools`)
   - Remove metadata block from frontmatter
   - Create single versions.json for ALL agents (not per-agent)
   - Auto-generate `skills` field by scanning agent content (Claude only)
   - Rationale: Agents have different spec than skills per Claude sub-agents docs

3. **2026-01-26:** Tool name mappings standardized
   - Copilot aliases → Claude official names
   - execute → Bash, search → Grep, agent → Task, etc.
   - Apply to both skills and agents
   - Reference: Copilot tool aliases documentation

4. **2026-01-26:** Source files are READ-ONLY
   - Never modify .github/, .claude/, or .codex/ directories
   - All work happens in templates/ directory
   - Source files preserved as reference and backup
   - Rationale: Prevent accidental corruption of working files

5. **2026-01-26:** Templates are source of truth for installation
   - templates/ directory is what gets copied during install
   - Source directories (.github/, etc.) only used for initial template generation
   - Installer reads from templates/, not from source
   - Rationale: Clear separation between development source and distribution templates

### Open Questions
None - all specifications documented

### Technical Debt
None yet (pre-implementation)

### Todos
- [ ] Execute Phase 1 planning with updated requirements
- [ ] Update research/PLATFORMS.md with correct field specifications
- [ ] Create template generation scripts
- [ ] Implement skill reference extraction for agents

### Blockers
None

---

## Session Continuity

### What Just Happened
Completed comprehensive documentation of frontmatter corrections for both skills (29 files) and agents (13 files). Created FRONTMATTER-CORRECTIONS.md and AGENT-CORRECTIONS.md with detailed specifications. Updated REQUIREMENTS.md with TEMPLATE-01C (skills) and TEMPLATE-01D (agents) requirements. Total requirements now 37 (was 36, was 34 before agent corrections).

### What's Next
1. **Immediate:** Update ROADMAP.md Phase 1 with new requirements
2. **After documentation:** Begin Phase 1 execution with template generation
3. **Future:** Research phase may need updates based on new findings

### Context for Next Session
- **Documentation complete:** All frontmatter corrections documented
- **Requirements updated:** 37 total v2.0 requirements
- **Corrections specified:** 29 skills + 13 agents need frontmatter fixes
- **version.json strategy:** Per-skill for skills, consolidated for agents
- **Tool mappings:** Copilot → Claude mappings documented
- **Next action:** Execute research/planning with updated specs

### Handoff Notes
All frontmatter correction requirements documented. Skills need: allowed-tools, argument-hint, version.json per skill, remove metadata. Agents need: tools string, skills auto-generated, single versions.json, remove metadata. Tool name mappings from Copilot to Claude defined. Source files protected (read-only). Templates are source of truth. Ready for Phase 1 planning and execution.

---

## Files and Locations

### Planning Artifacts
- `.planning/PROJECT.md` — Project definition (core value, constraints)
- `.planning/REQUIREMENTS.md` — 37 v2.0 requirements with traceability
- `.planning/ROADMAP.md` — 7-phase structure with success criteria
- `.planning/STATE.md` — This file (project memory)
- `.planning/FRONTMATTER-CORRECTIONS.md` — Skills corrections specification
- `.planning/AGENT-CORRECTIONS.md` — Agents corrections specification
- `.planning/config.json` — Configuration (depth: comprehensive)

### Research Artifacts
- `.planning/research/SUMMARY.md` — Research synthesis
- `.planning/research/ECOSYSTEM.md` — Installer patterns
- `.planning/research/PLATFORMS.md` — Claude vs Copilot comparison (needs update)
- `.planning/research/DOMAIN.md` — Architecture approach
- `.planning/research/RISKS.md` — Critical risks

### Phase Plans
- None yet (documentation phase)

### Project Files
- `package.json` — Project metadata (needs creation)
- `bin/install.js` — CLI entry point (needs creation)
- `.github/skills/` — Source skills (29 files, read-only)
- `.github/agents/` — Source agents (13 files, read-only)
- `templates/` — Target for corrected templates (needs creation)
- `get-shit-done/` — Shared resources
- `docs/` — Documentation (needs creation)

---

## Milestone Tracking

### v2.0 — Complete Multi-Platform Installer
**Goal:** Deploy skills to Claude + Copilot + Codex via npx with interactive UX and atomic transactions  
**Status:** Documentation Phase  
**Progress:** 0/7 phases complete (0%)  
**Started:** 2026-01-25  
**Target Completion:** TBD

**Phase Breakdown:**
- Phase 0: Documentation & Planning (Complete - requirements documented)
- Phase 1: Core Installer Foundation (Pending)
- Phase 2: Multi-Platform Support (Pending)
- Phase 3: Interactive UX (Pending)
- Phase 4: Atomic Transactions (Pending)
- Phase 5: Update Detection (Pending)
- Phase 6: Path Security (Pending)
- Phase 7: Documentation (Pending)

**Current Scope:** Documentation complete, ready for Phase 1

---

**State initialized:** 2026-01-25  
**Last updated:** 2026-01-26  
**Ready for:** Phase 1 planning with updated requirements
