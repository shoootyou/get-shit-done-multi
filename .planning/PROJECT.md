# GSD Milestone Lifecycle Management

## What This Is

A set of enhancements to the get-shit-done (GSD) CLI system that improves milestone lifecycle management through clean archiving, intelligent codebase filtering, and automatic refresh capabilities. These features keep `.planning/` focused on current work while preserving historical context and ensuring codebase analysis stays accurate as projects evolve.

## Core Value

When a milestone completes, `.planning/` must cleanly reset to focus on the next milestone while preserving full historical context in a structured archive.

## Requirements

### Validated

- ✓ Multi-layer CLI orchestration system with agent delegation — existing
- ✓ State management with locking and session tracking — existing
- ✓ Markdown-as-code for command and agent definitions — existing
- ✓ Dynamic command discovery and registration — existing
- ✓ Codebase mapping via `/gsd:map-codebase` — existing

### Active

- [ ] Archive completed milestone to `.planning/archives/v{version}/` with all planning artifacts
- [ ] Update `MILESTONES.md` with references to archived milestone location
- [ ] Clean `.planning/` directory after archiving (complete reset for next milestone)
- [ ] Exclude tool/config folders from codebase mapping (`.claude`, `.github`, `.codex`, `.planning`, `node_modules`, `dist`, `build`)
- [ ] Automatically refresh codebase map after milestone archival as part of `/gsd:complete-milestone`
- [ ] Sobrescribir completamente el mapa anterior durante refresh (no preservar versiones anteriores)

### Out of Scope

- Manual refresh command — Refresh will only happen automatically during milestone completion
- Diff/comparison between map versions — Archive preserves old maps, but no tooling to compare
- Preservation of old maps in archives — Maps get completely replaced during refresh
- Interactive failure recovery — If archival fails, command should abort cleanly with clear error
- Configurability of excluded folders — List is hardcoded based on common patterns

## Context

**Technical environment:**
- Zero-dependency Node.js CLI tool using only built-ins
- Custom command system with markdown-based definitions
- File-based state storage in `.planning/` directory
- Supports Claude Code, GitHub Copilot, and Codex CLIs

**Current pain point:**
After completing a milestone, `.planning/` contains all historical phases, plans, and summaries. This creates clutter and makes it hard to see what's relevant for the next milestone. Additionally, codebase mapping incorrectly analyzes tool configuration folders as part of the application stack.

**Current codebase state:**
- Commands defined in `commands/gsd/` as markdown files
- Agents defined in `agents/` as markdown files  
- State management in `lib-ghcc/state-manager.js`
- `/gsd:complete-milestone` command exists but needs extension
- `/gsd:map-codebase` command exists but needs filtering logic

## Constraints

- **Tech stack**: Pure Node.js built-ins only (no external dependencies) — Maintains project's zero-dependency philosophy
- **Compatibility**: Must work across Claude Code, GitHub Copilot, and Codex CLIs — Existing cross-CLI architecture requirement
- **State safety**: Archival must be atomic (all-or-nothing) with directory locking — Prevents corruption from concurrent operations
- **Backward compatibility**: Existing projects without archives must continue working — Can't break existing workflows

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `.planning/archives/` structure | User preference for semantic versioning over evolution/milestone naming | — Pending |
| Archive everything, start clean | Reduces clutter maximally, keeps current work focused | — Pending |
| Automatic refresh on milestone completion | Ensures map is always current without manual intervention | — Pending |
| Overwrite old maps completely | Simplifies implementation, archives already preserve history | — Pending |
| Hardcode exclusion list | Common patterns unlikely to change, avoids configuration complexity | — Pending |

---
*Last updated: 2026-01-20 after initialization*
