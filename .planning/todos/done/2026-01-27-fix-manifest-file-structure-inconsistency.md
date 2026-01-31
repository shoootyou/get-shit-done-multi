---
created: 2026-01-27T20:07:21
title: Fix manifest file structure inconsistency
area: versioning
files:
  - bin/lib/validation/manifest-generator.js:35
  - bin/lib/version/manifest-reader.js:63-86
---

## Problem

`generateAndWriteManifest` and `readManifestWithRepair` create different data structures for the `files` field in manifests:

**generateAndWriteManifest** (line 35):
```json
{
  "files": ["path1", "path2"]  // Array of strings
}
```

**readManifestWithRepair** repair (lines 63-86):
```json
{
  "files": [{"path": "path1"}, {"path": "path2"}]  // Array of objects
}
```

This inconsistency causes:
- Validation failures when comparing manifests
- Potential bugs in code expecting one format but receiving another
- Confusion about the "correct" manifest schema

The repair function was likely copying from old code that used object format, while the generator was updated to use simpler string format.

## Solution

Need to:
1. **Analyze** both functions and determine which format is correct (likely string array based on generator being newer)
2. **Decide** if these functions belong in their current locations or should be moved:
   - Currently: `manifest-generator.js` in `validation/` and `manifest-reader.js` in `version/`
   - Consider: unified `manifests/` module or keep separated by domain
3. **Propose 3+ optimization approaches** using ask_user tool
4. **Test** chosen approach in isolated /tmp directory
5. **Get confirmation** before implementing via ask_user tool

Constraints:
- Maintain backward compatibility if existing manifests exist
- Keep domain boundaries clear (validation vs versioning vs unified)
- Use ask_user tool for user decision on approach
