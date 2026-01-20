---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [codex, installation, upgrade, cli-detection, cross-platform]

# Dependency graph
requires:
  - phase: 01-01
    provides: Path utilities (paths.js) and CLI detection (detect.js)
provides:
  - Codex CLI installation support (local and global)
  - Version upgrade module with data preservation
  - CLI detection integrated into installation flow
affects: [02-version-management, installer-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Multi-CLI installation pattern (Claude/Copilot/Codex)"
    - "Version upgrade with atomic directory backup/restore"
    - "CLI detection display before installation"

key-files:
  created:
    - bin/lib/upgrade.js
  modified:
    - bin/install.js

key-decisions:
  - "Use getConfigPaths('codex') for consistent path handling"
  - "Follow Copilot installation pattern for Codex (skills-based structure)"
  - "Atomic backup/restore with timestamp-based naming"
  - "Preserve .planning and user-data directories during upgrades"

patterns-established:
  - "installCLI(isGlobal) function pattern for CLI-specific installation"
  - "Graceful error handling in upgrade module (log but don't throw on restore failures)"
  - "Backup files with timestamp: {dir}.backup-{timestamp}"

# Metrics
duration: 3min
completed: 2026-01-19
---

# Phase 01 Plan 02: Installation Extensions Summary

**Codex CLI installation support with atomic version upgrade and data preservation using path utilities**

## Performance

- **Duration:** 3min 25s
- **Started:** 2026-01-19T14:56:52Z
- **Completed:** 2026-01-19T15:00:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Codex CLI installation support (local to `.codex/skills/get-shit-done/` and global to `~/.codex/skills/get-shit-done/`)
- Version upgrade module with atomic backup/restore of user data (.planning directory)
- CLI detection integrated into installation flow (displays before installation)
- Interactive prompt extended with Codex options (choices 4 and 5)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Codex CLI support to installer** - `4c94d04` (feat)
   - Added --codex and --codex-global flags
   - Implemented installCodex() function
   - Updated help text and examples
   - Extended interactive prompt with Codex options
   - Validated flag combinations

2. **Task 2: Create version upgrade module** - `d68fc5f` (feat)
   - Created bin/lib/upgrade.js
   - Implemented preserveUserData(), restoreUserData(), cleanOrphanedFiles()
   - Atomic operations with graceful error handling

## Files Created/Modified
- `bin/install.js` - Added Codex CLI support, CLI detection display, interactive prompt options, flag validation
- `bin/lib/upgrade.js` - New module for version upgrade with data preservation

## Decisions Made

**1. Reuse Copilot installation pattern for Codex**
- Rationale: Codex CLI uses same skills-based structure as Copilot (different from Claude's loose file structure)
- Both install to `skills/get-shit-done/` directory
- Both require path replacement with `includeLocalPaths=true`

**2. Atomic backup/restore with timestamps**
- Rationale: Prevents data loss if upgrade fails midway
- Using `Date.now()` ensures unique backup names
- Atomic fs.renameSync() operations prevent partial state

**3. Graceful error handling in restore**
- Rationale: Better to preserve backup than fail upgrade completely
- Log errors with backup location so user can manually recover
- Don't throw on restore failure - just warn

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed smoothly following existing patterns from 01-01.

## Next Phase Readiness

- Installation infrastructure complete for Claude, Copilot, and Codex CLIs
- Version upgrade module ready for integration into installer
- Ready to proceed with Phase 1 Plan 03 (version management and adapter framework)
- All cross-platform path handling established

**Note:** The upgrade module (bin/lib/upgrade.js) is created but not yet integrated into the installer. This will be handled in a future plan when version upgrade logic is needed.

---
*Phase: 01-foundation*
*Completed: 2026-01-19*
