# Phase 10: Milestone Completion Workflow Unification - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Unify milestone completion commands into streamlined workflow that moves directly to history/, uses ask_user for confirmations, and deprecates redundant commands. This phase refactors existing completion, archive, restore, and list commands into a unified approach.

</domain>

<decisions>
## Implementation Decisions

### Archive directory structure
- Mirrored structure: preserve .planning/ subdirectory organization in history/
- Format: `.planning/history/v{X.Y}/` contains subdirectories (phases/, research/, todos/)
- Files keep original names (ROADMAP.md, STATE.md) — version is in directory name
- Archive everything: Move ROADMAP, REQUIREMENTS, STATE, phases/, research/, todos/ to history/
- After archiving: workspace only contains PROJECT.md, MILESTONES.md, config.json, codebase/

### STATE.md handling
- Generate fresh STATE.md for each milestone
- Archive old STATE to history/v{X.Y}/STATE.md
- New milestone regenerates STATE from scratch (no continuity from archived STATE)
- STATE is milestone-specific, not cumulative across milestones

### User confirmation flow
- Two confirmations total:
  1. Combined readiness + archive move confirmation (shows milestone stats + what will be archived)
  2. Git tag creation confirmation (separate ask_user for "Create git tag vX.Y?")
- No confirmation for individual file operations — bulk confirmation covers all moves
- Safety check before moving files to history/ (prevents accidental data loss)

### Deprecation messaging
- Block execution: Show message and exit (don't allow deprecated commands to run)
- Message format: Use GSD branded banner style (━━━ GSD ► DEPRECATED ━━━)
- Content: Contextual explanation that complete-milestone now handles archiving directly to history/
- Keep skill files: Modify gsd-archive-milestone and gsd-restore-milestone to show deprecation notice (don't delete files)
- Workflow files: Remove deprecated workflow files from templates/get-shit-done/workflows/

### List milestones display
- Information shown: Version, name, date completed, key accomplishments (2-3 bullets)
- Sort order: Most recent first (v2.1, v2.0, v1.0)
- Data source: Read from MILESTONES.md registry (not scanning history/ directory)
- No interactive actions: Just display info (no "view details" or "compare" actions)
- Updated for new structure: No restore references (that workflow is deprecated)

### Claude's Discretion
- Exact banner formatting and spacing in deprecation messages
- Progress indicators during file moves
- Error handling for partial archive failures
- Git commit message exact wording (follow conventions)
- Accomplishment extraction algorithm from SUMMARY files

</decisions>

<specifics>
## Specific Ideas

- Deprecation banner should match style of success banners (e.g., "GSD ► MILESTONE INITIALIZED ✓")
- After complete-milestone, workspace should be "clean" — ready for new-milestone to start fresh
- new-milestone workflow expects: PROJECT.md, MILESTONES.md, STATE.md (fresh), config.json
- Archive to history/ replaces current milestones/ archive approach

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-milestone-completion-workflow-unification*
*Context gathered: 2026-01-31*
