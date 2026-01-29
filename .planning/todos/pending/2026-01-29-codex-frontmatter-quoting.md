---
created: 2026-01-29T10:15
title: Add quoting for Codex frontmatter fields
area: installer
files:
  - bin/lib/platforms/codex-adapter.js
  - bin/lib/rendering/yaml-serializer.js
---

## Problem

Currently the `argument-hint` field in skill frontmatter does not have single or double quotes by convention. However, Codex specifically requires quoted strings for:
- `argument-hint` field
- `description` field

This is a platform-specific requirement that needs to be handled in the Codex adapter or serializer to ensure proper parsing by the Codex CLI.

Example current output:
```yaml
argument-hint: <phase-number>
description: Execute all plans in a phase
```

Expected for Codex:
```yaml
argument-hint: '<phase-number>'
description: 'Execute all plans in a phase'
```

## Solution

Options to consider:
1. Modify `CodexAdapter.transformFrontmatter()` to quote these specific fields
2. Add Codex-specific quoting rules in the YAML serializer
3. Create a post-processing step for Codex frontmatter

Need to verify exact Codex requirements and choose approach that maintains platform isolation (per PLATFORM-02 architectural rule).
