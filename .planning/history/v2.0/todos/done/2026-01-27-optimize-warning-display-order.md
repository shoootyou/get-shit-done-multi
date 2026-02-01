---
created: 2026-01-27T10:48
title: Optimize warning display order - collect all warnings in single block
area: tooling
files:
  - bin/lib/validation/pre-install-checks.js:70
  - bin/lib/installer/orchestrator.js:75-78
---

## Problem

Currently the warning display order is inconsistent:

**Current flow:**
1. `runPreInstallationChecks()` runs (line 56 in orchestrator.js)
2. During disk space check, warning displays immediately: `⚠ Could not check disk space...` (line 70 in pre-install-checks.js)
3. THEN the "Warnings" subtitle shows (line 75 in orchestrator.js)
4. THEN existing installation warnings display

**Result:** The disk space warning appears BEFORE the "Warnings" subtitle header, breaking the visual grouping.

**Expected:** All warnings should be collected and displayed together in a single block with the subtitle appearing first.

## Solution

Need to analyze alternatives:

**Option 1: Collect warnings in runPreInstallationChecks**
- Return warnings array from runPreInstallationChecks
- Display all warnings at once in orchestrator
- Pros: Single source of truth, clean separation
- Cons: Changes function signature

**Option 2: Move subtitle logic into pre-install-checks**
- Accept isVerbose parameter in runPreInstallationChecks
- Display subtitle before any warnings
- Pros: Self-contained warning display
- Cons: Mixing validation with presentation logic

**Option 3: Buffered logger with flush**
- Create warning buffer during validation
- Flush buffer in orchestrator after subtitle
- Pros: Flexible, maintains separation
- Cons: More complex, stateful logger

Use AskUser to analyze and choose approach.
