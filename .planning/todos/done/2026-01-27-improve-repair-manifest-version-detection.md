---
created: 2026-01-27T22:15
completed: 2026-01-27T23:22
title: Improve repairManifest version detection
area: validation
files:
  - bin/lib/manifests/repair.js:15-95
  - templates/agents/versions.json
  - templates/skills/get-shit-done/*/version.json
  - templates/skills/gsd-*/version.json
---

## Problem

The `repairManifest` function currently sets version to 'unknown' and fails repair when it cannot determine the GSD version (lines 42, 60-68). This causes repair to fail even when version files exist in the installation directory.

The correct version file paths that should be checked:
- `.claude/agents/versions.json` (or similar for copilot/codex)
- `.claude/skills/get-shit-done/version.json` (or similar per platform)
- `.claude/skills/gsd-*/version.json` (any skill with version.json)

Current code doesn't attempt to read these version files during repair, making the repair process incomplete.

## Solution

Need to implement version detection logic in `repairManifest`:

1. Scan the installation directory for version files following the platform-specific structure
2. Check multiple locations (agents/versions.json, skills/get-shit-done/version.json, individual skill version.json)
3. Extract version from the first valid version file found
4. Fall back to 'unknown' only if no version files exist
5. Update validation process to use these rules consistently

Multiple approaches possible:
- Add version detection helper function
- Integrate with existing platform-paths utilities
- Create centralized version file resolver
