---
phase: 04-platform-paths
plan: 01
subsystem: installation
tags: [paths, validation, cross-platform, windows, macos, linux, wsl]

# Dependency graph
requires:
  - phase: 03-interactive-menu
    provides: Flag parser and menu both output {platforms: [...], scope: 'global'|'local'}
provides:
  - getConfigPaths(platform, scope, configDir) for path resolution
  - path-validator module with platform-specific validation rules
  - Breaking change: Claude global path now ~/.claude/ (not ~/Library/Application Support/Claude)
  - ensureInstallDir() with permission checking and actionable error messages
affects: [04-02-conflict-resolution, 05-message-optimization, 06-uninstall]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Platform-specific path validation (Windows: chars/reserved/length, Unix: length limits)"
    - "WSL detection and treatment as Linux (not Windows)"
    - "Permission-aware directory creation with scope-specific suggestions"

key-files:
  created:
    - bin/lib/path-validator.js
    - bin/lib/paths.test.js
    - bin/lib/path-validator.test.js
  modified:
    - bin/lib/paths.js

key-decisions:
  - "Breaking change: Claude global path from ~/Library/Application Support/Claude to ~/.claude/"
  - "Codex global installation not supported (throws clear error)"
  - "configDir parameter uses absolute path resolution with platform subdirectories"
  - "Permission errors provide actionable suggestions (--local for global, --config-dir for local)"
  - "Windows validation allows : only after drive letter (C:)"

patterns-established:
  - "Path validation returns {valid: boolean, errors: string[]} structure"
  - "Platform detection via getEffectivePlatform() treats WSL as Linux"
  - "ensureInstallDir() async with structured error responses"

# Metrics
duration: 4min
completed: 2026-01-25
---

# Phase 4, Plan 1: Path Resolution & Validation Summary

**Path resolution updated with breaking change to ~/.claude/ global path, cross-platform validation (Windows chars/reserved/length, Unix length limits), and WSL detection**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-01-25T00:43:40Z
- **Completed:** 2026-01-25T00:47:43Z
- **Tasks:** 3
- **Files modified:** 4 (1 modified, 3 created)
- **Test coverage:** 98.8% overall (100% paths.js, 97.72% path-validator.js)

## Accomplishments

- **Breaking change implemented:** Claude global path changed from `~/Library/Application Support/Claude` to `~/.claude/`
- **Path validator created:** Platform-specific validation for Windows (invalid chars, reserved names, 260 char limit) and Unix (1024 macOS, 4096 Linux)
- **WSL detection:** Automatically detects and treats WSL as Linux (not Windows) via /proc/version and /mnt/c checks
- **Permission handling:** ensureInstallDir() catches EACCES/EPERM and suggests --local (global failures) or --config-dir (local failures)
- **Test coverage:** 53 tests passing with 98.8% overall coverage, exceeds >80% requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Update paths module** - `908c694` (feat)
   - Changed getConfigPaths() signature to (platform, scope, configDir)
   - Breaking change: Claude global now ~/.claude/
   - Added ensureInstallDir() with permission checking

2. **Task 2: Create path-validator module** - `a908ae2` (feat)
   - Windows validation: invalid chars, reserved names, 260 char limit
   - Unix validation: 1024 chars (macOS), 4096 chars (Linux)
   - WSL detection and getEffectivePlatform() helper

3. **Task 3: Test suites** - `dc820a4` (test)
   - 100% coverage for paths.js
   - 97.72% coverage for path-validator.js
   - 53 tests covering all platforms and edge cases

## Files Created/Modified

**Modified:**
- `bin/lib/paths.js` - Updated getConfigPaths(platform, scope, configDir), added ensureInstallDir(), breaking change to Claude global path

**Created:**
- `bin/lib/path-validator.js` - Platform-specific path validation with WSL detection
- `bin/lib/paths.test.js` - 28 tests for path resolution utilities
- `bin/lib/path-validator.test.js` - 25 tests for path validation across platforms

## Decisions Made

**1. Claude global path breaking change**
- **Old:** `~/Library/Application Support/Claude` (macOS-specific path)
- **New:** `~/.claude/` (Unix-standard dotfile)
- **Rationale:** Consistency with Copilot/Codex patterns, cross-platform simplicity
- **Migration:** No automation - Plan 02 will warn if old path exists

**2. Codex global not supported**
- Throws clear error: "Global installation not supported for codex"
- Rationale: Per roadmap decision, can be added in v1.11.0 if needed

**3. Windows colon validation**
- Allow `:` only after drive letter (e.g., `C:\`)
- Detect invalid colons elsewhere in path
- Rationale: Windows paths require drive letter colon, but it's invalid elsewhere

**4. Permission error suggestions**
- Global scope EACCES → "Try using --local for a project-specific installation"
- Local scope EACCES → "Check directory permissions or choose a different location with --config-dir"
- Rationale: Actionable error messages reduce friction

**5. Test coverage target**
- Achieved 98.8% overall (100% paths.js, 97.72% path-validator.js)
- Exceeds >80% requirement from Phase 2 decision
- Rationale: High coverage ensures cross-platform reliability

## Deviations from Plan

**1. [Rule 2 - Missing Critical] Windows colon validation refinement**
- **Found during:** Task 2 (path-validator implementation)
- **Issue:** Initial regex `/[<>:"|?*\x00-\x1f]/` flagged valid Windows paths like `C:\Users` as invalid
- **Fix:** Updated to allow `:` only after drive letter: `(?!^[A-Za-z]:)[:<]`
- **Files modified:** `bin/lib/path-validator.js`
- **Verification:** Windows path tests now pass (valid paths accepted, invalid colons rejected)
- **Committed in:** `a908ae2` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing critical validation logic)
**Impact on plan:** Essential for correct Windows path validation. No scope creep.

## Issues Encountered

None - plan executed smoothly with expected test iteration.

## Next Phase Readiness

**Ready for Phase 4 Plan 2 (Conflict Resolution):**
- Path resolution complete with platform-aware validation
- Breaking change to Claude global path documented
- ensureInstallDir() ready for install.js integration
- Test coverage ensures reliability across platforms

**For Plan 02:**
- Detect old Claude path (`~/Library/Application Support/Claude`) and warn user
- Integrate getConfigPaths() into install.js flow
- Handle path conflicts (existing directory, permission issues)

**No blockers or concerns.**

---
*Phase: 04-platform-paths*
*Completed: 2026-01-25*
