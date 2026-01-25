---
phase: 03-high-complexity-orchestrators
plan: 03
subsystem: orchestration
tags: [gsd-new-project, gsd-new-milestone, parallel-research, task-spawning, template-system]

# Dependency graph
requires:
  - phase: 03-02
    provides: execute-phase migration pattern proving template system works for orchestrators
provides:
  - Complete gsd-new-project and gsd-new-milestone specs
  - Parallel research spawning patterns (4 Task calls per command)
  - Generated Claude skills for both orchestrators
  - Validated template system handles complex orchestrators
affects: [03-04, E2E testing, project-initialization-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Folder-per-skill structure (specs/skills/gsd-*/SKILL.md)
    - Simple array tools format for Claude platform
    - Preserved rich context injection (<research_type>, <milestone_context>)
    - Structured return parsing (## ROADMAP CREATED)

key-files:
  created:
    - specs/skills/gsd-new-project/SKILL.md
    - specs/skills/gsd-new-milestone/SKILL.md
    - .claude/skills/gsd-new-project/SKILL.md
    - .claude/skills/gsd-new-milestone/SKILL.md
  modified: []

key-decisions:
  - "Remove metadata section from specs (Claude doesn't support it per 03-02 decisions)"
  - "Use simple array tools format not object arrays (per 03-02 decisions)"
  - "Preserve all parallel spawning patterns (6-7 Task calls)"
  - "Keep rich context injection XML structure intact"

patterns-established:
  - "High-complexity orchestrators follow same migration pattern as execute-phase"
  - "Template system handles 900+ line orchestrators without issues"
  - "Parallel Task spawning preserved through spec → generated output"

# Metrics
duration: 9min
completed: 2026-01-22
---

# Phase 03 Plan 03: Migrate new-project & new-milestone Orchestrators Summary

**Two complex orchestrators (891 and 717 lines) migrated preserving parallel research spawning (4 researchers + synthesizer + roadmapper) and structured return handling**

## Performance

- **Duration:** 9 min 30 sec
- **Started:** 2026-01-22T21:36:56Z
- **Completed:** 2026-01-22T21:46:26Z
- **Tasks:** 3/3
- **Files modified:** 4

## Accomplishments
- gsd-new-project spec created (916 lines) with complete frontmatter and body
- gsd-new-milestone spec created (743 lines) preserving milestone_context differences
- Both specs generated successfully via template system
- Parallel spawning patterns preserved (7 and 6 Task calls respectively)
- All @-references intact (9 and 12 references)
- Structured return parsing maintained (## ROADMAP CREATED/BLOCKED)

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate-new-project-spec** - `357dd9c` (feat)
2. **Task 2: migrate-new-milestone-spec** - `8e9b12a` (feat)
3. **Task 3: test-both-orchestrators-generation** - `fe7a0fa` (fix)

## Files Created/Modified
- `specs/skills/gsd-new-project/SKILL.md` - Complete orchestrator spec (916 lines)
- `specs/skills/gsd-new-milestone/SKILL.md` - Complete orchestrator spec (743 lines)
- `.claude/skills/gsd-new-project/SKILL.md` - Generated Claude skill
- `.claude/skills/gsd-new-milestone/SKILL.md` - Generated Claude skill

## Decisions Made
- **Removed metadata section:** Claude platform doesn't support metadata fields in frontmatter (per 03-02 decisions)
- **Simple tools array:** Changed from object arrays with name/required/reason to simple string arrays (per 03-02 decisions)
- **Preserved parallel spawning:** Kept all 4 researcher Task calls in single message for 5x speed improvement
- **Kept XML structure:** Rich context injection patterns maintained exactly as in legacy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incorrect tools format blocking generation**
- **Found during:** Task 3 (test-both-orchestrators-generation)
- **Issue:** Tools defined as object arrays `{name, required, reason}` caused "tool.startsWith is not a function" error
- **Fix:** Changed to simple string arrays per 03-02 decisions and template system requirements
- **Files modified:** specs/skills/gsd-new-project/SKILL.md, specs/skills/gsd-new-milestone/SKILL.md
- **Verification:** Both specs generated successfully
- **Committed in:** fe7a0fa (Task 3 commit)

**2. [Rule 1 - Bug] Metadata section blocking generation**
- **Found during:** Task 3 (test-both-orchestrators-generation)
- **Issue:** metadata section with {{generated}}/{{platform}}/{{version}} caused "Undefined variable" error
- **Fix:** Removed metadata section (Claude doesn't support per 03-02)
- **Files modified:** specs/skills/gsd-new-project/SKILL.md, specs/skills/gsd-new-milestone/SKILL.md
- **Verification:** Generation succeeded without metadata
- **Committed in:** fe7a0fa (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for template system compatibility. No functionality lost - metadata not used by Claude platform anyway. Tools format corrected to match established pattern from 03-02.

## Issues Encountered
None - migration followed 03-02 pattern exactly

## Next Phase Readiness
- Both orchestrators ready for E2E testing in 03-04
- Parallel spawning patterns validated through generation
- Structured return handling intact
- Ready to test full project initialization flow

---
*Phase: 03-high-complexity-orchestrators*
*Completed: 2026-01-22*
