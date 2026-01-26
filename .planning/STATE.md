# Project State

**Last Updated:** 2026-01-26  
**Updated By:** GSD Plan Executor (01-01 complete)

---

## Project Reference

**Core Value:** Template-based installer that deploys AI CLI skills and agents to multiple platforms (Claude Code, GitHub Copilot CLI, Codex CLI) via single npx command with interactive UX and atomic transactions.

**Current Milestone:** v2.0 — Complete Multi-Platform Installer

**Current Focus:** Phase 1 Template Migration - building foundation for ONE-TIME migration of 29 skills and 13 agents to templates/ directory with frontmatter corrections.

---

## Current Position

### Phase Status
**Current Phase:** 1 of 7 (Template Migration)  
**Phase Goal:** ONE-TIME migration of skills/agents to templates/ with frontmatter corrections  
**Started:** 2026-01-26  
**Last Activity:** 2026-01-26 - Completed 01-01-PLAN.md

### Plan Status
**Current Plan:** 1 of 4 in Phase 1  
**Plan Goal:** Migration script foundation (parser, validator, injector)  
**Status:** ✅ Complete - Ready for 01-02 (Skills Migration)

### Progress Bar
```
Milestone v2.0: Complete Multi-Platform Installer
Phase 1: [█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25% (1/4 plans)

Overall Progress:
[██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 3% (1/35 total plans)
```

---

## Performance Metrics

### Velocity
- **Phases Completed:** 0 (Phase 1 in progress)
- **Plans Completed:** 1/35
- **Days Active:** 2
- **Plans Today:** 1

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

6. **2026-01-26 (01-01):** Use gray-matter for YAML parsing (MIGRATION-01)
   - Industry-standard library for frontmatter parsing
   - Handles edge cases better than manual parsing
   - Version 4.0.3 is stable release
   - Rationale: Battle-tested, reliable, widely used in ecosystem

7. **2026-01-26 (01-01):** Collect-all-errors validation pattern (MIGRATION-02)
   - Validator accumulates all errors before reporting
   - Better UX: see all issues at once, not fail-fast
   - Comprehensive reports grouped by file
   - Rationale: More efficient developer experience, faster iteration

8. **2026-01-26 (01-01):** ESM imports throughout migration scripts (MIGRATION-03)
   - All scripts use modern import/export syntax
   - Matches project conventions
   - Better static analysis support
   - Rationale: Modern Node.js standard, future-proof

### Technical Debt
- Migration scripts are ONE-TIME code (will be deleted post-approval)

### Todos
- [x] Create migration script foundation (01-01)
- [ ] Migrate 29 skills to templates/ (01-02)
- [ ] Migrate 13 agents to templates/ (01-03)
- [ ] Validation and manual review (01-04)

### Blockers
None

---

## Session Continuity

### What Just Happened
Completed Plan 01-01: Migration Script & Frontmatter Parsing foundation. Created main migration script with 3 helper modules: frontmatter-parser (YAML validation), validator (collect-all-errors), template-injector (variable replacement). Installed gray-matter, @inquirer/prompts, and open dependencies. All scripts use ESM imports. Foundation ready for skills migration (01-02).

### What's Next
1. **Immediate:** Execute Plan 01-02 - Skills Migration (29 files)
2. **After skills:** Plan 01-03 - Agents Migration (13 files)
3. **Then:** Plan 01-04 - Validation and manual review

### Context for Next Session
- **Migration foundation complete:** Parser, validator, injector ready
- **Dependencies installed:** gray-matter, @inquirer/prompts, open
- **Migration utilities created:** 4 new scripts in scripts/ and scripts/lib/
- **Validation specs:** Skills and agents have different frontmatter requirements
- **Next action:** Execute 01-02 to migrate 29 skills to templates/

### Handoff Notes
Plan 01-01 complete. Migration foundation ready: scripts/migrate-to-templates.js provides entry point. Frontmatter parser validates skills (allowed-tools, argument-hint) vs agents (tools, skills). Validator collects all errors before reporting. Template injector replaces .github/, .claude/, .codex/ with {{PLATFORM_ROOT}} and command prefixes with {{COMMAND_PREFIX}}. Ready for 01-02 skills migration.

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
- `.planning/phases/01-template-migration/01-01-SUMMARY.md` — Migration foundation (✅ Complete)
- Next: 01-02 Skills Migration, 01-03 Agents Migration, 01-04 Validation

### Project Files
- `package.json` — Project metadata (updated with migration dependencies)
- `scripts/migrate-to-templates.js` — Main migration entry point (✅ Created)
- `scripts/lib/frontmatter-parser.js` — YAML parser and validator (✅ Created)
- `scripts/lib/validator.js` — Error collection engine (✅ Created)
- `scripts/lib/template-injector.js` — Variable replacement (✅ Created)
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
**Ready for:** Plan 01-02 (Skills Migration)
