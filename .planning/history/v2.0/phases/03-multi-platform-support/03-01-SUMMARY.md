---
phase: 03-multi-platform-support
plan: 01
subsystem: platform-abstraction
tags: [adapter-pattern, registry, detection, cli-detection]
requires: [02-02-core-modules]
provides: [base-adapter-interface, adapter-registry, gsd-detector, binary-detector]
affects: [03-02-concrete-adapters, 03-03-orchestrator-integration]
tech-stack:
  added: []
  patterns: [adapter-pattern, singleton, factory]
key-files:
  created:
    - bin/lib/platforms/base-adapter.js
    - bin/lib/platforms/registry.js
    - bin/lib/platforms/detector.js
    - bin/lib/platforms/binary-detector.js
  modified: []
decisions:
  - id: PLATFORM-ABSTRACTION-01
    choice: "Base adapter as abstract interface, not parent class"
    rationale: "Each platform adapter will be isolated per PLATFORM-02 - no inheritance between Claude/Copilot/Codex adapters"
  - id: PLATFORM-ABSTRACTION-02
    choice: "Registry uses singleton pattern with Map storage"
    rationale: "Single registry instance across modules, efficient key-value lookup"
  - id: PLATFORM-ABSTRACTION-03
    choice: "GSD detection via .gsd-install-manifest.json check"
    rationale: "Reliable detection of prior installations, supports version tracking (Phase 6)"
  - id: PLATFORM-ABSTRACTION-04
    choice: "Binary detection separate from installation validation"
    rationale: "Binary presence used for recommendations only, not required for installation"
metrics:
  tasks: 4
  commits: 4
  files-created: 4
  files-modified: 0
  duration: 154
  completed: 2026-01-26
---

# Phase 3 Plan 1: Platform Foundation Summary

**One-liner:** Base adapter interface, singleton registry, GSD installation detector, and CLI binary detector for multi-platform support foundation.

## What Was Built

Created four foundational platform abstraction modules that establish the pattern for multi-platform support:

### 1. Base Adapter Interface (`base-adapter.js`)
- **PlatformAdapter** abstract class defining 6 required methods
- Methods: `getFileExtension()`, `getTargetDir()`, `getCommandPrefix()`, `transformTools()`, `transformFrontmatter()`, `getPathReference()`
- Each method throws descriptive error with platform name until implemented
- Pure JavaScript, no dependencies
- ESM exports for Wave 2 concrete adapters

### 2. Adapter Registry (`registry.js`)
- **AdapterRegistry** class with Map-based storage
- Methods: `register()`, `get()`, `has()`, `getSupportedPlatforms()`
- Singleton instance exported as `adapterRegistry`
- Prevents duplicate platform registration
- Descriptive errors for unknown platforms with supported list
- Wave 2 will register concrete adapters, Wave 3 will use for lookups

### 3. GSD Installation Detector (`detector.js`)
- **detectInstallations()** checks 6 paths (3 platforms × 2 scopes)
- Looks for `.gsd-install-manifest.json` in each platform directory
- Returns structured object: `{platform: {global: bool, local: bool, version: null}}`
- **getInstalledPlatforms()** helper returns simple array of installed platform names
- Uses `pathExists()` from existing file-operations module
- Currently detects presence only; version reading planned for Phase 6

### 4. CLI Binary Detector (`binary-detector.js`)
- **detectBinaries()** checks `which`/`where` for CLI availability
- 2-second timeout prevents hanging on missing binaries
- Cross-platform: Windows uses `where`, Unix uses `which`
- **getRecommendedPlatforms()** filters platforms by binary availability
- Used for recommendations only, NOT validation of installations

## Verification Results

All verification checks passed:

✅ **Directory structure:** 4 files created in `bin/lib/platforms/`
- base-adapter.js (1,946 bytes)
- registry.js (1,418 bytes)
- detector.js (1,881 bytes)
- binary-detector.js (1,243 bytes)

✅ **Base adapter:** Throws descriptive error when calling unimplemented methods
```
test: getFileExtension() must be implemented
```

✅ **Registry:** Singleton instance works, empty registry returns empty supported list
```
Unknown platform: nonexistent. Supported: 
```

✅ **GSD detection:** Checks all 3 platforms, found 1 global Claude installation
```javascript
{
  claude: { global: true, local: false, version: null },
  copilot: { global: false, local: false, version: null },
  codex: { global: false, local: false, version: null }
}
```

✅ **Binary detection:** Detected all 3 CLI tools in PATH
```javascript
{
  claude: true,
  copilot: true,
  codex: true
}
```

## Task Breakdown

| Task | Name                  | Commit  | Files Modified | Status |
|------|-----------------------|---------|----------------|--------|
| 1    | Create Base Adapter   | cae40b8 | base-adapter.js | ✅ Complete |
| 2    | Create Registry       | fdb454d | registry.js    | ✅ Complete |
| 3    | Create GSD Detector   | c0a7be8 | detector.js    | ✅ Complete |
| 4    | Create Binary Detector| 54d28b2 | binary-detector.js | ✅ Complete |

## Decisions Made

### 1. Base Adapter as Abstract Interface
**Decision:** Use abstract class pattern rather than actual inheritance
**Rationale:** Per PLATFORM-02 architectural rule, concrete adapters (Claude, Copilot, Codex) will be ISOLATED with NO inheritance between them. Base adapter defines the interface contract only. Code duplication is acceptable and preferred over coupling.

### 2. Registry Singleton Pattern
**Decision:** Single AdapterRegistry instance using Map storage
**Rationale:** Ensures consistent adapter lookup across all modules. Map provides efficient O(1) key-value access. Prevents registration conflicts via `has()` check.

### 3. GSD Detection via Manifest Files
**Decision:** Check for `.gsd-install-manifest.json` in platform directories
**Rationale:** Reliable way to detect prior installations. Manifest approach supports future version tracking (Phase 6 - VERSION-02). Works across platforms without dependency on external tools.

### 4. Binary Detection Separate from Validation
**Decision:** `detectBinaries()` used for recommendations, not validation
**Rationale:** Per PLATFORM-01B, binary presence suggests user intent but doesn't validate installation. User can install GSD for platform they don't have yet (preparing for future). Actual validation uses `detectInstallations()`.

## Deviations from Plan

None - plan executed exactly as written.

## Technical Insights

### Pattern Benefits
- **Adapter Pattern:** Clean separation between platform-agnostic orchestration and platform-specific logic
- **Singleton Registry:** Central lookup point prevents scattered adapter references
- **Detection Separation:** Binary detection (recommendations) vs GSD detection (validation) handles all use cases

### Cross-Platform Handling
Binary detector handles Windows vs Unix differences transparently:
- Windows: `where command`
- Unix: `which command`

Both have 2-second timeout to prevent hanging.

### Future-Proofing
- Version field in detection results ready for Phase 6
- TODO comment marks where version reading will be added
- Manifest-based detection supports rich metadata in future

## Integration Points

### Dependencies (Imports)
- `file-operations.js` → `pathExists()` for manifest checking
- Node.js built-ins: `os`, `path`, `child_process`, `util`

### Dependents (Will Import This)
- **Wave 2 (03-02):** Concrete adapters will extend PlatformAdapter and register with adapterRegistry
- **Wave 3 (03-03):** Orchestrator will use registry to get adapters, detectors for CLI prompts
- **Phase 4:** Interactive UX will use binary detection for recommendations

## Next Phase Readiness

### Blockers
None

### Concerns
None

### Recommendations
1. Wave 2 should create concrete adapters (ClaudeAdapter, CopilotAdapter, CodexAdapter)
2. Each adapter implements all 6 methods from base interface
3. Adapters register themselves on import
4. Follow isolation rule: no inheritance between concrete adapters

## Metrics

- **Execution Time:** 154 seconds (2 minutes 34 seconds)
- **Tasks Completed:** 4/4 (100%)
- **Commits:** 4 atomic commits
- **Files Created:** 4
- **Files Modified:** 0
- **Tests:** All verification checks passed

## Commits

1. `cae40b8` - feat(03-01): create PlatformAdapter base interface
2. `fdb454d` - feat(03-01): create AdapterRegistry singleton
3. `c0a7be8` - feat(03-01): create GSD installation detector
4. `54d28b2` - feat(03-01): create CLI binary detector

## Plan Completion

✅ **All success criteria met:**
- [x] 4 files created in bin/lib/platforms/
- [x] PlatformAdapter has 6 abstract methods with descriptive errors
- [x] AdapterRegistry singleton exported and usable
- [x] detectInstallations() checks 6 paths with structured results
- [x] detectBinaries() checks 3 CLIs with timeout handling
- [x] All modules use ESM imports/exports
- [x] All modules follow project conventions (JSDoc, error handling)
- [x] No test failures when importing and calling functions

**Status:** Plan 03-01 complete. Ready for Plan 03-02 (Concrete Platform Adapters).
