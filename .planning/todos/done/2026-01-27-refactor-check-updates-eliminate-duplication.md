---
created: 2026-01-27T16:43
title: Refactor check-updates to eliminate repeated validation
area: tooling
files:
  - bin/lib/updater/check-update.js:20-150
---

## Problem

The `handleCheckUpdates` function in `check-update.js` has significant code duplication across three paths (custom, global, local). The validation logic (lines 36-62, 88-115, 122-150) is nearly identical, only differing in scope determination.

Current flow repeats the same pattern 3 times:
1. Find installations
2. Loop through found installations
3. Read manifest with repair
4. Compare versions
5. Format and display status

This makes the code harder to maintain and increases the risk of inconsistencies when updating validation logic.

## Solution

Refactor to extract validation into a reusable function:

**Proposed structure:**
```
handleCheckUpdates:
  1. Determine scopes to check:
     - If custom-path: use [{ type: 'custom', paths: [customPath] }]
     - Otherwise: [{ type: 'global', paths: [] }, { type: 'local', paths: [] }]
  
  2. For each scope:
     - Use logger.simpleTitle() to separate sections (e.g., "Global installations", "Local installations")
     - Call validateScopeInstallations(scopeType, paths, currentVersion, verbose)
     - validateScopeInstallations returns formatted results
```

**New function signature:**
```javascript
async function validateScopeInstallations(scopeType, paths, currentVersion, verbose) {
  // Find installations for scope
  // Loop and validate each
  // Return array of results with status
}
```

This reduces ~120 lines of duplicated code to a single reusable function, improving maintainability and consistency.

## Additional Task

Review and optimize recent commits (7b201c5, 2642192, eddd062):
- Commit 7b201c5: Banner management refactor
- Commit 2642192: Logger function optimization
- Commit eddd062: Error handling improvements and check-update.js creation

Use AskUser tool to propose optimizations for each commit's approach.
