# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Specs in /specs/skills/ must be single source of truth for GSD commands across 3 platforms (Copilot, Claude, Codex)
**Current focus:** Phase 2 - Template Engine Integration

## Current Position

Phase: 5.1 of 8.5 (Fix git identity preservation in agents) [INSERTED]
Plan: 2 of 2 (Phase complete)
Status: Phase 5.1 complete - All agents preserve user git identity
Last activity: 2026-01-23 — Completed 5.1-02-PLAN.md (Update Agent Git Commits)

Progress: [█████░░░░░] ~59% (5.1/8.5 phases, 29 plans total)

## Performance Metrics

**Velocity:**
- Total plans completed: 29
- Average duration: 5.5 min
- Total execution time: 2.67 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-schema | 2 | 24.3 min | 12.1 min |
| 02-template-engine-integration | 5 | 13.1 min | 2.6 min |
| 03-high-complexity-orchestrators | 5 | 38.8 min | 7.8 min |
| 04-mid-complexity-commands | 5 | 21.2 min | 4.2 min |
| 05-simple-command-migration | 9 | 51.3 min | 5.7 min |
| 5.1-fix-git-identity | 2 | 6.4 min | 3.2 min |

**Recent Trend:**
- Last 5 plans: 5.4 min (05-03), 4.7 min (05-04), 5.8 min (05-05), 2.4 min (5.1-01), 4.0 min (5.1-02)
- Trend: Phase 5.1 complete - efficient infrastructure updates (avg 3.2 min)

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
- **[04-04]** plan-phase anchor command migration: ALL 8 CRITICAL validations must pass (13 downstream dependencies)
- **[04-04]** Verification loop preserved exactly (3-iteration max, user intervention, return patterns)
- **[04-04]** Flag matrix preserved (4 flags: --research, --skip-research, --gaps, --skip-verify)
- **[05-01]** Reference-only commands ideal for Wave 1 (no dependencies, validate migration tooling)
- **[05-01]** Tools must be simple arrays for Claude compatibility (not objects with name/required/reason)
- **[05-01]** Metadata section removed from frontmatter (Claude platform doesn't support)
- **[05-02]** Workflow @-references preserved to ~/.claude/get-shit-done/workflows/ (enables reuse across commands)
- **[05-02]** Handoff file path: .planning/phases/XX-name/.continue-here.md (session continuity pattern)
- **[05-02]** Workflow delegation pattern: Commands reference external .md files for detailed process logic
- **[05-03]** Decimal phase numbering preserved (72 → 72.1, 72.1 → 72.2) for urgent work insertion
- **[05-03]** (INSERTED) marker maintained for decimal phases (documentation, no behavioral difference)
- **[05-03]** Renumbering includes directories and files (18-dashboard → 17-dashboard, 18-01-PLAN.md → 17-01-PLAN.md)
- **[05-03]** Git commit as historical record for removals (no STATE.md "Roadmap Evolution" notes)
- **[05-03]** Validation prevents removing completed work (checks for SUMMARY.md files)
- **[05-05]** verify-work spawns gsd-debugger for bugs, gsd-planner for gaps (dual spawning based on triage)
- **[05-05]** Conversational UAT: one test at a time, plain text responses, severity inferred from description
- **[05-05]** discuss-phase references external workflow and template files via @-references
- **[05-05]** Domain-aware gray areas: analyze phase goal to generate specific discussion topics (not generic)
- **[05-06]** Bash variable syntax (\${version}) instead of Mustache ({{version}}) to avoid template engine conflicts
- **[05-06]** Milestone lifecycle dependency chain: audit must pass before completion (enforced via status checks)
- **[05-06]** Spawning with full context: Pass @-references to all relevant files for spawned agents (requirements, summaries, verification)
- **[05-06]** Archive/restore cycle: milestones/ for active, history/ for long-term storage with recovery option
- **[05-07]** Git-based update workflow (fetch, compare versions, pull) instead of npm-based
- **[05-07]** Tools format must be simple string arrays for Claude compatibility (not object arrays with name field)
- **[05-08]** Route by displaying command suggestions, not auto-executing (preserves user control, follows legacy pattern)
- **[05-08]** Priority 1 is UAT gaps in progress routing (quality over velocity, prevents tech debt)
- **[05-08]** Progress command includes 11 routes for comprehensive workflow coverage (all major GSD commands)
- **[05-08]** File counting with graceful degradation (handles 0 files without errors, 2>/dev/null redirects)
- **[5.1-01]** Git environment variables for identity override (GIT_AUTHOR_*, GIT_COMMITTER_* highest precedence)
- **[5.1-01]** Python for JSON manipulation in workflows (universally available, no jq dependency)
- **[5.1-01]** Three git identity sources supported (global, config, local - flexibility for different workflows)
- **[5.1-01]** Phase 5.5 insertion in new-project (between workflow preferences and research, before automated commits)
- **[5.1-02]** Helper sourcing with type check pattern (prevents redundant sourcing: if ! type func; then source)
- **[5.1-02]** commit_as_user() replaces all bare git commit commands in agents (7 total across 5 agents)
- **[5.1-02]** Git Identity Preservation section added to all committing agents (after role, documents helper usage)

### Pending Todos

None yet.

### Roadmap Evolution

- Phase 5.1 inserted after Phase 5: Fix git identity preservation in agents (URGENT)
  Reason: Agents are overriding user git identity when committing. Must fix specs, revert incorrect generated agent changes, add git config to project setup workflow, and update all affected agents.

### Blockers/Concerns

None - Phase 5.1 complete. All agents now preserve user git identity.

## Session Continuity

Last session: 2026-01-23T18:02:52Z
Stopped at: Closed all debug sessions (moved to resolved/)
Resume file: None
