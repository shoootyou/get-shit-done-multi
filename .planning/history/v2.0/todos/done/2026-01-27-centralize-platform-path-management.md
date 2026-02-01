---
created: 2026-01-27T17:05
title: Centralize platform path management in dedicated module
area: tooling
files:
  - bin/lib/platforms/detector.js:20-27
  - bin/lib/platforms/claude-adapter.js:29
  - bin/lib/platforms/copilot-adapter.js:40-41
  - bin/lib/platforms/codex-adapter.js:40-41
  - bin/lib/version/installation-finder.js:63-72
  - bin/lib/updater/check-update.js:71-77
---

## Problem

Platform-specific paths (`.claude`, `.github`, `.codex`, `.copilot`) and shared paths (`get-shit-done`, `.gsd-install-manifest.json`) are currently hardcoded across ~10 files. This creates maintenance issues:

1. **Inconsistency risk**: Changing a path requires finding and updating multiple files
2. **No single source of truth**: Path logic scattered across adapters, detectors, and finders
3. **Not documented**: Path structure not reflected in architecture documentation
4. **Harder to extend**: Adding new platforms requires touching many files

Similar to how `platform-names.js` provides centralized name mapping, we need centralized path management.

## Solution

Create `bin/lib/platforms/platform-paths.js` module as single source of truth for all GSD paths:

```javascript
// Platform directory mappings
export const platformDirs = {
  claude: { global: '.claude', local: '.claude' },
  copilot: { global: '.copilot', local: '.github' },
  codex: { global: '.codex', local: '.codex' }
};

// Shared constants
export const SHARED_DIR = 'get-shit-done';
export const MANIFEST_FILE = '.gsd-install-manifest.json';

// Helper functions
export function getPlatformDir(platform, isGlobal)
export function getInstallPath(platform, isGlobal)
export function getManifestPath(platform, isGlobal)
export function getAllGlobalPaths()
export function getAllLocalPaths()
```

### Files to refactor:
1. **detector.js** - Use helpers instead of hardcoded joins
2. **claude/copilot/codex-adapter.js** - Use getPlatformDir() in getTargetDir()
3. **installation-finder.js** - Use getAllGlobalPaths()/getAllLocalPaths()
4. **check-update.js** - Use helpers in verbose messages
5. **Tests** - Update any path-based tests

### Documentation updates:
- Add section to ARCHITECTURE-DECISION.md explaining path management strategy
- Document relationship between platform-names.js, platform-paths.js, and adapters
- Update Phase 3 notes to reference centralized path management

## Benefits

1. **Single source of truth**: All paths defined in one place
2. **Easier maintenance**: Change paths once, works everywhere
3. **Better extensibility**: New platforms just add to platformDirs
4. **Documented**: Path structure clear in architecture docs
5. **Consistent with platform-names.js pattern**: Similar API style

## Scope

- **Effort**: ~3-4 hours (refactoring + tests + docs)
- **Risk**: Low - pure refactoring, no behavior changes
- **Testing**: Run existing tests, verify all platforms install correctly
- **Architecture impact**: Medium - reflects in documentation and establishes pattern
