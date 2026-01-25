---
phase: 02-template-engine-integration
plan: 05
subsystem: template-engine
tags: [skill-generation, folder-structure, testing, generateAgent]

# Dependency graph
requires:
  - phase: 02-01
    provides: generateSkillsFromSpecs() function
  - phase: 02-02
    provides: frontmatter inheritance system
  - phase: 02-03
    provides: platform integration (Claude, Copilot, Codex)
provides:
  - Correct folder/SKILL.md output structure for skills
  - Safe testing approach using test-output/ directories
  - Verified all 3 platforms generate proper structure
affects: [02-04, Phase 3 (any skill generation), skill-discovery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skills use folder-per-skill structure (gsd-help/SKILL.md not gsd-help.md)"
    - "Testing in test-output/ only, protected directories (.claude/, etc.) untouched"

key-files:
  created: []
  modified:
    - bin/install.js

key-decisions:
  - "Folder/SKILL.md structure matches Claude documentation for automatic discovery"
  - "mkdirSync with recursive:true ensures skill output directory created"
  - "Test-output approach prevents polluting production directories during development"

patterns-established:
  - "Skills follow folder-per-skill pattern enabling future expansion (templates, examples, scripts)"
  - "Safe testing pattern: all verification in test-output/, never modify .claude//.codex//.github/copilot/"

# Metrics
duration: 3min
completed: 2026-01-22
---

# Phase 2 Plan 05: Fix Skill Output Structure (Gap Closure)

**Fixed generateSkillsFromSpecs() to create folder/SKILL.md structure matching Claude spec, verified with safe test-output approach**

## Performance

- **Duration:** 3m 1s
- **Started:** 2026-01-22T20:26:12Z
- **Completed:** 2026-01-22T20:29:13Z
- **Tasks:** 3
- **Files modified:** 1 (bin/install.js)

## Accomplishments

- Fixed output path logic in generateSkillsFromSpecs() to create {name}/SKILL.md instead of {name}.md
- Removed old flat skill files from test-output (gsd-help.md)
- Verified all 3 platforms (Claude, Copilot, Codex) generate correct folder structure
- Confirmed protected directories remain untouched during testing
- Both critical gaps from Wave 3 checkpoint closed

## Task Commits

Each task was committed atomically:

1. **Task 1: fix-generateSkillsFromSpecs** - `2e39fdc` (fix)
2. **Task 2: test-with-safe-output** - `a6a1f87` (test)
3. **Task 3: verify-gap-closure** - Verification only (no code changes)

## Files Created/Modified

- `bin/install.js` (lines 336-342) - Changed output path logic to create skillOutputDir and write SKILL.md inside folder instead of flat file

## Decisions Made

**1. Folder structure matches Claude documentation**
- Rationale: Claude requires folder-per-skill for automatic discovery
- Reference: https://code.claude.com/docs/en/slash-commands#automatic-discovery-from-nested-directories
- Pattern: `.claude/skills/gsd-help/SKILL.md` not `.claude/skills/gsd-help.md`

**2. Test-output approach for all testing**
- Rationale: Protected directories (.claude/, .codex/, .github/copilot/) are production paths
- Testing should never modify them during development
- Prevents git pollution with test artifacts
- Verified: Protected directories show "working tree clean"

**3. Keep all other functionality intact**
- Platform integration (lines 647, 886, 1092) unchanged
- Codex support (commit 20fa968) preserved
- Frontmatter inheritance system unchanged
- generateAgent() template processing unchanged

## Deviations from Plan

None - plan executed exactly as written.

Gap closure plan specifically addressed the two issues found during Wave 3:
1. Issue 1: Wrong output structure (flat files) → FIXED
2. Issue 2: Testing in protected directories → FIXED with test-output approach

## Issues Encountered

None - implementation was straightforward:
- Changed 4 lines in generateSkillsFromSpecs() (lines 337-340)
- Added mkdirSync call for skill output directory
- Replaced flat file path with folder/SKILL.md path
- Verification confirmed fix works for all 3 platforms

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 2 gaps closed - ready for Wave 3 verification:**

✅ Gap 1 closed: Folder structure correct
- All platforms generate gsd-help/SKILL.md
- No flat files (gsd-help.md) exist
- Matches Claude spec for automatic discovery

✅ Gap 2 closed: Safe testing approach
- All testing in test-output/ directories
- Protected directories untouched
- Clean git working tree confirmed

**Ready for:**
- Phase 2 Wave 3 checkpoint verification
- Phase 2 completion (plan 02-04 can now pass)
- Phase 3 planning (skill generation pattern established)

**No blockers or concerns**

---
*Phase: 02-template-engine-integration*
*Completed: 2026-01-22*
