---
phase: 02-flag-system-redesign
plan: 01
subsystem: cli
tags: [commander.js, flag-parsing, cli, validation]

# Dependency graph
requires:
  - phase: 01-dependency-setup
    provides: Commander.js 14.0.2 and prompts 2.4.2 installed
provides:
  - Three-stage flag parsing architecture (pre-parse detection → Commander parsing → validation)
  - Old flag detector that distinguishes old standalone flags from new scope modifiers
  - Platform flag parser (--claude, --copilot, --codex, --all)
  - Scope modifier parser (--global, --local with local default)
  - Conflict validator for mutually exclusive flags
affects: [02-02-codex-warnings, 03-interactive-menu, 04-platform-paths]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Three-stage flag parsing: detection → parse → validate"
    - "Context-aware old flag detection (checks for platform flags)"
    - "Commander.js with exitOverride for error handling"

key-files:
  created:
    - bin/lib/old-flag-detector.js
    - bin/lib/flag-parser.js
    - bin/lib/flag-validator.js
  modified:
    - bin/install.js

key-decisions:
  - "Old flags (--local, --global) detected only when used WITHOUT platform flags"
  - "New scope modifiers use same names but different semantics (require platform flag)"
  - "--codex-global always treated as old flag (no new equivalent)"
  - "Deduplication of platform flags shows warning but continues (lenient)"
  - "Conflicting scopes error immediately with exit code 2 (strict)"

patterns-established:
  - "Module structure: bin/lib/ for reusable parsing/validation logic"
  - "Smart context detection: same flag name, different meaning based on context"
  - "needsMenu flag pattern: parser sets flag, installer decides behavior"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 2, Plan 1: Core Flag Parsing Infrastructure Summary

**Commander.js three-stage flag parser with smart old-flag detection distinguishing standalone legacy flags from new scope modifiers**

## Performance

- **Duration:** 3 min 9 sec
- **Started:** 2026-01-24T21:55:41Z
- **Completed:** 2026-01-24T21:58:50Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Three independent modules for clean separation of concerns (detection, parsing, validation)
- Context-aware old flag detection prevents false positives for new scope modifiers
- Commander.js integration with proper error handling via exitOverride
- All platform combinations validated and working
- Interactive menu integration point ready (needsMenu flag)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create old-flag-detector** - `9ea49a8` (feat)
2. **Task 2: Create flag-parser** - `fd468a6` (feat)
3. **Task 3: Create flag-validator** - `79e76ff` (feat)
4. **Task 4: Integrate into install.js** - `6193898` (feat)

## Files Created/Modified

- `bin/lib/old-flag-detector.js` - Pre-parse detection of removed flags with context awareness
- `bin/lib/flag-parser.js` - Commander.js-based platform and scope flag parsing
- `bin/lib/flag-validator.js` - Post-parse validation for conflicting combinations
- `bin/install.js` - Integrated three-stage parsing, temporary exit after parsing

## Decisions Made

**Context-aware old flag detection:**
- Discovered naming collision: old `--local`/`--global` removed, new `--local`/`--global` added with different semantics
- Solution: Check for platform flags first - if present, treat as new usage; if absent, treat as old usage
- **Rationale:** Allows same flag names with different meanings based on context, cleaner migration path

**Lenient deduplication vs strict conflicts:**
- Duplicate platform flags (--claude --claude): warn and dedupe
- Conflicting scopes (--local --global): error and exit
- **Rationale:** Duplicates are likely user convenience/habit, conflicts indicate misunderstanding

**needsMenu flag pattern:**
- Parser sets flag when no platforms selected
- Install.js decides behavior (Phase 3 will implement interactive menu)
- **Rationale:** Loose coupling between parsing and menu system

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Smart old flag detection to prevent false positives**
- **Found during:** Task 4 (Integration testing)
- **Issue:** New `--global` scope modifier being detected as old `--global` flag
- **Root cause:** Old and new flags share same names (--local, --global) but different semantics
- **Fix:** Enhanced old-flag-detector.js to check for platform flags presence before treating as old
- **Logic:** If platform flags present (--claude, --copilot, --codex, --all) → new usage; else → old usage
- **Files modified:** bin/lib/old-flag-detector.js
- **Verification:** `--claude --global` works without warning, `--global` alone shows warning
- **Committed in:** 6193898 (Task 4 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Essential fix to support naming collision between old and new flags. No scope creep - clarifies flag semantics.

## Issues Encountered

None - all tasks completed as planned after resolving the old/new flag detection enhancement.

## Next Phase Readiness

**Ready for:**
- Plan 02-02: Codex warnings and edge case handling (platforms array ready for Codex detection)
- Phase 3: Interactive menu implementation (needsMenu flag integration point exists)
- Phase 4: Platform paths (platforms and scope config ready for routing)

**Integration points provided:**
- `flagConfig.platforms` - Array of selected platforms
- `flagConfig.scope` - 'local' or 'global'
- `flagConfig.needsMenu` - Boolean for interactive menu trigger

**Current state:**
- install.js exits after flag parsing with temporary message
- Old installation logic preserved but unreachable (after process.exit)
- Phase 4 will remove temporary exit and implement actual installation routing

**No blockers.**

---
*Phase: 02-flag-system-redesign*
*Completed: 2026-01-24*
