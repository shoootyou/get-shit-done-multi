---
created: 2026-01-28T12:10
title: Refactor old version detection logic from install.js
area: tooling
files:
  - bin/install.js:87-122
  - bin/lib/version/old-version-detector.js
  - bin/lib/migration/migration-manager.js
---

## Problem

The old version detection and migration logic (lines 87-122) is currently embedded directly in `install.js`, making the entry point file less clean and harder to maintain. The logic includes:

1. Detection of old v1.x versions across all platforms
2. Display of warnings for detected old versions
3. Sequential migration of each platform with user prompts
4. Error handling for migration failures (user decline vs actual errors)
5. Success message after all migrations complete

This increases the complexity of the main entry point and mixes concerns (CLI orchestration + migration logic).

## Solution

**Goal:** Move old version detection and migration orchestration to a separate module while preserving:
- Execution order (must happen before interactive/non-interactive modes)
- Clean code in install.js
- Proper error handling and exit codes

**Three refactoring options to evaluate:**

### Option 1: Dedicated Migration Orchestrator Module
Create `bin/lib/migration/migration-orchestrator.js` with:
- `checkAndMigrateOldVersions(cwd, options)` function
- Encapsulates detection, prompts, sequential migration, error handling
- Returns result object: `{ migrationsPerformed: number, cancelled: boolean, error: string | null }`
- install.js calls once, handles exit codes based on result

**Pros:** Single entry point, complete encapsulation, testable
**Cons:** Adds one more module to migration/ directory

### Option 2: Enhance Migration Manager with Orchestration
Extend existing `bin/lib/migration/migration-manager.js` with:
- `checkAndMigrateAllPlatforms(cwd, options)` function
- Reuses existing `performMigration()` internally
- Handles detection + sequential migration loop
- Returns structured result

**Pros:** No new files, natural extension of existing module
**Cons:** Migration manager grows larger, mixed responsibilities (single platform vs all platforms)

### Option 3: Startup Hooks Module (Generic Pattern)
Create `bin/lib/cli/startup-hooks.js` for pre-installation checks:
- `runStartupHooks(cwd, options)` - executes array of hooks
- Register old version check as hook: `hooks.register('old-version-check', checkOldVersions)`
- Extensible for future pre-installation checks (permissions, disk space warnings, etc.)

**Pros:** Generic pattern, extensible for future needs, cleaner separation of concerns
**Cons:** Over-engineering for current needs, adds abstraction layer

## Recommendation per Option

**Option 1 (Recommended):** Best balance of clarity and simplicity. Creates clear ownership boundary (migration orchestration), keeps install.js clean, doesn't over-engineer.

**Option 2:** Acceptable if we want to minimize file count, but blurs single responsibility.

**Option 3:** Only if we anticipate multiple startup hooks in the future. Currently overkill.

## Implementation Steps (Option 1)

1. Create `bin/lib/migration/migration-orchestrator.js`
2. Move detection + migration loop logic from install.js
3. Export `checkAndMigrateOldVersions(cwd, options = {})`
4. Update install.js to import and call orchestrator
5. Add unit tests for orchestrator
6. Verify execution order preserved
