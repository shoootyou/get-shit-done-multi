# GSD Milestone & Codebase Management Enhancements

## What This Is

A set of improvements to the Get-Shit-Done (GSD) workflow system that enables milestone archiving with full traceability, cleaner codebase mapping that excludes infrastructure directories, and automated codebase refresh after milestone completion. This allows GSD projects to manage long-term evolution by archiving completed milestones into `.planning/history/[milestone-name]/` while maintaining clean state for new work cycles.

## Core Value

Completed milestones must be archived with full historical traceability while enabling a clean slate for next milestone planning, and codebase analysis must accurately reflect application code only (excluding tooling/infrastructure).

## Requirements

### Validated

- ✓ GSD workflow system exists with commands like verify-milestone, map-codebase, new-project — existing
- ✓ .planning/ directory structure for project state management — existing
- ✓ Parallel gsd-codebase-mapper agents for codebase analysis — existing
- ✓ Command system with dynamic loading from .github/skills/get-shit-done/commands/ — existing

### Active

- [ ] archive-milestone command created in .github/skills/get-shit-done/commands/gsd/
- [ ] archive-milestone validates no uncommitted git changes before proceeding
- [ ] archive-milestone moves ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md, research/, phases/ to .planning/history/[milestone-name]/
- [ ] archive-milestone preserves .planning/codebase/ (keeps last map active)
- [ ] archive-milestone creates/updates .planning/MILESTONES.md with: name, date, archive location, requirements completed, key commits
- [ ] archive-milestone commits archival with descriptive message including milestone name
- [ ] verify-milestone workflow modified to invoke archive-milestone automatically after successful verification
- [ ] map-codebase workflow modified to exclude: .claude, .github, .codex, node_modules, .git, dist, build, out, target, coverage
- [ ] map-codebase exclusion list configurable via .planning/map-config.json (optional)
- [ ] archive-milestone suggests running /gsd:map-codebase after completion (user decides)
- [ ] MILESTONES.md template created with proper structure for tracking archived milestones

### Out of Scope

- Automated rollback/restore from archived milestones — manual restoration if needed
- Archive compression or storage optimization — clarity over space savings
- Cross-milestone dependency tracking — each milestone is self-contained
- Incremental codebase mapping — always full re-analysis for accuracy
- Archive search/query functionality — rely on git history and MILESTONES.md
- Custom archive locations outside .planning/history/ — standardized structure only

## Context

**Existing System:**
- GSD is a CLI-agnostic meta-prompting platform for managing software projects
- Current .planning/ structure: PROJECT.md, STATE.md, ROADMAP.md, REQUIREMENTS.md, research/, phases/, codebase/
- map-codebase spawns 4 parallel gsd-codebase-mapper agents to analyze tech, architecture, quality, concerns
- Commands are markdown files in .github/skills/get-shit-done/commands/gsd/
- Workflows are referenced from commands via execution_context
- Codebase currently in TypeScript/JavaScript using Node.js

**Problem:**
1. **Milestone clutter**: Completed milestones remain in .planning/, mixing old and new work
2. **Lost history**: No structured way to reference what was built in past milestones
3. **Polluted codebase maps**: Infrastructure directories (.github, .codex, .claude) analyzed as application code
4. **No transition flow**: No clear handoff from milestone completion to next cycle

**User Need:**
- Clean separation between completed milestones and active work
- Full historical traceability: where to find original planning docs for each milestone
- Accurate codebase analysis reflecting only application code
- Smooth workflow: verify → archive → refresh map → start next milestone

**Current Codebase (from map):**
- Pure Node.js implementation (no external frameworks)
- CLI adapter pattern supporting Claude Code, GitHub Copilot CLI, Codex CLI
- Command system with dynamic loading from markdown files
- State management with file-based persistence in lib-ghcc/
- 4 parallel mapper agents pattern established in map-codebase workflow

## Constraints

- **Compatibility**: Must integrate seamlessly with existing GSD command structure (markdown files)
- **CLI-agnostic**: Must work across Claude Code, GitHub Copilot CLI, Codex CLI
- **Safety**: Must validate clean git state before archiving to prevent data loss
- **Workflow integration**: archive-milestone invokable both manually and from verify-milestone
- **File preservation**: .planning/codebase/ must NOT be archived (keep last map active)
- **Documentation**: MILESTONES.md must provide clear references to archived milestone locations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Archive to .planning/history/ not .planning/archive/ or .planning/evolution/ | "history" clearly communicates chronological milestone progression | — Pending |
| Use milestone name for folder (not sequential numbers) | Descriptive names more meaningful than milestone-1, milestone-2 | — Pending |
| Preserve .planning/codebase/ during archive | Keep most recent codebase map active for next milestone planning | — Pending |
| Exclude build/dist/coverage from map-codebase | These are generated artifacts, not source code to analyze | — Pending |
| Validate git clean state before archive | Safety-first: prevent accidental loss of uncommitted work | — Pending |
| Suggest (not auto-run) map-codebase refresh | Give user control over when to re-analyze; might want to review first | — Pending |
| Track key commits in MILESTONES.md | Provides git-level traceability beyond file archives | — Pending |
| invoke archive-milestone at end of verify-milestone | Automate the happy path while keeping manual command available | — Pending |

---
*Last updated: 2026-01-20 after initialization (brownfield project)*
