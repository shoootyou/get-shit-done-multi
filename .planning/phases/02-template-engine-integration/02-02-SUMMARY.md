---
phase: 02-template-engine-integration
plan: 02
subsystem: template-system
tags: [frontmatter, yaml, inheritance, dry, shared-config]

# Dependency graph
requires:
  - phase: 01-foundation-schema
    provides: Canonical skill schema with folder-per-skill structure (gsd-*/SKILL.md)
provides:
  - specs/skills/_shared.yml for DRY frontmatter inheritance
  - loadSharedFrontmatter() function in spec-parser.js
  - mergeFrontmatter() with correct precedence (skill overrides shared)
  - Deep merge for nested objects (metadata)
affects: [02-03, 02-04, all-future-skills]

# Tech tracking
tech-stack:
  added: []
  patterns: [frontmatter-inheritance, yaml-merge, shared-config]

key-files:
  created: [specs/skills/_shared.yml]
  modified: [bin/lib/template-system/spec-parser.js]

key-decisions:
  - "Use _shared.yml with Object.assign() merge (simpler than YAML anchors)"
  - "Skill-specific values override shared values (merge precedence)"
  - "Deep merge for nested objects (metadata), array replacement (tools)"
  - "Tools organized by platform in _shared.yml (claude/copilot/codex)"

patterns-established:
  - "Underscore prefix (_shared.yml) signals special file (not a skill spec)"
  - "Merge happens at parse time before template rendering"
  - "Silent failure if _shared.yml missing (inheritance optional)"

# Metrics
duration: 4min
completed: 2026-01-22
---

# Phase 02 Plan 02: Frontmatter Inheritance Summary

**_shared.yml enables DRY frontmatter with merge-based inheritance - common tools and metadata defined once, skill-specific values override**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-22T19:56:13Z
- **Completed:** 2026-01-22T19:59:46Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created specs/skills/_shared.yml with common tool declarations for all platforms
- Implemented loadSharedFrontmatter() to auto-load _shared.yml from parent directory
- Implemented mergeFrontmatter() with correct precedence (skill overrides shared)
- Deep merge for nested objects (metadata), direct replacement for arrays (tools)
- Verified inheritance transparent to generateAgent() (no changes needed)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared frontmatter file** - `3620de6` (feat)
2. **Task 2: Implement frontmatter merge** - `a2312ae` (feat)

## Files Created/Modified
- `specs/skills/_shared.yml` - Common frontmatter definitions (~13 lines) with tools for claude/copilot/codex and default metadata
- `bin/lib/template-system/spec-parser.js` - Added loadSharedFrontmatter() (~23 lines) and mergeFrontmatter() (~19 lines), modified parseSpec() to use merge

## Decisions Made
- **Merge strategy:** Object.assign() merge simpler than YAML anchors (no YAML preprocessing needed)
- **Platform organization:** Tools organized by platform in _shared.yml (tools.claude, tools.copilot, tools.codex) instead of conditional blocks
- **Merge precedence:** Skill-specific values always override shared (no ambiguity)
- **Array handling:** Arrays replace completely (don't append) to prevent tool list bloat
- **Deep merge:** Nested objects (like metadata) deep merge to allow partial overrides
- **Optional inheritance:** Missing _shared.yml silently ignored (skills without shared still work)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase (02-03: Wire into install command):**
- _shared.yml created with common tool declarations
- spec-parser.js loads and merges shared frontmatter automatically
- Merge precedence correct (skill overrides shared)
- Deep merge for objects, replacement for arrays
- No changes needed to generateAgent() (inheritance transparent)

**What's next:**
- Plan 02-03: Wire generateSkillsFromSpecs() into install command
- Plan 02-04: End-to-end testing of skill generation with inheritance

**No blockers or concerns.**

---
*Phase: 02-template-engine-integration*
*Completed: 2026-01-22*
