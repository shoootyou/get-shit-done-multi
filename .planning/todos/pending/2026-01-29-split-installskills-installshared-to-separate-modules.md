---
created: 2026-01-29T02:22
title: Split installSkills and installShared into separate modules
area: tooling
files:
  - bin/lib/installer/orchestrator.js:296-415
  - bin/lib/installer/orchestrator.js:416-480
  - bin/lib/installer/install-agents.js (reference pattern)
---

## Problem

Functions `installSkills()` and `installShared()` are still embedded in `orchestrator.js`, creating inconsistency with the refactored `installAgents()` which was already extracted to its own module (`install-agents.js`).

This makes the codebase harder to maintain and violates the single-responsibility principle established by the agents refactor.

Current state:
- `installAgents` → already in `bin/lib/installer/install-agents.js` ✅
- `installSkills` → still in `orchestrator.js:296-415` ❌
- `installShared` → still in `orchestrator.js:416-480` ❌

## Solution

Extract both functions following the same pattern used for `installAgents`:

1. Create `bin/lib/installer/install-skills.js` — extract `installSkills()` function
2. Create `bin/lib/installer/install-shared.js` — extract `installShared()` function
3. Update `orchestrator.js` — import and call extracted functions
4. Test installation in isolated `/tmp` directory:
   - `mkdir /tmp/gsd-install-test && cd /tmp/gsd-install-test`
   - Run full installation process
   - Verify skills and shared files installed correctly
5. Ensure all function signatures match original behavior

Reference pattern: See `install-agents.js` for module structure.
