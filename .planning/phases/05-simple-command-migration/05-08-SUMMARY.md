---
phase: 05-simple-command-migration
plan: 08
subsystem: orchestration
tags: [routing, progress, file-counting, decision-tree, hub-command]

# Dependency graph
requires:
  - phase: 05-01 through 05-07
    provides: All 11 routed commands (verify-work, discuss-phase, check-todos, milestone lifecycle)
  - phase: 03-high-complexity-orchestrators
    provides: Core orchestrators (new-project, new-milestone, execute-phase, plan-phase)
  - phase: 04-mid-complexity-commands
    provides: Debug and research commands
provides:
  - Central progress routing hub that intelligently routes to next action
  - File counting logic for project state detection
  - Priority-ordered routing decision tree (9 conditions)
  - Rich status reports with progress visualization
  - Routes to 11 different commands based on project state
affects: [user-workflow, command-discovery, phase-06-utility-commands]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Priority-ordered routing (UAT gaps → execution → planning → todos → debug)
    - File counting for state detection (plans, summaries, UAT, todos, debug)
    - Fallback routing with alternatives
    - Visual progress bars with completion percentage

key-files:
  created:
    - specs/skills/gsd-progress/SKILL.md
    - .claude/get-shit-done/gsd-progress/SKILL.md
  modified: []

key-decisions:
  - "Route by displaying command suggestions, not auto-executing (preserves user control)"
  - "Priority 1 is UAT gaps (quality over velocity)"
  - "Include 11 commands as routes (comprehensive coverage)"
  - "File counting handles 0 files gracefully (no errors on fresh projects)"
  - "Recursive progress pattern for phase transitions (seamless flow)"

patterns-established:
  - "Hub command pattern: Central routing point for workflow automation"
  - "State-based routing: File counts determine next action"
  - "Graceful degradation: Missing files don't crash, just return fallback routes"

# Metrics
duration: 6min
completed: 2026-01-23
---

# Phase 5 Plan 08: Batch 8 - Progress Routing Hub

**Central routing hub with 11 command paths, priority-ordered decision tree, and file counting for intelligent workflow automation**

## Performance

- **Duration:** 6 minutes
- **Started:** 2026-01-23T10:47:50Z
- **Completed:** 2026-01-23T10:54:32Z
- **Tasks:** 4/4 completed
- **Files modified:** 2

## Accomplishments

- Migrated progress command with complete routing logic (11 routes, 9 priority conditions)
- Validated all routing dependencies exist before migration (11 commands verified)
- Generated skill with all file counting and routing logic intact (481 lines)
- Validated all routing paths are callable (prevents "command not found" errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: verify-all-routed-commands-exist** - Verification only (no commit)
2. **Task 2: migrate-progress-command** - `942184d` (feat)
3. **Task 3: generate-and-test-progress-skill** - `0400e66` (feat)
4. **Task 4: validate-routing-paths** - `8908c57` (test)

**Plan metadata:** [pending]

## Files Created/Modified

- `specs/skills/gsd-progress/SKILL.md` - Progress routing hub spec (484 lines)
- `.claude/get-shit-done/gsd-progress/SKILL.md` - Generated skill (481 lines)

## Decisions Made

**Route presentation over auto-execution:**
- Display command suggestions (`/gsd:execute-phase`) rather than auto-executing
- Preserves user control and transparency
- Follows legacy command pattern

**Priority 1: UAT gaps:**
- Quality over velocity - if UAT has diagnosed gaps, fix them first
- Prevents accumulating technical debt
- Ensures phase completion includes quality verification

**11 routes for comprehensive coverage:**
- new-project (no .planning/)
- new-milestone (between milestones)
- plan-phase --gaps (UAT gaps)
- execute-phase (unexecuted plans)
- complete-milestone (milestone complete)
- discuss-phase / plan-phase / research-phase (planning variants)
- verify-work / list-phase-assumptions (alternatives)
- check-todos (pending todos)
- debug (active debug sessions)

**File counting with graceful degradation:**
- Handles 0 counts without errors
- 2>/dev/null redirects prevent crashes on missing directories
- Fallback routes when no clear action

## Deviations from Plan

None - plan executed exactly as written.

Plan was correctly sequenced as Wave 4 (MUST GO LAST) because all 11 routed commands needed to exist first. Verification confirmed all dependencies present before proceeding.

## Technical Implementation

**Routing decision tree (priority order):**

1. UAT_WITH_GAPS > 0 → plan-phase --gaps
2. SUMMARY_COUNT < PLAN_COUNT → execute-phase
3. Phase complete + last phase → complete-milestone
4. Phase complete + more phases → next phase
5. PLAN_COUNT = 0 + has context → plan-phase
6. PLAN_COUNT = 0 + no context → discuss-phase
7. TODO_COUNT > 0 → check-todos
8. DEBUG_COUNT > 0 → debug
9. Fallback → suggest completion/new-milestone/verify

**File counting implementation:**

```bash
PLAN_COUNT=$(ls -1 "${PHASE_DIR}"/*-PLAN.md 2>/dev/null | wc -l)
SUMMARY_COUNT=$(ls -1 "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null | wc -l)
UAT_WITH_GAPS=$(grep -l "status: diagnosed" "${PHASE_DIR}"/*-UAT.md 2>/dev/null | wc -l)
TODO_COUNT=$(ls -1 .planning/todos/pending/*.md 2>/dev/null | wc -l)
DEBUG_COUNT=$(ls -1 .planning/debug/*-DEBUG.md 2>/dev/null | grep -v "RESOLVED" | wc -l)
```

**Status report components:**

- Project name from PROJECT.md
- Progress bar (10 blocks: █████░░░░░)
- Recent work (last 2-3 SUMMARY files)
- Current position (phase, plan, status)
- Key decisions from STATE.md
- Blockers/concerns from STATE.md
- Pending todos count (if > 0)
- Active debug sessions count (if > 0)
- Next action recommendation

## Validation Results

✅ All 11 routed commands exist in specs/skills/
✅ All 11 routing targets present in generated skill
✅ File counting logic validated (handles 0 files gracefully)
✅ Tools formatted correctly (Read, Bash, Task)
✅ Routing logic intact (route_to_next_action step)
✅ Progress command ready for use

## Next Phase Readiness

**Phase 5 Wave 4 complete:**
- Progress command migrated (last Phase 5 command)
- All routing dependencies satisfied
- Ready for Wave 5 (E2E verification)

**Phase 6 (Utility Commands) can now proceed:**
- Progress hub provides workflow automation
- All core orchestrators and planning commands available
- Utility commands can leverage progress for testing

**Testing priority for Wave 5:**
Focus E2E verification on progress routing paths - this is the highest-risk command in Phase 5 due to:
- 11 routing targets (complexity)
- File counting dependencies (state detection)
- Priority-ordered logic (decision tree)
- Central workflow role (user-facing hub)
