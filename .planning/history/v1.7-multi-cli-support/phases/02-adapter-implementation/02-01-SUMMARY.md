---
phase: 02-adapter-implementation
plan: 01
subsystem: infra
tags: [adapters, multi-cli, path-rewriting, format-conversion]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Path utilities (getConfigPaths) and CLI detection
provides:
  - Adapter layer architecture with consistent interface
  - Path rewriting utility for Claude → target CLI conversion
  - Format converter for agent → skill transformation
  - Three CLI-specific adapters (Claude, Copilot, Codex)
affects: [02-02, 02-03, installer-integration, multi-cli-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [Adapter pattern, Progressive path replacement, Minimal format conversion]

key-files:
  created:
    - bin/lib/adapters/shared/path-rewriter.js
    - bin/lib/adapters/shared/format-converter.js
    - bin/lib/adapters/claude.js
    - bin/lib/adapters/copilot.js
    - bin/lib/adapters/codex.js
  modified: []

key-decisions:
  - "Three separate adapter files instead of one with switch for easier testing and maintenance"
  - "Minimal agent-to-skill conversion (90% compatible, only removes 'target' field)"
  - "Progressive path replacement strategy (directories → commands → agents)"

patterns-established:
  - "Adapter interface: getTargetDirs(isGlobal), convertContent(content, type), verify(dirs)"
  - "Use Phase 1 path utilities for consistency across all adapters"
  - "Centralized path rewriting in shared utility to prevent duplication"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 2 Plan 1: Adapter Layer Architecture Summary

**Multi-CLI adapter layer with shared path rewriting and format conversion for Claude, Copilot, and Codex deployment**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19T17:04:07Z
- **Completed:** 2026-01-19T17:07:43Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created adapter layer architecture enabling GSD to deploy to all three target CLIs
- Extracted path replacement logic into reusable shared utility
- Implemented minimal agent-to-skill format conversion (90% compatible)
- Established consistent adapter interface across all three CLIs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared path rewriting utility** - `5dbc1a7` (feat)
2. **Task 2: Create shared format converter utility** - `1c8b386` (feat)
3. **Task 3: Create three CLI adapter modules** - `040923a` (feat)

## Files Created/Modified
- `bin/lib/adapters/shared/path-rewriter.js` - Path replacement for Claude → target CLI conversion
- `bin/lib/adapters/shared/format-converter.js` - Agent-to-skill format conversion (removes 'target' field)
- `bin/lib/adapters/claude.js` - Claude adapter (source format, no conversion)
- `bin/lib/adapters/copilot.js` - Copilot adapter (.github/ paths, flat agent structure)
- `bin/lib/adapters/codex.js` - Codex adapter (.codex/ paths, converts agents to skills)

## Decisions Made
- **Three separate adapter files instead of one with switch:** Each CLI has unique behavior (Codex converts agents to skills, Copilot uses flat agent structure, Claude is source format). Separate files enable easier testing and maintenance.
- **Minimal agent-to-skill conversion:** Research confirms Agent Skills spec is 90% compatible across CLIs. Heavy conversion would introduce fragility. Only removes GitHub Copilot-specific 'target' field.
- **Progressive path replacement strategy:** Replace directory references first (get-shit-done paths), then command references, then agent references. This prevents partial replacement issues.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Adapter layer complete and ready for integration into install.js in Plan 02-02. All adapters:
- Export consistent interface (getTargetDirs, convertContent, verify)
- Use Phase 1 path utilities for consistency
- Handle CLI-specific directory structure and format requirements
- Verified content existence, not just directories

No blockers for next plan.

---
*Phase: 02-adapter-implementation*
*Completed: 2026-01-19*
