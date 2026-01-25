---
phase: 05-simple-command-migration
plan: 06
subsystem: milestone-management
tags: [milestone, audit, lifecycle, integration, archival]

# Dependency graph
requires:
  - phase: 05-01
    provides: Reference commands batch established pattern
  - phase: 05-02
    provides: Workflow delegation pattern with @-references
  - phase: 04-01
    provides: gsd-planner migration completed
  - phase: 03-01
    provides: gsd-integration-checker available in specs/agents/
provides:
  - Five milestone lifecycle commands as cohesive set
  - Audit-to-completion dependency chain preserved
  - Integration checker and planner spawning patterns
  - Archive/restore cycle for milestone management
affects: [05-08-progress-routing, future-milestone-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Milestone lifecycle orchestration (audit → gaps → complete → archive → restore)"
    - "Cross-phase integration validation via spawned agents"
    - "Bash variable interpolation instead of Mustache for arguments"

key-files:
  created:
    - specs/skills/gsd-complete-milestone/SKILL.md
    - specs/skills/gsd-audit-milestone/SKILL.md
    - specs/skills/gsd-plan-milestone-gaps/SKILL.md
    - specs/skills/gsd-archive-milestone/SKILL.md
    - specs/skills/gsd-restore-milestone/SKILL.md
  modified: []

key-decisions:
  - "Bash variable syntax (\${version}) instead of Mustache ({{version}}) to avoid template engine conflicts"
  - "Spawning patterns preserved: audit → integration-checker, plan-gaps → planner"
  - "Dependency chain enforced: audit must pass before completion"
  - "Archive to history/ for long-term storage, restore for reactivation"

patterns-established:
  - "Argument interpolation: Use bash variables (\$1, \${arg}) in code, prose {arg} in output"
  - "Spawning with full context: Pass @-references to all relevant files (requirements, summaries, verification)"
  - "Status-driven flow routing: Audit status determines next command (passed → complete, gaps_found → plan-gaps)"

# Metrics
duration: 7min
completed: 2026-01-23
---

# Phase 5 Plan 06: Batch 6 - Milestone Lifecycle Summary

**Five milestone lifecycle commands migrated as cohesive set with audit-to-completion dependency chain and spawning patterns preserved**

## Performance

- **Duration:** 7 min (6 min execution + 1 min summary)
- **Started:** 2026-01-23T10:36:40Z
- **Completed:** 2026-01-23T10:43:33Z
- **Tasks:** 6 (5 migrations + 1 generation test)
- **Files modified:** 5 specs created
- **Commits:** 7 (5 feat + 2 fix)

## Accomplishments

- Five milestone lifecycle commands migrated (613 lines total)
- Dependency chain preserved: audit checks E2E → plan-gaps creates fix phases → complete archives → archive moves to history → restore reactivates
- Spawning patterns working: audit spawns gsd-integration-checker, plan-gaps spawns gsd-planner
- All skills generate successfully via install script
- Template syntax issue discovered and fixed for argument interpolation

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate-complete-milestone-command** - `4787686` (feat)
2. **Task 2: migrate-audit-milestone-command** - `91faadf` (feat)
3. **Task 3: migrate-plan-milestone-gaps-command** - `1a83df3` (feat)
4. **Task 4: migrate-archive-milestone-command** - `d5209f5` (feat)
5. **Task 5: migrate-restore-milestone-command** - `0fe5372` (feat)
6. **Bug fix: remove Mustache syntax** - `f327230` (fix)
7. **Bug fix: complete Mustache removal** - `3a6b79a` (fix)

## Files Created/Modified

Created:
- `specs/skills/gsd-complete-milestone/SKILL.md` (139 lines) - Check audit, archive milestone, update registry, git tag
- `specs/skills/gsd-audit-milestone/SKILL.md` (137 lines) - Spawn integration-checker for E2E validation
- `specs/skills/gsd-plan-milestone-gaps/SKILL.md` (122 lines) - Parse gaps, spawn planner for closure phases
- `specs/skills/gsd-archive-milestone/SKILL.md` (102 lines) - Move milestone to history/ for long-term storage
- `specs/skills/gsd-restore-milestone/SKILL.md` (113 lines) - Restore archived milestone to active workspace

## Decisions Made

**1. Bash variable syntax instead of Mustache**
- **Context:** Template engine treats `{{version}}` as variables to interpolate during generation
- **Decision:** Use bash variables `\${version}` in code blocks, prose `{version}` in output
- **Rationale:** Avoids template parsing errors while maintaining clarity about argument usage
- **Impact:** All five specs needed syntax correction before successful generation

**2. Preserve spawning patterns exactly**
- **Context:** audit-milestone and plan-milestone-gaps spawn other agents
- **Decision:** Maintain exact spawning calls with @-references to context files
- **Rationale:** Spawning is core to milestone orchestration, must work identically to legacy
- **Impact:** Integration-checker and planner receive full context for proper operation

**3. Status-driven flow routing**
- **Context:** Milestone completion depends on audit results
- **Decision:** Complete-milestone checks audit status, routes user based on gaps_found vs passed
- **Rationale:** Enforces quality gate before milestone archival
- **Impact:** Users cannot complete milestone with outstanding integration gaps

**4. Archive/restore cycle design**
- **Context:** Completed milestones need long-term storage but occasional reactivation
- **Decision:** Archive moves to history/, restore reverses, both update MILESTONES.md registry
- **Rationale:** Clean active workspace while preserving historical record with recovery option
- **Impact:** Milestone management lifecycle complete from audit to long-term archival

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Template engine treats `{{version}}` as undefined variable**
- **Found during:** Task 6 (generation test)
- **Issue:** Template engine tries to interpolate `{{version}}` during skill generation, throws "Undefined variable in template" error
- **Root cause:** Specs used Mustache-style `{{version}}` to show where arguments interpolate in generated output, but template engine processes all `{{...}}` patterns
- **Fix:** Changed all `{{version}}` to bash variables `\${version}` in code blocks and `{version}` in prose/output
- **Files modified:** All five SKILL.md files
- **Verification:** npm install generated all 27 skills successfully (was 21 generated, 5 failed before fix)
- **Committed in:** `f327230` (4 files), `3a6b79a` (complete-milestone final pass)

---

**Total deviations:** 1 bug fixed (template syntax conflict)
**Impact on plan:** Essential fix for generation. No scope changes - all planned features intact.

## Issues Encountered

**Template syntax confusion**
- **Problem:** Plan spec used `{{version}}` as example syntax, but template engine interprets all `{{...}}` as variables
- **Root cause:** No escaping mechanism for literal Mustache syntax in template engine
- **Solution:** Use different syntax - bash variables `\${version}` for code, prose `{version}` for docs
- **Lesson:** Avoid Mustache-style syntax in specs unless intended for template interpolation

## Next Phase Readiness

**Ready for:**
- Wave 4 execution (05-08 progress routing depends on complete-milestone existing)
- Milestone completion workflows now available
- Integration audit capability via spawned checker

**No blockers:**
- All five commands migrated and tested
- Dependency chain verified
- Spawning patterns confirmed working

**Future enhancements:**
- Consider template engine enhancement: escape syntax like `\{{version}}` for literal Mustache in specs
- Document argument interpolation patterns in migration guidelines

---
*Phase: 05-simple-command-migration*
*Completed: 2026-01-23*
