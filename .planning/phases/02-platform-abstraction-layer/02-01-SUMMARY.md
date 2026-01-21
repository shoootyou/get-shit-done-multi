---
phase: 02-platform-abstraction-layer
plan: 01
subsystem: template-system
tags: [tool-mapper, platform-abstraction, cross-platform, compatibility-matrix, claude, copilot]

# Dependency graph
requires:
  - phase: 01-02
    provides: Platform capability flags and context builder
  - phase: research
    provides: PITFALLS.md tool compatibility matrix
provides:
  - Tool name mapping between Claude and Copilot formats
  - Canonical tool name definitions (CANONICAL_TOOLS)
  - Tool compatibility checking (getToolCompatibility)
  - Platform-specific tool validation (validateToolList)
  - Case-sensitivity handling for Claude
  - Aliasing support for Copilot
affects: [02-02, generator, spec-migration, template-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: [platform abstraction layer, tool compatibility matrix, canonical naming]

key-files:
  created:
    - bin/lib/template-system/tool-mapper.js
    - bin/lib/template-system/tool-mapper.test.js
  modified: []

key-decisions:
  - "Canonical tool names use Claude case format (Bash, Read, Edit, Grep, Glob, Task)"
  - "Tool compatibility matrix identifies 6 safe cross-platform tools"
  - "Platform-specific tools (WebFetch, WebSearch) marked as Claude-only with warnings"
  - "mapTools() filters unavailable tools instead of throwing errors"
  - "validateToolList() provides granular warnings vs errors for better UX"

patterns-established:
  - "Tool mapping returns platform-specific names while preserving availability"
  - "Compatibility info includes isCanonical, safe flags, aliases, and warnings"
  - "Validation distinguishes between warnings (risky) and errors (unavailable)"
  - "All tool names quoted in YAML to prevent parser ambiguities"

# Metrics
duration: 2min
completed: 2026-01-21
---

# Phase 02 Plan 01: Platform Abstraction Layer Summary

**Tool compatibility matrix with canonical name mapping handling Claude case-sensitivity and Copilot aliasing differences**

## Performance

- **Duration:** 2 min 12 sec
- **Started:** 2026-01-21T16:54:25Z
- **Completed:** 2026-01-21T16:56:37Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments
- Created tool-mapper module with 6 canonical cross-platform tools
- Implemented tool compatibility matrix mapping Claude/Copilot formats
- Added mapTools() for platform-specific name conversion with case preservation
- Added getToolCompatibility() for detailed compatibility information
- Added validateToolList() for pre-generation validation
- Comprehensive test coverage with 29 passing unit tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tool-mapper module with canonical name definitions** - `dbea69b` (feat)
2. **Task 2: Add comprehensive unit tests for tool mapper** - `21884a9` (test)

## Files Created/Modified
- `bin/lib/template-system/tool-mapper.js` - Tool compatibility layer with mapping and validation functions
- `bin/lib/template-system/tool-mapper.test.js` - 29 unit tests covering all functions and edge cases

## Decisions Made

**1. Canonical tool names use Claude case format**
- Rationale: Claude is case-sensitive (Pitfall 1), Copilot is case-insensitive. Using Claude's format (Bash, Read, Edit) ensures specs work on both platforms.

**2. Tool compatibility matrix defines 6 safe cross-platform tools**
- Rationale: Based on PITFALLS.md research, identified tools that exist on both platforms with compatible behavior: Bash, Read, Edit, Grep, Glob, Task.

**3. Platform-specific tools marked with warnings, not errors**
- Rationale: WebFetch and WebSearch are Claude-only. mapTools() filters them out for Copilot, validateToolList() warns but allows specs to include them for Claude.

**4. mapTools() filters unavailable tools instead of throwing**
- Rationale: Graceful degradation - specs can include platform-specific tools, and mapTools() returns only available ones for target platform.

**5. Granular validation with warnings vs errors**
- Rationale: Warnings for risky/unknown tools (user should know but proceed), errors for completely unavailable tools (would break agent).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed PITFALLS.md research directly, all tests passed on first run.

## Next Phase Readiness

**Ready for Phase 2 Plan 2:** Field transformation layer
- Tool mapper provides canonical name mapping
- Validation functions ready for integration into generator
- Compatibility checking can be used during spec migration
- 29 tests establish baseline for cross-platform compatibility

**Integration points:**
- generator.js will use mapTools() when rendering for specific platform
- Spec migration will use validateToolList() to check existing specs
- Template generation will reference CANONICAL_TOOLS for safe defaults

---
*Phase: 02-platform-abstraction-layer*
*Completed: 2026-01-21*
