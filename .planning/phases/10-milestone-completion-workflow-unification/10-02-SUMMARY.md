---
phase: 10-milestone-completion-workflow-unification
plan: 02
subsystem: workflow
tags: [gsd, milestone, deprecation, archive, restore, list, ai-first, registry]

# Dependency graph
requires:
  - phase: 10-01
    provides: Unified milestone completion workflow with history/ archiving
provides:
  - Deprecated archive-milestone and restore-milestone commands with blocking messages
  - Registry-based list-milestones (reads MILESTONES.md directly)
  - Clear migration path to unified complete-milestone workflow
affects: [milestone-workflow, user-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deprecation blocking with branded banners"
    - "Registry-based milestone listing (no directory scanning)"
    - "Educational deprecation messages with alternatives"

key-files:
  created: []
  modified:
    - templates/skills/gsd-archive-milestone/SKILL.md
    - templates/skills/gsd-restore-milestone/SKILL.md
    - templates/skills/gsd-list-milestones/SKILL.md

key-decisions:
  - "Block deprecated commands immediately (no operations executed)"
  - "Show bash alternatives in restore-milestone deprecation message"
  - "List-milestones reads registry directly (simple cat, no parsing)"
  - "Use GSD branded deprecation banners for consistency"

patterns-established:
  - "Deprecation blocking pattern: Show message and exit immediately"
  - "Educational deprecation: Explain old vs new workflow"
  - "Registry-first listing: Read MILESTONES.md directly"
  - "Template variables for cross-platform support"

# Metrics
duration: 5min
completed: 2026-01-31
---

# Phase 10 Plan 02: Deprecate Archive/Restore Commands and Update List-Milestones Summary

**Deprecated archive-milestone and restore-milestone with blocking messages, updated list-milestones to read from MILESTONES.md registry**

## Performance

- **Duration:** 5 minutes
- **Started:** 2026-01-31T19:42:15Z
- **Completed:** 2026-01-31T19:47:31Z
- **Tasks:** 3/3 completed
- **Files modified:** 3

## Accomplishments

- Replaced archive-milestone SKILL.md with deprecation blocking message
- Replaced restore-milestone SKILL.md with deprecation blocking message showing bash alternatives
- Updated list-milestones SKILL.md to read from MILESTONES.md registry (simple cat, no parsing)
- All deprecation messages use GSD branded banner format
- Deprecated commands exit immediately without executing operations

## Task Commits

Each task was committed atomically:

1. **Task 1: Deprecate archive-milestone with blocking message** - `eb04107` (refactor)
   - Replaced entire SKILL.md with deprecation notice
   - Added branded deprecation banner (GSD ► DEPRECATED)
   - Explained old vs new workflow clearly
   - Directed users to complete-milestone command
   - Exit immediately without operations
   - Template variables for cross-platform support

2. **Task 2: Deprecate restore-milestone with blocking message** - `d394f74` (refactor)
   - Replaced entire SKILL.md with deprecation notice
   - Added branded deprecation banner (GSD ► DEPRECATED)
   - Explained why restore is no longer needed
   - Showed bash alternatives (ls, cat, git show)
   - Exit immediately without operations
   - Template variables for cross-platform support

3. **Task 3: Update list-milestones to read from registry** - `dc46ae3` (refactor)
   - Registry-based listing (reads MILESTONES.md directly)
   - Simple cat command (no complex parsing)
   - Added branded banner (GSD ► MILESTONE HISTORY)
   - Helpful bash examples for accessing archives
   - Removed all restore-milestone references
   - Template variables for cross-platform support

## Files Created/Modified

- `templates/skills/gsd-archive-milestone/SKILL.md` - Deprecation blocking message with migration path
- `templates/skills/gsd-restore-milestone/SKILL.md` - Deprecation blocking message with bash alternatives
- `templates/skills/gsd-list-milestones/SKILL.md` - Registry-based listing with simple cat command

## Decisions Made

1. **Block deprecated commands immediately**
   - Rationale: Prevent confusion by showing clear message and exiting without operations
   - Impact: Users immediately understand commands are deprecated and see migration path

2. **Show bash alternatives in restore-milestone deprecation**
   - Rationale: Archives are permanent in history/, users just need to know how to access them
   - Impact: Educational message teaches users to use standard bash commands (ls, cat, git show)

3. **List-milestones reads registry directly with cat**
   - Rationale: MILESTONES.md is already formatted for display, no parsing needed
   - Impact: Simpler implementation, easier to maintain, faster execution

4. **Use GSD branded deprecation banners**
   - Rationale: Consistent with other GSD commands, professional appearance
   - Impact: Users immediately recognize official deprecation notice

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Next plan in Phase 10 or Phase 11 planning

**Provides:**
- Deprecated archive/restore commands with clear blocking behavior
- Registry-based milestone listing
- Migration path documented in deprecation messages
- Educational content for users transitioning to new workflow

**Blockers:** None

**Technical Debt:** None

## Integration Notes

**For future phases:**
- Deprecated commands will show blocking messages and exit immediately
- Users directed to complete-milestone for unified workflow
- List-milestones shows simple registry display (no complex parsing)
- All deprecation messages use GSD branded banner format

**Testing checklist:**
- [ ] archive-milestone shows deprecation message and exits without operations
- [ ] restore-milestone shows deprecation message with bash alternatives
- [ ] list-milestones reads MILESTONES.md registry directly
- [ ] All commands use template variables ({{COMMAND_PREFIX}})
- [ ] Branded banners display correctly
- [ ] No deprecated command references in updated skills

---

*Phase: 10-milestone-completion-workflow-unification*  
*Plan: 02*  
*Status: Complete*  
*Date: 2026-01-31*
