---
created: 2026-01-27T20:10:00
title: Centralize manifest error reasons
area: versioning
files:
  - bin/lib/manifests/schema.js
  - bin/lib/manifests/reader.js:17,32,46,56,65
  - bin/lib/manifests/repair.js:73
  - bin/lib/updater/validator.js:18
  - bin/lib/installer/orchestrator.js:329
  - bin/lib/cli/interactive.js:104
---

## Problem

Error reasons from `readManifest()` are defined as magic strings and compared with string literals:

**Current code:**
```javascript
// reader.js - defines strings
return { success: false, reason: 'not_found', manifest: null };
return { success: false, reason: 'corrupt', ... };

// validator.js - compares with strings
if (manifestResult.reason === 'corrupt' || manifestResult.reason === 'invalid_schema') {
  // repair logic
}
```

**Issues:**
- Typo-prone (easy to write 'corupt' instead of 'corrupt')
- No IDE autocomplete
- Hard to refactor (need find-replace all strings)
- No single source of truth
- Repeated in 5+ files

## Solution

**Option 2: Add to Schema Module** (Selected)

Add to `bin/lib/manifests/schema.js`:
1. Export `MANIFEST_ERRORS` constant object with all error codes
2. Add `isRepairableError(reason)` helper function
3. Update reader.js to use constants
4. Update repair.js to use constants
5. Update consumers (validator, orchestrator, interactive) to use constants and helper

**Benefits:**
- ✅ Single source of truth (alongside field definitions)
- ✅ Typo-proof (IDE autocomplete)
- ✅ Refactorable (change constant, all usages update)
- ✅ Helper functions for common checks
- ✅ Consistent with schema pattern we established

**Implementation:**
- Add ~20 lines to schema.js
- Update 5 files to use constants
- Optional: Add more helpers (isFatalError, getErrorMessage)

User confirmed: Proceed with Option 2
