---
created: 2026-02-01T00:08
title: Update CHANGELOG and docs for v2.0.0
area: docs
files:
  - CHANGELOG.md
  - docs/
---

## Problem

The CHANGELOG.md for version 2.0.0 needs to include changes from phase 10 (gsd-archive-milestone and gsd-add-todo skill updates). Additionally, documentation files under docs/ that reference these skills need updating to reflect:

1. New features added to gsd-add-todo
2. Deprecated status of gsd-archive-milestone (now unified with gsd-complete-milestone)

These updates should appear as if they were part of the original 2.0.0 release, not as subsequent changes.

Context from phase 10:
- gsd-archive-milestone has been deprecated (shows notice, exits)
- gsd-complete-milestone now handles both completion and archiving
- gsd-add-todo has enhanced functionality

## Solution

1. Review CHANGELOG.md structure for v2.0.0 section
2. Add phase 10 changes to appropriate changelog categories (Added, Deprecated, Changed)
3. Identify all docs/ files mentioning gsd-archive-milestone or gsd-add-todo
4. Update docs to reflect current state as of v2.0.0
5. Ensure language reflects these as v2.0.0 features, not post-release updates

Note: May need confirmation on specific changelog formatting and which doc files to prioritize.
