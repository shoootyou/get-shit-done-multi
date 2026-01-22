---
phase: 01-foundation-schema
plan: 01
subsystem: documentation
tags: [schema, specs, frontmatter, yaml, mustache, platform-agnostic]

# Dependency graph
requires:
  - phase: 00-initialization
    provides: Project structure with .planning/ directory and STATE.md
provides:
  - /specs/skills/ directory structure ready for skill specifications
  - Canonical frontmatter schema documentation (name, description, tools, metadata)
  - Complete command mapping table (29 commands from gsd:* to gsd-*)
  - Platform conditional syntax documentation (Claude, Copilot, Codex)
  - Folder-per-skill structure pattern with validation rules
affects: [02-template-integration, skill-migration, platform-output-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: 
    - Folder-per-skill structure matching Claude agent pattern
    - Platform conditionals using Mustache syntax in frontmatter
    - SKILL.md convention for specification files

key-files:
  created: 
    - specs/skills/README.md
  modified: []

key-decisions:
  - "Use folder-per-skill structure (enables future expansion with templates, assets, tests)"
  - "Spec filename must be SKILL.md in all caps (consistent convention, clear identification)"
  - "Platform conditionals only in frontmatter, not body (keeps body platform-agnostic)"
  - "Metadata fields auto-generate, not authored (prevents drift, enables version tracking)"
  - "Complexity ratings for all commands (LOW/MEDIUM/HIGH based on orchestration)"

patterns-established:
  - "Folder name must match skill name: gsd-help folder contains name: gsd-help"
  - "Required frontmatter fields: name, description, tools"
  - "Tool declarations use platform conditionals: {{#isClaude}}Read{{/isClaude}}"
  - "Legacy gsd:* maps to spec gsd-* format (colon to hyphen)"

# Metrics
duration: 3m 18s
completed: 2026-01-22
---

# Phase 1 Plan 01: Foundation Structure & Schema Summary

**Canonical schema defined for 29 GSD skills with platform-agnostic frontmatter, tool conditionals, and folder-per-skill structure ready for template integration**

## Performance

- **Duration:** 3m 18s
- **Started:** 2026-01-22T17:45:25Z
- **Completed:** 2026-01-22T17:48:43Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Created `/specs/skills/` directory structure ready for skill folders
- Documented canonical frontmatter schema with all required fields (name, description, tools)
- Mapped all 29 legacy commands from `gsd:*` to `gsd-*` format with complexity ratings
- Documented platform conditional syntax for multi-platform tool mapping
- Established validation rules and naming conventions
- Provided examples for LOW, MEDIUM, and HIGH complexity skills

## Task Commits

Each task was committed atomically:

1. **Tasks 1-3: Foundation structure and schema** - `f73db8d` (feat)
   - Created directory structure
   - Analyzed all 29 legacy commands
   - Wrote comprehensive schema documentation

## Files Created/Modified

- `specs/skills/README.md` - Comprehensive schema documentation (631 lines)
  - Overview and relationship to legacy commands
  - Directory structure with folder-per-skill pattern
  - Canonical frontmatter schema with all fields documented
  - Platform conditionals ({{#isClaude}}, {{#isCopilot}}, {{#isCodex}})
  - Tool declarations for all three platforms
  - Complete command mapping table (29 commands)
  - Validation rules and common errors
  - Three full examples (LOW/MEDIUM/HIGH complexity)
  - Migration guide for new and existing skills

## Decisions Made

1. **Folder-per-skill structure**: Matches existing `/specs/agents/` pattern, enables future expansion (templates, assets, tests per skill)

2. **SKILL.md filename convention**: All caps makes specs easy to identify, consistent with established patterns

3. **Platform conditionals in frontmatter only**: Body content remains platform-agnostic. Platform-specific content uses conditionals in YAML frontmatter

4. **Metadata auto-generation**: platform, generated, gsdVersion fields generated during output, not authored in source specs. Prevents version drift

5. **Complexity ratings**: Classified all 29 commands as LOW (no orchestration), MEDIUM (1-2 agent spawns), or HIGH (3+ spawns or complex workflows) to guide migration priority

6. **Name matching validation**: Folder name must match skill name exactly (gsd-help folder for name: gsd-help) to prevent confusion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward foundation work with clear requirements.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 2 (Template Integration):**

- Schema documentation complete and serves as single source of truth
- All 29 legacy commands mapped to new format
- Directory structure in place
- Platform conditionals documented with tool mapping
- Validation rules clearly defined
- Examples provided for all complexity levels

**Blockers/Concerns:** None

**Next step:** Integrate schema with existing template system (`bin/lib/template-system/`) to enable automatic platform-specific output generation.

---
*Phase: 01-foundation-schema*
*Completed: 2026-01-22*
