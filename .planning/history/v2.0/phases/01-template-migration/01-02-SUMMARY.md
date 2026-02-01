---
phase: 01-template-migration
plan: 02
subsystem: migration
tags: [frontmatter, yaml, gray-matter, skill-migration, template-variables]

# Dependency graph
requires:
  - phase: 01-01
    provides: Migration foundation (parser, validator, injector)
provides:
  - 28 skills migrated to templates/skills/ with corrected frontmatter
  - Tool name normalization (Copilot aliases → Claude official names)
  - Argument-hint conversion from complex arguments array
  - Version.json files with preserved metadata
  - Template variables injected in skill content
affects: [01-03-agents-migration, 01-04-validation]

# Tech tracking
tech-stack:
  added: []
  patterns: 
    - Object-based argument conversion for argument-hint
    - Tool name mapping with Copilot alias support

key-files:
  created:
    - scripts/lib/skill-migrator.js
    - templates/skills/gsd-*/SKILL.md (28 files)
    - templates/skills/gsd-*/version.json (28 files)
  modified:
    - scripts/migrate-to-templates.js

key-decisions:
  - "Fixed argument-hint conversion to handle object-based arguments"
  - "28 skills confirmed (not 29) - plan stated 29 but source has 28"

patterns-established:
  - "Argument objects with {name, type, required, description} converted to [name] format"
  - "Tool array mapping with fallback to original if not in map"

# Metrics
duration: 172 seconds (2.9 minutes)
completed: 2026-01-26
---

# Phase 01 Plan 02: Skills Migration & Correction Summary

**28 skills migrated to templates/skills/ with frontmatter corrections: tools→allowed-tools comma-separated strings, arguments→argument-hint, tool name normalization, and template variable injection**

## Performance

- **Duration:** 2.9 minutes (172 seconds)
- **Started:** 2026-01-26T10:19:16Z
- **Completed:** 2026-01-26T10:22:08Z
- **Tasks:** 2
- **Files modified:** 58 (2 scripts, 56 template files)

## Accomplishments
- Created skill migrator module with frontmatter correction logic
- Migrated all 28 skills from .github/skills/ to templates/skills/
- Applied TEMPLATE-01C specification: tools→allowed-tools, arguments→argument-hint
- Normalized tool names (execute→Bash, search→Grep, agent→Task)
- Extracted unsupported fields (skill_version, requires_version, platforms, metadata) to version.json
- Injected template variables ({{PLATFORM_ROOT}}, {{COMMAND_PREFIX}}) throughout skill content

## Task Commits

Each task was committed atomically:

1. **Task 1: Create skill migrator** - `74d835c` (feat)
2. **Task 2: Integrate skills migration** - `e9a1bde` (feat)

## Files Created/Modified

**Created:**
- `scripts/lib/skill-migrator.js` - Frontmatter correction engine with tool mapping and argument conversion
- `templates/skills/gsd-add-phase/SKILL.md` + version.json
- `templates/skills/gsd-add-todo/SKILL.md` + version.json
- `templates/skills/gsd-archive-milestone/SKILL.md` + version.json
- `templates/skills/gsd-audit-milestone/SKILL.md` + version.json
- `templates/skills/gsd-check-todos/SKILL.md` + version.json
- `templates/skills/gsd-complete-milestone/SKILL.md` + version.json
- `templates/skills/gsd-debug/SKILL.md` + version.json
- `templates/skills/gsd-discuss-phase/SKILL.md` + version.json
- `templates/skills/gsd-execute-phase/SKILL.md` + version.json
- `templates/skills/gsd-help/SKILL.md` + version.json
- `templates/skills/gsd-insert-phase/SKILL.md` + version.json
- `templates/skills/gsd-list-milestones/SKILL.md` + version.json
- `templates/skills/gsd-list-phase-assumptions/SKILL.md` + version.json
- `templates/skills/gsd-map-codebase/SKILL.md` + version.json
- `templates/skills/gsd-new-milestone/SKILL.md` + version.json
- `templates/skills/gsd-new-project/SKILL.md` + version.json
- `templates/skills/gsd-pause-work/SKILL.md` + version.json
- `templates/skills/gsd-plan-milestone-gaps/SKILL.md` + version.json
- `templates/skills/gsd-plan-phase/SKILL.md` + version.json
- `templates/skills/gsd-progress/SKILL.md` + version.json
- `templates/skills/gsd-remove-phase/SKILL.md` + version.json
- `templates/skills/gsd-research-phase/SKILL.md` + version.json
- `templates/skills/gsd-restore-milestone/SKILL.md` + version.json
- `templates/skills/gsd-resume-work/SKILL.md` + version.json
- `templates/skills/gsd-update/SKILL.md` + version.json
- `templates/skills/gsd-verify-installation/SKILL.md` + version.json
- `templates/skills/gsd-verify-work/SKILL.md` + version.json
- `templates/skills/gsd-whats-new/SKILL.md` + version.json

**Modified:**
- `scripts/migrate-to-templates.js` - Integrated skill migration into main flow

## Decisions Made

**1. Fixed argument-hint conversion for object-based arguments**
- **Context:** Original conversion function expected simple string arrays like `['domain']`
- **Issue:** Skills use complex argument objects like `[{name: 'domain', type: 'string', required: false, description: '...'}]`
- **Decision:** Enhanced convertArgumentsToHint to extract `name` property from objects
- **Result:** `[{name: 'domain', ...}]` → `'[domain]'` correctly

**2. Confirmed actual skill count is 28, not 29**
- **Context:** Plan stated "29 skills" but source directory has 28 gsd-* directories
- **Verification:** Counted .github/skills/ contents - 28 skills + 1 get-shit-done directory (not a skill)
- **Result:** All 28 actual skills successfully migrated

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed argument-hint conversion for object-based arguments**
- **Found during:** Task 2 (Skills migration verification)
- **Issue:** convertArgumentsToHint function expected string array but received object array, resulting in `'[[object Object]]'` instead of proper hint
- **Fix:** Enhanced function to detect object type and extract `name` property: `typeof arg === 'string' ? arg : (arg.name || arg)`
- **Files modified:** scripts/lib/skill-migrator.js
- **Verification:** Re-ran migration, checked gsd-new-project/SKILL.md shows `argument-hint: '[domain]'` correctly
- **Committed in:** e9a1bde (Task 2 commit)

**2. [Rule 1 - Bug] Fixed JSDoc syntax error with asterisk in path**
- **Found during:** Task 2 (First migration run)
- **Issue:** JSDoc comment contained `.github/skills/gsd-*/SKILL.md` which caused syntax error due to unescaped asterisk closing comment
- **Fix:** Changed to `.github/skills/gsd-xx/SKILL.md` to avoid conflict
- **Files modified:** scripts/lib/skill-migrator.js
- **Verification:** Script parsed successfully, migration ran without syntax errors
- **Committed in:** e9a1bde (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correct operation. No scope creep - all fixes were correctness issues in migration logic itself.

## Issues Encountered

None - migration executed smoothly after bug fixes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for 01-03 (Agents Migration):**
- Skill migrator pattern validated and working
- Same frontmatter correction approach applies to agents with different field mappings
- Agent migrator can follow identical structure with agent-specific rules

**Considerations for next phase:**
- Agents use `tools` (not `allowed-tools`) per AGENT-CORRECTIONS spec
- Agents need `skills` field auto-generated by scanning content
- Single versions.json for ALL agents (not per-agent like skills)

---
*Phase: 01-template-migration*
*Completed: 2026-01-26*
