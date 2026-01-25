---
phase: 05-simple-command-migration
plan: 03
subsystem: roadmap-management
tags: [roadmap, phase-management, decimal-phases, renumbering, gsd-commands]

# Dependency graph
requires:
  - phase: 01-foundation-schema
    provides: Folder-per-skill structure and SKILL.md spec format
  - phase: 02-template-engine-integration
    provides: generateSkillsFromSpecs() and skill generation pipeline
provides:
  - gsd-add-phase: Append integer phases to current milestone
  - gsd-insert-phase: Insert decimal phases for urgent work (72.1, 72.2)
  - gsd-remove-phase: Delete phases and renumber subsequent phases
affects:
  - Phase 6: Todo management commands depend on roadmap structure
  - Phase 7: Advanced features may use phase manipulation
  - Future planning workflows require stable roadmap manipulation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Decimal phase numbering (72, 72.1, 72.2, 73) for urgent insertions
    - Phase renumbering after deletion (18→17, 19→18)
    - Directory and file renaming with phase number updates

key-files:
  created:
    - specs/skills/gsd-add-phase/SKILL.md
    - specs/skills/gsd-insert-phase/SKILL.md
    - specs/skills/gsd-remove-phase/SKILL.md
  modified: []

key-decisions:
  - "Preserve exact decimal numbering logic from legacy (72 → 72.1, 72.1 → 72.2)"
  - "Maintain (INSERTED) marker for decimal phases to identify urgent work"
  - "Keep validation that prevents removing completed work (SUMMARY.md check)"
  - "Preserve renumbering logic including directory and file renames"
  - "Git commit as historical record, no STATE.md 'Roadmap Evolution' notes"

patterns-established:
  - "ROADMAP.md manipulation with decimal phase support"
  - "Sequential phase renumbering after deletions"
  - "Directory structure updates synchronized with roadmap changes"

# Metrics
duration: 5m 26s
completed: 2026-01-23
---

# Phase 5 Plan 03: Batch 3 - Phase Management Commands

**Three roadmap manipulation commands migrated with decimal phase logic and comprehensive renumbering preserved**

## Performance

- **Duration:** 5m 26s
- **Started:** 2026-01-23T10:28:00Z
- **Completed:** 2026-01-23T10:33:18Z
- **Tasks:** 4/4 completed
- **Files modified:** 3 new specs created

## Accomplishments
- Migrated all three phase management commands (add, insert, remove)
- Preserved critical decimal phase numbering logic (72.1, 72.2)
- Maintained comprehensive renumbering system for phase deletion
- All commands generate successfully and pass validation

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate-add-phase-command** - `99c4b07` (feat)
2. **Task 2: migrate-insert-phase-command** - `b9880fd` (feat)
3. **Task 3: migrate-remove-phase-command** - `5ce97df` (feat)
4. **Task 4: validate-batch-3-migration** - Validation passed (all tests ✓)

## Files Created/Modified
- `specs/skills/gsd-add-phase/SKILL.md` - Append integer phase to end of milestone
- `specs/skills/gsd-insert-phase/SKILL.md` - Insert decimal phase for urgent work
- `specs/skills/gsd-remove-phase/SKILL.md` - Delete phase and renumber subsequent phases

## Decisions Made

**1. Decimal phase numbering preserved exactly**
- Legacy logic: 72 → 72.1, 72.1 → 72.2, 72.2 → 72.3
- Critical for urgent work insertion without full roadmap renumbering
- Maintains execution order while allowing flexibility

**2. (INSERTED) marker maintained**
- Decimal phases marked as "(INSERTED)" in roadmap
- Helps identify urgent work vs. planned phases
- No behavioral difference, just documentation

**3. Comprehensive validation in remove-phase**
- Prevents removing completed work (checks for SUMMARY.md files)
- Prevents removing current or past phases
- User confirmation required before destructive operation

**4. Renumbering includes directories and files**
- Phase directories renamed (18-dashboard → 17-dashboard)
- Plan files renamed (18-01-PLAN.md → 17-01-PLAN.md)
- SUMMARY files renamed if they exist
- ROADMAP.md updated with all references

**5. Git commit as historical record**
- No "Roadmap Evolution" notes in STATE.md for removals
- Git commit message preserves what was removed
- Cleaner state management, full history in git

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

⚠️ **CRITICAL: Test with roadmap backups before production use**

These commands modify ROADMAP.md structure directly:
- `gsd-add-phase`: Appends to roadmap (safe)
- `gsd-insert-phase`: Inserts decimal phases (medium risk)
- `gsd-remove-phase`: Deletes and renumbers (high risk)

Recommended testing:
```bash
# Backup roadmap before testing
cp .planning/ROADMAP.md .planning/ROADMAP.backup.md

# Test add-phase
/gsd:add-phase Test new phase

# Test insert-phase (decimal)
/gsd:insert-phase 5 Urgent fix

# Verify decimal created
grep "Phase 5\." .planning/ROADMAP.md

# Restore backup if needed
mv .planning/ROADMAP.backup.md .planning/ROADMAP.md
```

## Validation Results

All critical validations passed:

✓ Specs exist (3/3)
✓ Phase calculation logic intact (add-phase)
✓ Decimal numbering logic intact (insert-phase)
✓ Renumbering logic intact (remove-phase)
✓ Validation logic intact (prevents removing completed work)
✓ All skills generate successfully
✓ Outputs created in .claude/get-shit-done/

## Next Phase Readiness

**Phase 5 continues with Plan 04 (Batch 4: Todo management commands)**

Dependencies satisfied:
- ✓ Roadmap structure established
- ✓ Phase manipulation commands available
- ✓ Template system proven with complex logic

Ready for next batch:
- gsd-add-todo
- gsd-check-todos
- gsd-resolve-todo

**Current progress: 9/21 commands migrated (43%)**
