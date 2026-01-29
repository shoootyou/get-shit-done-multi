---
created: 2026-01-29T10:15
title: Add quoting for Codex frontmatter fields
area: installer
priority: high
files:
  - bin/lib/rendering/frontmatter-serializer.js
---

## Problem

Codex CLI shows warnings/errors when `argument-hint` and `description` fields are not quoted.

**Current output:**
```yaml
argument-hint: [domain]
description: Execute all plans in a phase
```

**Required for Codex:**
```yaml
argument-hint: "[domain]"
description: "Execute all plans in a phase"
```

**Severity:**
- `argument-hint`: ERROR (Codex fails to parse)
- `description`: Warning (nice to have for consistency)

Both should be treated with same priority for consistent output.

## Solution

Modify `frontmatter-serializer.js` to add Codex-specific quoting for these two fields:

1. Update `formatValue()` function to accept `platform` parameter
2. For Codex platform only: Always quote `argument-hint` and `description` fields with double quotes
3. Keep current behavior for Copilot and Claude platforms (unchanged)

### Implementation

In `frontmatter-serializer.js`:

1. Pass `platform` parameter through the formatting chain:
   - `serializeFrontmatter()` → `formatScalar()` → `formatValue()`
   - `formatObject()` → `formatValue()`

2. Add Codex-specific logic in `formatValue()`:
   ```js
   // Codex requires double-quoted argument-hint and description
   if (platform === 'codex' && (fieldName === 'argument-hint' || fieldName === 'description')) {
     return `"${value.replace(/"/g, '\\"')}"`;
   }
   ```

3. Remove the existing line 165 that says "argument-hint should never be quoted"

### Testing

Test with:
- Codex: argument-hint and description should be double-quoted
- Copilot: No change (current behavior preserved)
- Claude: No change (current behavior preserved)

Test in /tmp isolated directory.
