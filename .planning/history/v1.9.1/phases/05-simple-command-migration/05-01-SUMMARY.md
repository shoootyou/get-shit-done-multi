---
phase: 05-simple-command-migration
plan: 01
subsystem: skills
tags: [spec-migration, reference-commands, claude, copilot, codex]

# Dependency graph
requires:
  - phase: 02-template-engine-integration
    provides: generateSkillsFromSpecs() function and template system
  - phase: 04-mid-complexity-commands
    provides: tools array format and platform compatibility patterns
provides:
  - Four reference-only command specs (gsd-help, gsd-verify-installation, gsd-list-milestones, gsd-whats-new)
  - Validated simple command migration pattern for Phase 5
  - Content preservation from legacy commands to specs
affects: [05-02, 05-03, 05-04, phase-5-completion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Reference-only command pattern (no file writes, no spawning)
    - Tools as simple string arrays for Claude compatibility
    - Removed metadata section from frontmatter (Claude platform doesn't support)

key-files:
  created:
    - specs/skills/gsd-help/SKILL.md
    - specs/skills/gsd-verify-installation/SKILL.md
    - specs/skills/gsd-list-milestones/SKILL.md
    - specs/skills/gsd-whats-new/SKILL.md
  modified:
    - specs/skills/gsd-help/SKILL.md (updated to current standards)

key-decisions:
  - "Tools must be simple arrays (not objects) for Claude platform compatibility"
  - "Metadata section removed from frontmatter (Claude doesn't support, per Phase 3/4 decisions)"
  - "Reference-only commands ideal for Wave 1 (no dependencies, validate migration tooling)"

patterns-established:
  - "Simple command migration: legacy body content preserved exactly in spec"
  - "Frontmatter standardization: name, description, skill_version, requires_version, platforms, tools, arguments"
  - "Content preservation validation: grep for key terms in generated output"

# Metrics
duration: 5.7min
completed: 2026-01-23
---

# Phase 5 Plan 01: Batch 1 - Reference Commands Summary

**Four reference-only commands migrated with exact content preservation (help, verify-installation, list-milestones, whats-new)**

## Performance

- **Duration:** 5.7 min
- **Started:** 2026-01-23T10:19:14Z
- **Completed:** 2026-01-23T10:24:54Z
- **Tasks:** 5
- **Files modified:** 4 specs created/updated

## Accomplishments

- Migrated 4 reference-only commands from legacy to spec format (help, verify-installation, list-milestones, whats-new)
- Updated gsd-help to current standards (was test case from Phase 1)
- All 4 commands generate successfully and preserve content exactly
- Validated simple command migration pattern for remaining Phase 5 work

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate help command** - `13fb54d` (feat)
2. **Task 2: Migrate verify-installation command** - `ece809e` (feat)
3. **Task 3: Migrate list-milestones command** - `d408a63` (feat)
4. **Task 4: Migrate whats-new command** - `ebf4c15` (feat)
5. **Task 5: Validate batch 1 migration** - Validation only (no code changes)

## Files Created/Modified

- `specs/skills/gsd-help/SKILL.md` - Command reference display (updated to current standards)
- `specs/skills/gsd-verify-installation/SKILL.md` - Installation diagnostics with CLI detection
- `specs/skills/gsd-list-milestones/SKILL.md` - Milestone registry table display
- `specs/skills/gsd-whats-new/SKILL.md` - Version comparison and changelog display

All files generate to `~/Library/Application Support/Claude/get-shit-done/{command}/SKILL.md`

## Decisions Made

None - followed plan as specified. Applied established patterns from Phase 3/4:
- Tools as simple arrays (not objects with name/required/reason)
- Removed metadata section from frontmatter
- skill_version and requires_version in frontmatter for validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed metadata section from frontmatter**
- **Found during:** Task 1 (gsd-help generation)
- **Issue:** Template variables {{generated}}, {{platform}}, {{version}} in metadata caused generation failure
- **Fix:** Removed entire metadata section per Phase 3 decision (Claude doesn't support metadata fields in frontmatter)
- **Files modified:** specs/skills/gsd-help/SKILL.md
- **Verification:** Generation succeeded after removal
- **Committed in:** 13fb54d (Task 1 commit)

**2. [Rule 2 - Missing Critical] Converted tools from object format to array format**
- **Found during:** Task 1 (gsd-help generation)
- **Issue:** Tools defined as objects with name/required/reason caused "tool.startsWith is not a function" error
- **Fix:** Changed to simple string arrays per Phase 3/4 decisions
- **Files modified:** All 4 skill specs
- **Verification:** All 4 commands generated successfully
- **Committed in:** Each task commit (13fb54d, ece809e, d408a63, ebf4c15)

---

**Total deviations:** 2 auto-fixed (both missing critical for Claude compatibility)
**Impact on plan:** Both fixes necessary for generation. Applied established patterns from prior phases. No scope creep.

## Issues Encountered

None - all 4 commands migrated and validated successfully in first attempt after applying Phase 3/4 compatibility patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Reference command pattern validated (4/4 successful)
- Template system handles simple commands correctly
- Content preservation verified programmatically
- Ready for Plan 05-02 (Batch 2: Status/utility commands)
- Phase 5 progress: 4/21 commands migrated (~19%)

---
*Phase: 05-simple-command-migration*
*Completed: 2026-01-23*
