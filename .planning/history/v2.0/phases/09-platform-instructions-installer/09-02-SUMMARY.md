---
phase: 09-platform-instructions-installer
plan: 02
subsystem: platform-adapters
tags: [adapters, path-resolution, platform-abstraction]
requires: [09-01]
provides: [adapter-instructions-path-method]
affects: [09-03, orchestrator-integration]
tech-stack:
  added: []
  patterns: [adapter-delegation-pattern]
key-files:
  created: []
  modified:
    - bin/lib/platforms/claude-adapter.js
    - bin/lib/platforms/copilot-adapter.js
    - bin/lib/platforms/codex-adapter.js
decisions:
  - id: adapter-method-placement
    choice: Added getInstructionsPath() after getPathReference() for consistency
    rationale: Maintains logical grouping of path-related methods in adapters
  - id: delegation-pattern
    choice: All adapters delegate to instruction-paths.js utility
    rationale: Follows existing pattern from platform-paths.js, keeps adapters thin
metrics:
  duration: 4m
  completed: 2026-01-30
---

# Phase 9 Plan 02: Add getInstructionsPath() to Platform Adapters Summary

**One-liner:** Added getInstructionsPath(isGlobal) method to all three platform adapters, delegating to instruction-paths.js utility for scope-aware path resolution

## What Was Built

Added `getInstructionsPath(isGlobal)` method to ClaudeAdapter, CopilotAdapter, and CodexAdapter classes. Each method:

1. **Imports** `getInstructionPath` from `instruction-paths.js`
2. **Delegates** path resolution to the centralized utility
3. **Returns** absolute path to platform-specific instruction file:
   - Claude: CLAUDE.md (global: ~/.claude/, local: project root)
   - Copilot: copilot-instructions.md (global: ~/.copilot/, local: .github/)
   - Codex: AGENTS.md (global: ~/.codex/, local: project root)

All methods follow existing adapter patterns with consistent JSDoc comments and method placement.

## Decisions Made

### 1. Adapter Method Placement
**Choice:** Added getInstructionsPath() after getPathReference() method

**Why:** 
- Groups all path-related methods together
- Maintains consistency across all three adapters
- Follows existing adapter organization pattern

### 2. Delegation Pattern
**Choice:** All adapters delegate to instruction-paths.js utility function

**Why:**
- Follows existing pattern from platform-paths.js
- Keeps adapters thin and focused on transformation logic
- Centralizes path resolution rules for easier maintenance
- Single source of truth for instruction file locations

## Tasks Completed

### Task 1: Add ClaudeAdapter.getInstructionsPath() ✓
- **Commit:** b28c732 (from Plan 09-01)
- **Files:** bin/lib/platforms/claude-adapter.js
- **What:** Added import and method that returns CLAUDE.md paths
- **Verification:** Method exists, returns correct global/local paths

### Task 2: Add CopilotAdapter.getInstructionsPath() ✓
- **Commit:** 532a6ee
- **Files:** bin/lib/platforms/copilot-adapter.js
- **What:** Added import and method that returns copilot-instructions.md paths
- **Note:** Local path correctly includes .github/ subdirectory
- **Verification:** Method exists, returns correct paths with .github/

### Task 3: Add CodexAdapter.getInstructionsPath() ✓
- **Commit:** 2be44e1
- **Files:** bin/lib/platforms/codex-adapter.js
- **What:** Added import and method that returns AGENTS.md paths
- **Verification:** Method exists, returns correct global/local paths

## Integration Points

**Upstream Dependencies:**
- Requires `instruction-paths.js` from Plan 09-01 (already exists)
- Extends PlatformAdapter base class

**Downstream Consumers:**
- Plan 09-03: Orchestrator integration will call adapter.getInstructionsPath()
- installPlatformInstructions() function will use this method

**API Contract:**
```javascript
// All adapters now support:
adapter.getInstructionsPath(isGlobal: boolean) => string (absolute path)

// Example usage:
const adapter = new ClaudeAdapter();
const path = adapter.getInstructionsPath(false); // Returns [cwd]/CLAUDE.md
```

## Verification Results

**All Adapters Have Method:**
```
Claude method: function ✓
Copilot method: function ✓
Codex method: function ✓
```

**Global Paths (inside platform dirs):**
```
Claude:   ~/.claude/CLAUDE.md ✓
Copilot:  ~/.copilot/copilot-instructions.md ✓
Codex:    ~/.codex/AGENTS.md ✓
```

**Local Paths (scope-aware):**
```
Claude:   [cwd]/CLAUDE.md ✓
Copilot:  [cwd]/.github/copilot-instructions.md ✓ (includes .github/)
Codex:    [cwd]/AGENTS.md ✓
```

All paths are absolute and ready for file operations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ClaudeAdapter method already added**
- **Found during:** Task 1 execution
- **Issue:** ClaudeAdapter.getInstructionsPath() already existed in commit b28c732 (Plan 09-01)
- **Resolution:** Verified existing implementation was correct, proceeded with remaining tasks
- **Impact:** No code changes needed for Task 1
- **Rationale:** Plan 09-01 already completed this work, skipped duplicate implementation

No other deviations. Plan executed as written for remaining tasks.

## Next Phase Readiness

**Ready for Phase 9 Plan 03:** ✅ YES

**What's complete:**
- All three adapters have getInstructionsPath(isGlobal) method
- All methods return absolute paths
- All methods delegate to centralized utility
- Scope-aware paths working (local root vs .github/ vs platform dir)

**What's needed next:**
- Integrate adapter.getInstructionsPath() in orchestrator
- Call installPlatformInstructions() after installShared()
- Pass adapter instance to installation function

**No blockers or concerns.**

## Files Changed

```
Modified:
  bin/lib/platforms/claude-adapter.js    (added import + method, 10 lines) [already in 09-01]
  bin/lib/platforms/copilot-adapter.js   (added import + method, 10 lines)
  bin/lib/platforms/codex-adapter.js     (added import + method, 10 lines)
```

Total: 3 adapters updated with consistent API

## Testing Notes

**Manual verification performed:**
- Imported each adapter module successfully
- Instantiated each adapter class
- Called getInstructionsPath(true) and getInstructionsPath(false)
- Verified absolute paths returned
- Confirmed path endings match expected filenames
- Verified Copilot local path includes .github/ subdirectory

**Automated tests:**
- No unit tests added (following project pattern of integration tests)
- Integration tests will be added in Plan 09-04

## Performance Impact

**Runtime:** Minimal (simple delegation to utility function)
**Memory:** Negligible (no new data structures)
**Build:** No impact (no new dependencies)

## Documentation Impact

No user-facing documentation changes needed. This is internal API addition for orchestrator use.

**Internal documentation:**
- JSDoc comments added to all three methods
- Comments explain parameters and return values
- Comments specify which instruction file is returned

## Success Metrics

✅ All success criteria met:
- ClaudeAdapter has getInstructionsPath(isGlobal) method
- CopilotAdapter has getInstructionsPath(isGlobal) method  
- CodexAdapter has getInstructionsPath(isGlobal) method
- All methods import and delegate to getInstructionPath() utility
- Claude returns CLAUDE.md (global: ~/.claude/, local: root)
- Copilot returns copilot-instructions.md (global: ~/.copilot/, local: .github/)
- Codex returns AGENTS.md (global: ~/.codex/, local: root)
- All methods return absolute paths (include base directory)
- Method signatures consistent with existing adapter methods
- JSDoc comments follow existing adapter style

**Ready for orchestrator integration (Plan 09-03).**
