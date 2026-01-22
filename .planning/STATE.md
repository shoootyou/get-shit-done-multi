# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Specs in /specs/skills/ must be single source of truth for GSD commands across 3 platforms (Copilot, Claude, Codex)
**Current focus:** Phase 2 - Template Engine Integration

## Current Position

Phase: 4 of 8.5 (Mid-Complexity Commands)
Plan: 3 of 5 (04-01, 04-02, 04-03 complete - Waves 1-2 finished)
Status: Phase 4 Wave 2 complete, Wave 3 ready
Last activity: 2026-01-22 — Completed 04-03-PLAN.md (debug migration)

Progress: [████░░░░░░] ~48% (4/8.5 phases, 17/? plans total)

## Performance Metrics

**Velocity:**
- Total plans completed: 17
- Average duration: 6.0 min
- Total execution time: 1.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-schema | 2 | 24.3 min | 12.1 min |
| 02-template-engine-integration | 5 | 13.1 min | 2.6 min |
| 03-high-complexity-orchestrators | 3 | 19.3 min | 6.4 min |
| 04-mid-complexity-commands | 3 | 15.8 min | 5.3 min |

**Recent Trend:**
- Last 5 plans: 5.0 min (03-02), 9.5 min (03-03), 3.6 min (04-02), 6.0 min (04-01), 6.2 min (04-03)
- Trend: Phase 4 averaging ~5min (simpler commands, established patterns)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Create specs in `/specs/skills/` without touching legacy (allows gradual transition)
- Use same spec for 3 platforms (reduces duplication, automatic adaptation)
- Prefix "gsd-" in specs, "gsd:" in legacy (clear differentiation, avoids conflicts)
- Structure of folder per skill (follows Claude standard, enables expansion)
- Metadata format matches `/specs/agents/` (consistency with existing system)
- **[01-01]** Folder-per-skill structure (enables future expansion with templates, assets, tests)
- **[01-01]** SKILL.md filename convention (all caps for clear identification)
- **[01-01]** Platform conditionals only in frontmatter, not body (keeps body platform-agnostic)
- **[01-01]** Metadata fields auto-generate (prevents drift, enables version tracking)
- **[01-01]** Folder name must match skill name (gsd-help folder for name: gsd-help)
- **[01-02]** gsd-help as test case (LOW complexity validates architecture without orchestration)
- **[01-02]** Human verification for first migration (validates schema interpretation and feature parity)
- **[01-02]** Complete body content preservation (maintains exact feature parity with legacy)
- **[02-01]** generateSkillsFromSpecs() reuses generateAgent() (proven pattern, no duplication)
- **[02-01]** Fail-soft skill generation (errors don't block installation)
- **[02-02]** Frontmatter inheritance with _shared.yml (eliminates duplication across 29 specs)
- **[02-02]** Skill-specific values override shared (correct merge precedence)
- **[02-04]** Codex platform requires full support (added to template system)
- **[02-05]** Folder/SKILL.md structure is mandatory (follows Claude documentation spec)
- **[02-05]** Testing must use test-output/ only (never modify protected directories)
- **[02-post]** Tools NOT in _shared.yml (principle of least privilege - each skill declares explicitly)
- **[02-01]** Reuse generateAgent() from template system (proven pattern, 208 passing tests)
- **[02-01]** Directory scanning for gsd-* folders (matches folder-per-skill pattern)
- **[02-01]** Folder name becomes output filename (gsd-help → gsd-help.md)
- **[02-02]** Use _shared.yml with Object.assign() merge (simpler than YAML anchors)
- **[02-02]** Skill-specific values override shared (clear merge precedence)
- **[02-02]** Deep merge for objects, array replacement for tools (prevents bloat)
- **[02-03]** Mirror agent generation pattern for skills (consistency and maintainability)
- **[02-03]** Platform-specific skills directories (Claude: dirs.skills, Copilot: .github/copilot/skills/, Codex: .codex/skills/)
- **[02-03]** Consistent error reporting across all platforms (generated/failed/specific errors)
- **[02-05]** Folder/SKILL.md structure matches Claude documentation for automatic discovery
- **[02-05]** Test-output approach for safe testing (never modify .claude/, .codex/, .github/copilot/)
- **[02-05]** Skills follow folder-per-skill pattern (enables future expansion with templates, examples, scripts)
- **[03-01]** Sequential migration order for Phase 3: execute-phase → new-milestone → new-project (risk reduction)
- **[03-01]** STATE.md is most critical dependency (16 command references - breaking it cascades failures)
- **[03-01]** Orchestrators can migrate before their subagents (subagents are separate specs, not in Phase 3)
- **[03-01]** Validation script skips variable references but reports missing files (14 legacy structure refs expected)
- **[03-02]** Claude platform doesn't support metadata fields in frontmatter (unlike Copilot)
- **[03-02]** Tools must be simple arrays, not object arrays with name/required/reason
- **[03-02]** Platform-specific tool conditionals using {{#isClaude}}/{{#isCopilot}}/{{#isCodex}}
- **[03-02]** Skills directory is .claude/skills/ not .claude/ root
- **[03-03]** Metadata section removed from Claude specs (platform doesn't support it)
- **[03-03]** High-complexity orchestrators (900+ lines) migrate successfully
- **[03-03]** Parallel Task spawning preserved through spec → generated output
- **[03-03]** Template system handles complex orchestrators without modification
- **[04-01]** Claude skills output to .claude/get-shit-done/ per claudeAdapter.getTargetDirs()
- **[04-01]** Checkpoint continuation pattern: spawn → checkpoint → respawn with @-reference to prior state
- **[04-01]** Sequential spawning documented (NOT parallel like Phase 3 orchestrators)
- **[04-02]** Prose spawn descriptions converted to explicit Task() calls (enables validation of spawn count and focus)
- **[04-02]** Focus parameter differentiation preferred over multiple agent types (single gsd-codebase-mapper with <focus>)
- **[04-02]** @-references to workflow files preserved through template system
- **[04-03]** Frontmatter metadata section removed from skills (Claude doesn't support, per 03-02)
- **[04-03]** Tools must use platform conditionals with simple arrays (NOT object arrays with name/required/reason)
- **[04-03]** Side fixes for blocking issues acceptable when same root cause (gsd-map-codebase fixed with gsd-debug)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-22T23:22:04Z
Stopped at: Completed 04-03-PLAN.md (debug migration, Wave 2 complete)
Resume file: None
