---
created: 2026-01-27T23:38
completed: 2026-01-27T23:45
title: Clean unnecessary conditional block in repairManifest
area: validation
files:
  - bin/lib/manifests/repair.js:21-26
---

## Problem

The conditional block in `repairManifest` (lines 21-26) is now unnecessary after the refactoring in commit 84ea234:

```javascript
if (installDir.endsWith('get-shit-done')) {
  // Manifest is in get-shit-done directory
  // Keep installDir for version detection
  // But adjust scanDir for platform detection if needed
  scanDir = installDir;
}
```

This sets `scanDir = installDir`, but `scanDir` is already initialized to `installDir` on line 19, making this a no-op.

The original intent (commit 863326a) was to adjust installDir to parent directory, but this was reversed in the refactoring to support version detection. The conditional logic should be removed for clarity.

## Solution

Remove the dead code block and simplify the function logic. Since both `installDir` and `scanDir` should remain as `path.dirname(manifestPath)` for proper version detection and file scanning, the conditional is not needed.
