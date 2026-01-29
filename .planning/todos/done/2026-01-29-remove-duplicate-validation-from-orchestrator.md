---
created: 2026-01-29T10:52
title: Remove duplicate validation from orchestrator
area: tooling
files:
  - bin/lib/installer/orchestrator.js:119-124
  - bin/lib/cli/install-loop.js:25-33
  - bin/lib/preflight/pre-flight-validator.js:7
  - bin/lib/validation/pre-install-checks.js:26-46
---

## Problem

Phase 7.1 introduced centralized pre-flight validation via `validateBeforeInstall()` in `install-loop.js`, but the old validation call from Phase 5 (`runPreInstallationChecks()`) was never removed from `orchestrator.js`. This creates **double validation**:

**Current flow (DUPLICATE):**
```
install-loop.js:25 → validateBeforeInstall()     [NEW - Phase 7.1]
   ↓
orchestrator.js:119 → runPreInstallationChecks() [OLD - Phase 5]
```

Both functions validate disk space, permissions, paths, and templates. This wastes CPU cycles and creates maintenance burden.

**Additional issues:**
1. `pre-flight-validator.js` imports `checkDiskSpace` but never uses it (reimplements inline)
2. Different disk space buffers: 50% (new) vs 10% (old) - inconsistent safety margins
3. Phase 7.1 goal was "single validation point" but we have two entry points

## Solution

**Preserve:** `validateBeforeInstall()` in install-loop (NEW Phase 7.1 orchestrator)  
**Remove:** `runPreInstallationChecks()` call from orchestrator.js (OLD Phase 5 code)

**Steps:**

1. **Remove old validation from orchestrator.js** (lines 118-127):
   ```diff
   - // === NEW: Pre-installation validation gate (Phase 5) ===
   - const validationResults = await runPreInstallationChecks(
   -   targetDir,
   -   templatesDir,
   -   isGlobal,
   -   platform
   - );
   -
   - // Use validation results to enhance existing installation detection
   - const { existingInstall, warnings } = validationResults;
   ```

2. **Remove unused import from pre-flight-validator.js** (line 7):
   ```diff
   - import { checkDiskSpace, checkWritePermissions } from '../validation/pre-install-checks.js';
   + import { checkWritePermissions } from '../validation/pre-install-checks.js';
   ```

3. **Move existing installation detection** (if needed):
   - Phase 7.1 pre-flight doesn't detect existing installs
   - May need to add this logic to orchestrator or keep minimal detection

4. **Test installation flow**:
   - Verify validation still runs (from install-loop only)
   - Confirm no double validation
   - Test in `/tmp` isolated directory

**Rationale:**
- Phase 7.1 goal: "Centralize all validation BEFORE installation begins"
- `validateBeforeInstall()` runs in install-loop BEFORE orchestrator executes
- orchestrator.js should only handle file processing (per Phase 7.1 design)
- Single validation point = better performance, clearer code

**Future consideration:**
- If `checkDiskSpace()` function has value, extract disk space logic from pre-flight-validator.js into reusable utility
- For now, inline implementation is fine (avoids premature abstraction)

---
completed: 2026-01-29T10:58
notes: |
  Successfully removed duplicate validation from orchestrator.js:
  - Removed runPreInstallationChecks() call (lines 118-127)
  - Removed validateTemplates() function (lines 199-214)
  - Removed unused checkDiskSpace import from pre-flight-validator.js
  - Preserved detectExistingInstallation() for existing install warnings
  - Tested full installation in /tmp isolated directory
  - All 29 skills, 13 agents, and shared directory installed successfully
  - Validation now runs ONCE in install-loop.js (pre-flight gate only)
