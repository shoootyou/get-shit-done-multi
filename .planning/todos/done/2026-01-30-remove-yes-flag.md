---
created: 2026-01-30T01:58
title: Remove unused --yes flag from code and docs
area: docs
files:
  - docs/how-to-install.md:43,46,49,52,86,89,97
  - docs/how-to-upgrade.md
  - docs/how-to-customize.md
  - bin/install.js:59
---

## Problem

The `--yes` (and `-y`) flag is defined in the CLI argument parser but has no implementation - it doesn't skip any confirmation prompts. Documentation shows usage examples with this flag, misleading users about its functionality.

Multiple documentation files reference `--yes`:
- docs/how-to-install.md (lines 43, 46, 49, 52, 86, 89, 97)
- docs/how-to-upgrade.md
- docs/how-to-customize.md
- docs/troubleshooting.md
- Multiple internal planning/template files

## Solution

1. Remove `--yes` flag definition from bin/install.js:59
2. Remove all `--yes` examples from docs/how-to-install.md
3. Search and remove `--yes` from docs/how-to-upgrade.md, docs/how-to-customize.md, docs/troubleshooting.md
4. Check if any other user-facing documentation references need cleanup
5. Consider if prompts should actually be suppressible (if so, implement properly; if not, just remove)
