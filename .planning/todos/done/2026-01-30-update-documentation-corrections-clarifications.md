---
created: 2026-01-30T02:31
title: Update documentation with corrections and clarifications
area: docs
files:
  - docs/how-to-customize.md
  - docs/architecture.md
  - docs/README.md
  - README.md
---

## Problem

Multiple documentation files have inaccuracies or missing information that need correction:

**how-to-customize.md:**
1. Missing `--all` flag documentation for installing all 3 platforms simultaneously
2. `--version` flag incorrectly described (shows package version, not installed version)
3. Custom Paths implementation clarification needed:
   - Installs content directly in specified path (doesn't create .github subdirectory)
   - Cannot be used with multiple platforms (single platform only)
   - Designed for tools that use custom paths
4. "Partial Installation" section should be removed

**architecture.md:**
1. "Key Decisions" section is internal documentation, not relevant for end users
2. Test section should be removed (internal implementation details)

**docs/README.md:**
1. References `yourusername/get-shit-done-multi` instead of actual repo `shoootyou/get-shit-done-multi`
2. Need to check for other incorrect URL references throughout docs

**README.md (root):**
1. Commands link is broken
2. Verify if commands link is still needed (commands → skills migration completed)

## Solution

**how-to-customize.md:**
- Add `--all` flag to multi-platform section: `npx get-shit-done-multi --all` installs Claude, Copilot, and Codex
- Correct `--version` description: shows package version (from package.json), not installed version
- Update Custom Paths section:
  - Clarify it installs directly in path (no platform subdirectory creation)
  - Note restriction: single platform only, cannot combine with multiple platform flags
  - Explain use case: for tools with non-standard paths
- Remove entire "Partial Installation" section

**architecture.md:**
- Remove "Key Decisions" section
- Remove test-related sections

**docs/README.md & all docs:**
- Replace all occurrences of `yourusername/get-shit-done-multi` with `shoootyou/get-shit-done-multi`
- Search all .md files for incorrect repo URLs

**README.md (root):**
- Check commands link target
- If broken and outdated (commands → skills), remove link
- If needed, update to point to correct documentation
